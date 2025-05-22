//  Brief : Backend to gather all the events and analyze in realtime (tailored for Lisbon's DCS)
// Author : César Godinho
//   Date : 24/01/2025

#include <chrono>
#include <cstdint>
#include <filesystem>
#include <mxbackend.h>
#include <mxtypes.h>
#include <numeric>
#include <string>
#include <thread>
#include "../types.h"
#include "../common/compressor.h"
#include "../common/utils.h"

class Composer : public mulex::MxBackend
{
public:
	Composer(int argc, char* argv[]);
	~Composer();

	ADCBuffer convertEventData(const std::vector<std::uint8_t>& data);
	ADCBuffer smoothWaveform(const ADCBuffer& data, std::uint64_t window);
	std::vector<AnalogPeak> findAnalogPeaks(const ADCBuffer& data, double height, std::uint64_t width);
	std::tuple<double, double, double, double> getPositions();

	void startMeasurement(std::uint64_t runno);
	void stopMeasurement(std::uint64_t runno);

	void startWriteThread(std::uint64_t runno);
	void stopWriteThread();

	std::string getOutputFilename(std::uint64_t runno);
	void writeHeader(std::uint64_t runno);

	void writeEventToDisk(const CountEvent& event);

private:
	static constexpr std::uint64_t WRITE_INTERVAL = 5000;

private:
	std::uint64_t _cps;
	double _height_thr;
	std::uint64_t _width_thr;
	std::uint64_t _avg_window;

	std::mutex _events_mtx;
	std::stack<CountEvent> _events;

	std::unique_ptr<std::thread> _write_thread;
	std::atomic<bool> _write_thread_run;
	bool _write_compressed;
	std::ofstream _write_output;
	GZipCompressor _write_output_compressed;
	std::string _output_dir;
	std::string _output_prefix;

	WobbleTable _wobble_c1;
	WobbleTable _wobble_c2;
};

Composer::Composer(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	rdb["/user/composer/detection_thr/height"].create(mulex::RdbValueType::FLOAT64, 0.001); // height in volts
	rdb["/user/composer/detection_thr/width"].create(mulex::RdbValueType::UINT64, std::uint64_t(0)); // width in samples
	rdb["/user/composer/detection_thr/ma_window"].create(mulex::RdbValueType::UINT64, std::uint64_t(0)); // moving average window size
	
	rdb["/user/composer/cps"].create(mulex::RdbValueType::UINT64, std::uint64_t(0));
	rdb["/user/composer/output"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("output/"));
	rdb["/user/composer/output_prefix"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("dcs_measurement"));
	_output_dir = static_cast<mulex::mxstring<512>>(rdb["/user/composer/output"]).c_str();
	_output_prefix = static_cast<mulex::mxstring<512>>(rdb["/user/composer/output_prefix"]).c_str();

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

	registerEvent("composer::count");

	// Estimate raw counts per second on the rdb
	deferExec([this]() {
		rdb["/user/composer/cps"] = _cps;
		_cps = 0;
	}, 0, 1000);

	// Setup dependencies
	registerDependency("esp301.exe").onFail(mulex::MxRexDependencyManager::LOG_WARN);
	registerDependency("aidaq.exe").onFail(mulex::MxRexDependencyManager::LOG_WARN);
	registerDependency("runcont.exe").onFail(mulex::MxRexDependencyManager::LOG_WARN);

	registerRunStartStop(&Composer::startMeasurement, &Composer::stopMeasurement);

	auto calcWobbleTable = [this](const auto* data, auto len) -> auto {
		std::vector<std::uint8_t> buffer(data, data + len);

		const std::uint64_t table_size = buffer.size() / 3;
		std::vector<double> r(table_size / sizeof(double));
		std::vector<double> x(table_size / sizeof(double));
		std::vector<double> y(table_size / sizeof(double));

		return std::tuple{ r, x, y };
	};

	subscribeEvent("runcont::wtable_c1", [this, calcWobbleTable](const auto* data, auto len, const auto* udata) {
		auto [r, x, y] = calcWobbleTable(data, len);
		deferExec([this, r, x, y]() { _wobble_c1 = WobbleTable(r, x, y); });
	});
	subscribeEvent("runcont::wtable_c2", [this, calcWobbleTable](const auto* data, auto len, const auto* udata) {
		auto [r, x, y] = calcWobbleTable(data, len);
		deferExec([this, r, x, y]() { _wobble_c2 = WobbleTable(r, x, y); });
	});

	subscribeEvent("aidaq::apd0", [this](const auto* data, auto len, const auto* udata) {
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

				// Calculate positions
				auto [c1pos, c2pos, detpos, tabpos] = getPositions();

				// Calculate wobble at positions
				auto [wc1x, wc1y] = _wobble_c1.interp(c1pos);
				auto [wc2x, wc2y] = _wobble_c2.interp(c2pos);

				CountEvent event(
					peaks, 									   // waveform
					peaks.size(), 							   // counts
					buffer.soft_timestamp,					   // acquisition ts
					
					static_cast<double>(rdb["/user/pirani0"]), // pressure 0
					static_cast<double>(rdb["/user/pirani1"]), // pressure 1
					static_cast<double>(rdb["/user/pirani2"]), // pressure 2
					
					// TODO: (Cesar) Check what we have and were it is
					static_cast<double>(rdb["/user/angley"]),  // clinometer c1y
					0.0,									   // clinometer c2y
					static_cast<double>(rdb["/user/anglex"]),  // clinometer c1x
					0.0,									   // clinometer c2x
					
					c1pos,									   // C1 position
					c2pos,									   // C2 position
					detpos,									   // Detector position
					tabpos,									   // Table position

					0.0,									   // C1 temperature
					0.0,									   // C2 temperature
					
					wc1x,									   // C1 wobble x
					wc2x,									   // C2 wobble x
					wc1y,									   // C1 wobble y
					wc2y									   // C2 wobble y
				);

				if(_write_thread_run.load())
				{
					std::unique_lock lock(_events_mtx);
					_events.push(event);
				}

				dispatchEvent("composer::count", event.serialize());
				mulex::LogDebug("Peaks found: %llu.", peaks.size());
				_cps += peaks.size();
			}
		});
	});
}

Composer::~Composer()
{
	stopWriteThread();
}

void Composer::startMeasurement(std::uint64_t runno)
{
	// Clear events, even tho they should be empty at this point
	_events = std::stack<CountEvent>();
	startWriteThread(runno);
}

void Composer::stopMeasurement(std::uint64_t runno)
{
	stopWriteThread();
	log.info("Stop OK.");
}

std::string Composer::getOutputFilename(std::uint64_t runno)
{
	auto now = std::time(nullptr);
	auto now_lt = *std::localtime(&now);

	std::ostringstream oss;
	oss << std::put_time(&now_lt, "%d-%m-%Y_%H-%M-%S");
	std::string datetime = oss.str();
	std::string output_file =
		_output_dir + "/" +
		_output_prefix + "_" +
		datetime + "run_" +
		std::to_string(runno) + (_write_compressed ? ".csv.gzip" : ".csv");
	return output_file;
}

void Composer::writeHeader(std::uint64_t runno)
{
	auto now = std::time(nullptr);
	auto now_lt = *std::localtime(&now);
	std::ostringstream oss;
	oss << std::put_time(&now_lt, "%d-%m-%Y_%H-%M-%S");
	std::string datetime = oss.str();

	std::string header = 
		"# File generated by Composer\n"
		"# Timestamp  : " + datetime + "\n"
		"# Run number : " + std::to_string(runno) + "\n"
		"# Measurement: " + _output_prefix + "\n"
		"\n"
		"counts,acq_timestamp,ce_timestamp,"
		"pressure0,pressure1,pressure2,"
		"cli_c1_y,cli_c2_y,cli_c1_x,cli_c2_x,"
		"pos_c1,pos_c2,pos_det,pos_tab,"
		"temp_c1,temp_c2,"
		"wobble_c1_x,wobble_c2_x,wobble_c1_y,wobble_c2_y\n"
	;

	if(_write_compressed)
	{
		_write_output_compressed.write(header);
	}
	else
	{
		_write_output << header << std::flush;
	}
}

void Composer::writeEventToDisk(const CountEvent& event)
{
	std::string line = 
		std::to_string(event.counts) + "," +
		std::to_string(event.acq_timestamp) + "," +
		std::to_string(event.ce_timestamp) + "," +
		std::to_string(event.pressure0) + "," +
		std::to_string(event.pressure1) + "," +
		std::to_string(event.pressure2) + "," +
		std::to_string(event.cli_c1_y) + "," +
		std::to_string(event.cli_c2_y) + "," +
		std::to_string(event.cli_c1_x) + "," +
		std::to_string(event.cli_c2_x) + "," +
		std::to_string(event.pos_c1) + "," +
		std::to_string(event.pos_c2) + "," +
		std::to_string(event.pos_det) + "," +
		std::to_string(event.pos_tab) + "," +
		std::to_string(event.temp_c1) + "," +
		std::to_string(event.temp_c2) + "," +
		std::to_string(event.wobble_c1_x) + "," +
		std::to_string(event.wobble_c2_x) + "," +
		std::to_string(event.wobble_c1_y) + "," +
		std::to_string(event.wobble_c2_y) + "\n";

	if(_write_compressed)
	{
		_write_output_compressed.write(line);
	}
	else
	{
		_write_output << line << std::flush;
	}
}

void Composer::startWriteThread(std::uint64_t runno)
{
	_write_thread_run.store(true);
	_write_thread = std::make_unique<std::thread>([this, runno]() {
		// Open output
		std::string output_file = getOutputFilename(runno);

		if(!std::filesystem::exists(_output_dir))
		{
			if(!std::filesystem::create_directory(_output_dir))
			{
				log.error("Failed to create directory: %s", _output_dir.c_str());
				return;
			}
		}

		if(std::filesystem::exists(output_file))
		{
			log.error("File %s already exists.", output_file.c_str());
			log.error("Stopping write thread to avoid overwrite.");
			return;
		}

		if(_write_compressed)
		{
			if(!_write_output_compressed.open(output_file))
			{
				log.error("Failed to open output file. (%s)", output_file.c_str());
				return;
			}
		}
		else
		{
			_write_output.open(output_file);
			if(!_write_output.is_open())
			{
				log.error("Failed to open output file. (%s)", output_file.c_str());
				return;
			}
		}

		log.info("Output started.");
		log.info("Logging data to: %s", output_file.c_str());
		log.info("Write check interval: %llu ms.", WRITE_INTERVAL);

		writeHeader(runno);
		
		// Loop
		while(_write_thread_run)
		{
			// No need to use cv's
			// Just sporadicaly wakeup
			{
				std::unique_lock lock(_events_mtx);
				while(!_events.empty())
				{
					writeEventToDisk(_events.top());
					_events.pop();
				}
			}

			std::this_thread::sleep_for(std::chrono::milliseconds(WRITE_INTERVAL));
		}

		// We are stopping, empty last events
		std::unique_lock lock(_events_mtx);
		while(!_events.empty())
		{
			writeEventToDisk(_events.top());
			_events.pop();
		}

		// Close output
		if(_write_compressed)
		{
			_write_output_compressed.close();
		}
		else
		{
			_write_output.close();
		}
	});
}

void Composer::stopWriteThread()
{
	_write_thread_run.store(false);
	if(_write_thread && _write_thread->joinable())
	{
		_write_thread->join();
		_write_thread.reset();
	}
}

ADCBuffer Composer::convertEventData(const std::vector<std::uint8_t>& data)
{
	ADCBuffer buffer;
	std::memcpy(&buffer.soft_timestamp, data.data(), sizeof(std::int64_t));
	buffer.waveform.resize(((data.size() - sizeof(std::int64_t)) / sizeof(double)));
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
	for(std::uint64_t i = 1; i < data.waveform.size() - 1; i++)
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

std::tuple<double, double, double, double> Composer::getPositions()
{
	// This is a get command for the esp301.exe
	// TODO: (Cesar) Make public the Command interface so we can use it here
	std::uint8_t cmd = 0;

	// WARN: (Cesar) Omitting error checking!
	return std::make_tuple(
		std::get<1>(callUserRpc<double>("esp301.exe", CallTimeout(1000), std::uint8_t(0), cmd)), // c1
		std::get<1>(callUserRpc<double>("esp301.exe", CallTimeout(1000), std::uint8_t(1), cmd)), // c2
		std::get<1>(callUserRpc<double>("esp301.exe", CallTimeout(1000), std::uint8_t(2), cmd)), // det
		static_cast<double>(rdb["/user/runcont/table/position"])
	);
}

int main(int argc, char* argv[])
{
	Composer backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
