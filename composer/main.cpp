//  Brief : Backend to gather all the events and analyze in realtime 
// Author : César Godinho
//   Date : 24/01/2025

#include <cstdint>
#include <mxbackend.h>
#include <mxtypes.h>
#include <numeric>
#include <thread>
#include "../types.h"
#include "../common/math.h"

class Composer : public mulex::MxBackend
{
public:
	Composer(int argc, char* argv[]);
	~Composer();

	ADCBuffer convertEventData(const std::vector<std::uint8_t>& data);
	ADCBuffer smoothWaveform(const ADCBuffer& data, std::uint64_t window);
	std::vector<AnalogPeak> findAnalogPeaks(const ADCBuffer& data, double height, std::uint64_t width);

	void startMeasurement(std::uint64_t runno);
	void stopMeasurement(std::uint64_t runno);

	double clinometerIncrementAverage(double value, double& average, std::uint64_t& n);
	double clinometerReadAverage(double& average, std::uint64_t& n);

private:
	std::uint64_t _cps;
	double _height_thr;
	std::uint64_t _width_thr;
	std::uint64_t _avg_window;

	std::mutex    _clinometer_mtx;
	double 	      _clinometer0_x;
	std::uint64_t _clinometer0_x_n;

	double 	      _clinometer0_y;
	std::uint64_t _clinometer0_y_n;
};

double Composer::clinometerIncrementAverage(double value, double& average, std::uint64_t& n)
{
	std::unique_lock lock(_clinometer_mtx);
	average *= n;
	average += value;
	average /= ++n;
	return average;
}

double Composer::clinometerReadAverage(double& average, std::uint64_t& n)
{
	std::unique_lock lock(_clinometer_mtx);
	double out = average;
	average = 0.0;
	n = 0;
	return out;
}

static double ClinometerVoltageToDeg(double value)
{
	// [0, 5] -> [-10, 10]
	constexpr double gain = 4.0;
	constexpr double bias = -10.0;
	return value * gain + bias;
}

Composer::Composer(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	rdb["/user/composer/detection_thr/height"].create(mulex::RdbValueType::FLOAT64, 0.001); // height in volts
	rdb["/user/composer/detection_thr/width"].create(mulex::RdbValueType::UINT64, std::uint64_t(0)); // width in samples
	rdb["/user/composer/detection_thr/ma_window"].create(mulex::RdbValueType::UINT64, std::uint64_t(0)); // moving average window size
	
	rdb["/user/composer/cps"].create(mulex::RdbValueType::UINT64, std::uint64_t(0));

	_height_thr = rdb["/user/composer/detection_thr/height"];
	_width_thr = rdb["/user/composer/detection_thr/width"];
	_avg_window = rdb["/user/composer/detection_thr/ma_window"];

	rdb["/user/composer/detection_thr/height"].watch([this](const auto& key, const auto& value) {
		deferExec([this, value]() { _height_thr = value; }); // avoid thread races
	});
	rdb["/user/composer/detection_thr/width"].watch([this](const auto& key, const auto& value) {
		deferExec([this, value]() { _width_thr = value; }); // avoid thread races
	});
	rdb["/user/composer/detection_thr/ma_window"].watch([this](const auto& key, const auto& value) {
		deferExec([this, value]() { _avg_window = value; }); // avoid thread races
	});

	// Estimate raw counts per second on the rdb
	deferExec([this]() {
		rdb["/user/composer/cps"] = _cps;
		_cps = 0;
	}, 0, 1000);

	registerEvent("composer::count");

	registerRunStartStop(&Composer::startMeasurement, &Composer::stopMeasurement);

	subscribeEvent("aidaq::apd0_signal", [this](const auto* data, auto len, const auto* udata) {
		ADCBuffer buffer = convertEventData(std::vector<uint8_t>(data, data + len));
		deferExec([this, buffer]() {
			ADCBuffer waveform;
			if(_avg_window > 0)
			{
				waveform = smoothWaveform(buffer, _avg_window);
			}
			else
			{
				waveform = buffer;
			}

			std::vector<AnalogPeak> peaks = findAnalogPeaks(waveform, _height_thr, _width_thr);

			if(peaks.size() > 0)
			{
				// Found peaks on APD 0!
				// Issue count events
				CountEvent event(peaks, peaks.size(), mulex::SysGetCurrentTime());
				std::vector<std::uint8_t> event_buffer = event.serialize();
				mulex::LogDebug("Peaks found: %llu. Buffer size: %llu.", peaks.size(), event_buffer.size());
				dispatchEvent("composer::count", event_buffer);
				_cps += peaks.size();
			}

			// mulex::LogDebug("maw: %llu | w: %llu | h: %lf", _avg_window, _width_thr, _height_thr);
		});
	});

	registerEvent("composer::dummy");
	// deferExec([this]() {
	// 	std::thread([this](){
	// 		while(true)
	// 		{
	// 			static std::vector<std::uint8_t> buffer(10240000);
	// 			dispatchEvent("composer::dummy", buffer);
	// 			std::this_thread::sleep_for(std::chrono::milliseconds(1000));
	// 		}
	//     }).detach();
	// }, 1000);

	deferExec([this](){
		static std::vector<std::uint8_t> buffer(10240000);
		dispatchEvent("composer::dummy", buffer);
	}, 0, 1000);

	rdb["/user/clinometer/0/x"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/clinometer/0/y"].create(mulex::RdbValueType::FLOAT64, 0.0);

	subscribeEvent("aidaq::clinometerx", [this](const auto* data, auto len, const auto* udata) {
		ADCBuffer buffer = convertEventData(std::vector<uint8_t>(data, data + len));

		// Try and use the rdb
		// rdb["/user/clinometer/0/x"] = ClinometerVoltageToDeg(MathAverageArray(buffer.waveform));
		clinometerIncrementAverage(ClinometerVoltageToDeg(MathAverageArray(buffer.waveform)), _clinometer0_x, _clinometer0_x_n);
	});

	subscribeEvent("aidaq::clinometery", [this](const auto* data, auto len, const auto* udata) {
		ADCBuffer buffer = convertEventData(std::vector<uint8_t>(data, data + len));

		// Try and use the rdb
		// rdb["/user/clinometer/0/y"] = ClinometerVoltageToDeg(MathAverageArray(buffer.waveform));
		clinometerIncrementAverage(ClinometerVoltageToDeg(MathAverageArray(buffer.waveform)), _clinometer0_y, _clinometer0_y_n);
	});

	// Average over 500 ms
	deferExec([this](){
		if(_clinometer0_x_n > 0) rdb["/user/clinometer/0/x"] = clinometerReadAverage(_clinometer0_x, _clinometer0_x_n);
		if(_clinometer0_y_n > 0) rdb["/user/clinometer/0/y"] = clinometerReadAverage(_clinometer0_y, _clinometer0_y_n);
	}, 0, 500);
}

Composer::~Composer()
{
}

void Composer::startMeasurement(std::uint64_t runno)
{
}

void Composer::stopMeasurement(std::uint64_t runno)
{
}

ADCBuffer Composer::convertEventData(const std::vector<std::uint8_t>& data)
{
	ADCBuffer buffer;

	std::memcpy(&buffer.soft_timestamp, data.data(), sizeof(std::int64_t));
	buffer.waveform.resize((data.size() / sizeof(double)) - 1); // Given sizeof(std::int64_t) == sizeof(double)
	std::memcpy(buffer.waveform.data(), data.data() + sizeof(std::int64_t), buffer.waveform.size() * sizeof(double));

	return buffer;
}

ADCBuffer Composer::smoothWaveform(const ADCBuffer& data, std::uint64_t window)
{
	if(window % 2 == 0)
	{
		mulex::LogError("Smoothing waveform requires an odd window.");
		return data;
	}

	ADCBuffer out;
	out.soft_timestamp = data.soft_timestamp;
	out.waveform.reserve(data.waveform.size());
	std::uint64_t hwindow = window / 2;
	for(std::uint64_t i = 0; i < data.waveform.size(); i++)
	{
		std::uint64_t start = (i >= hwindow) ? i - hwindow : 0;
		std::uint64_t end   = (i + hwindow < data.waveform.size()) ? i + hwindow : data.waveform.size() - 1;
		double avg = std::accumulate(data.waveform.begin() + start, data.waveform.begin() + end + 1, 0.0) / (end - start + 1);	
		out.waveform.push_back(avg);
	}

	return out;
}

std::vector<AnalogPeak> Composer::findAnalogPeaks(const ADCBuffer& data, double height, std::uint64_t width)
{
	std::vector<AnalogPeak> output;
	for(std::uint64_t i = 0; i < data.waveform.size() - 1; i++)
	{
		if(data.waveform[i] > data.waveform[i - 1] && data.waveform[i] > data.waveform[i + 1])
		{
			double h = data.waveform[i];
			std::uint64_t l = i;
			std::uint64_t r = i;

			while(l > 0 && data.waveform[l] > data.waveform[l - 1]) --l;
			while(r < data.waveform.size() - 1 && data.waveform[r] > data.waveform[r + 1]) ++r;
			std::uint64_t w = r - l + 1;

			if(h >= height && w >= width)
			{
				AnalogPeak peak;
				peak.pos = i;
				peak.height = h;
				peak.width = w;
				output.push_back(peak);
			}
		}
	}
	return output;
}

int main(int argc, char* argv[])
{
	Composer backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
