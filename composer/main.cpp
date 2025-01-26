//  Brief : Backend to gather all the events and analyze in realtime 
// Author : César Godinho
//   Date : 24/01/2025

#include <cstdint>
#include <mxbackend.h>
#include <mxtypes.h>
#include <numeric>
#include "../types.h"

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

private:
	std::uint64_t _cps;
	double _height_thr;
	std::uint64_t _width_thr;
	std::uint64_t _avg_window;
};

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

	subscribeEvent("nidaq::apd0_signal", [this](const auto* data, auto len, const auto* udata) {
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
				CountEvent event(buffer, peaks, peaks.size(), mulex::SysGetCurrentTime());
				std::vector<std::uint8_t> event_buffer = event.serialize();
				dispatchEvent("composer::count", event_buffer);
				_cps += peaks.size();
			}

			mulex::LogDebug("Peaks found: %llu.", peaks.size());
			// mulex::LogDebug("maw: %llu | w: %llu | h: %lf", _avg_window, _width_thr, _height_thr);
		});
	});
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
