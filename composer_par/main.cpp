//  Brief : Backend to gather all the events and analyze in realtime (tailored for Paris' DCS)
// Author : César Godinho
//   Date : 29/01/2025

#include <cstdint>
#include <filesystem>
#include <fstream>
#include <mutex>
#include <iomanip>
#include <ctime>
#include <mxbackend.h>
#include <mxtypes.h>
#include <sstream>
#include <string>
#include "../types.h"
#include "../common/compressor.h"

class Composer : public mulex::MxBackend
{
public:
	Composer(int argc, char* argv[]);
	~Composer();

	void startMeasurement(std::uint64_t runno);
	void stopMeasurement(std::uint64_t runno);
	void enqueueBinReadout(const CICountEvent& e);
	std::vector<CICountEvent> waitForNewBinReadout();

	ComposerOutputList createComposerOutputList(const CICountEvent& e);
	
	void cacheOutputLine(const std::string& line);
	void flushCacheToOutput();
	std::string listToOutputLine(const ComposerOutputList& list);
	void writeOutputLine(const std::string& line);
	void writeOutputLineRaw(const std::string& line);
	void writeOutputLineCompressed(const std::string& line);

	void openOutputFile(std::uint64_t runno);
	void closeOutputFile();

private:
	std::uint64_t _cps;
	std::queue<CICountEvent> _queue;
	std::condition_variable  _queue_cv;
	std::mutex				 _queue_mtx;
	std::thread				 _file_writer_thread;
	std::atomic<bool>		 _exp_running;

	std::string				 _output_folder;
	std::ofstream			 _output_file;
	GZipCompressor			 _output_file_compressed;
	bool					 _output_compressed;
	std::vector<std::string> _output_cache;
	std::uint16_t			 _output_cache_flush_size;
	std::mutex				 _output_mtx;
};


Composer::Composer(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	rdb["/user/composer/cps"].create(mulex::RdbValueType::UINT64, std::uint64_t(0));
	rdb["/user/composer/output_dir"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("output"));
	rdb["/user/composer/output_prefix"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("dcs_generic_exp"));
	rdb["/user/composer/compressed_output"].create(mulex::RdbValueType::BOOL, true);
	rdb["/user/composer/output_cache_size"].create(mulex::RdbValueType::UINT16, std::uint16_t(25));
	_output_cache_flush_size = rdb["/user/composer/output_cache_size"];

	// Estimate raw counts per second on the rdb
	deferExec([this]() {
		rdb["/user/composer/cps"] = _cps;
		_cps = 0;
	}, 0, 1000);

	registerEvent("composer::counts");

	registerEvent("composer::output");

	registerRunStartStop(&Composer::startMeasurement, &Composer::stopMeasurement);
}

void Composer::enqueueBinReadout(const CICountEvent& e)
{
	{
		std::unique_lock lock(_queue_mtx);
		_queue.push(e);
	}
	_queue_cv.notify_one();
}

std::vector<CICountEvent> Composer::waitForNewBinReadout()
{
	std::unique_lock lock(_queue_mtx);
	_queue_cv.wait(lock);

	if(!_exp_running) return {};

	std::vector<CICountEvent> output;
	output.reserve(_queue.size());

	while(!_queue.empty())
	{
		output.push_back(_queue.front());
		_queue.pop();
	}

	return output;
}

ComposerOutputList Composer::createComposerOutputList(const CICountEvent& e)
{
	ComposerOutputList list;

	list.soft_counts_timestamp = e.timestamp;
	list.counts = e.counts;

	list.soft_pos_timestamp = mulex::SysGetCurrentTime();
	list.c1_pos = rdb["/user/eib7/axis/0/position"];
	list.c2_pos = rdb["/user/eib7/axis/1/position"];
	list.table_pos = rdb["/user/xpsrld4/table/position"];
	list.det_pos = rdb["/user/xpsrld4/detector/position"];

	list.c2_moving = rdb["/user/xpsrld4/c2/moving"];

	list.temp_c1 = rdb["/user/temperature/c1"];
	list.temp_c2 = rdb["/user/temperature/c2"];

	return list;
}

void Composer::cacheOutputLine(const std::string& data)
{
	std::unique_lock lock(_output_mtx);
	_output_cache.push_back(data);
}

void Composer::flushCacheToOutput()
{
	std::string data;
	{
		std::unique_lock lock(_output_mtx);
		for(const auto& line : _output_cache)
		{
			data += line;
		}
		_output_cache.clear();
	}
	writeOutputLine(data);
}

std::string Composer::listToOutputLine(const ComposerOutputList& list)
{
	std::string line;
	line += std::to_string(list.soft_counts_timestamp) + ",";
	line += std::to_string(list.counts) + ",";
	line += std::to_string(list.soft_pos_timestamp) + ",";
	line += std::to_string(list.c1_pos) + ",";
	line += std::to_string(list.c2_pos) + ",";
	line += std::to_string(list.table_pos) + ",";
	line += std::to_string(list.det_pos) + ",";
	line += std::to_string(list.c2_moving) + ",";
	line += std::to_string(list.temp_c1) + ",";
	line += std::to_string(list.temp_c2) + "\n";
	return line;
}

void Composer::writeOutputLine(const std::string& line)
{
	if(_output_compressed)
	{
		writeOutputLineCompressed(line);
	}
	else
	{
		writeOutputLineRaw(line);
	}
}

void Composer::writeOutputLineCompressed(const std::string& data)
{
	_output_file_compressed.write(data);
}

void Composer::writeOutputLineRaw(const std::string& data)
{
	_output_file << data;
}

void Composer::openOutputFile(std::uint64_t runno)
{
	std::string output_dir = mulex::mxstring<512>(rdb["/user/composer/output_dir"]).c_str();
	std::string output_prefix = mulex::mxstring<512>(rdb["/user/composer/output_prefix"]).c_str();
	_output_compressed = rdb["/user/composer/compressed_output"];

	auto now = std::time(nullptr);
	auto now_lt = *std::localtime(&now);

	std::ostringstream oss;
	oss << std::put_time(&now_lt, "%d-%m-%Y_%H-%M-%S");
	std::string datetime = oss.str();

	std::string output_file = output_dir + "/" + output_prefix + "_" + datetime + "run_" + std::to_string(runno) + (_output_compressed ? ".csv.gzip" : ".csv");
	std::filesystem::create_directory(output_dir);
	if(!std::filesystem::is_directory(output_dir))
	{
		log.error("Failed to create output directory. Experiment list mode will not be saved!");
		return;
	}

	bool compressed_open = false;
	if(_output_compressed)
	{
		compressed_open = _output_file_compressed.open(output_file);
	}
	else
	{
		_output_file.open(output_file, std::ios_base::out);
	}

	if(!_output_file.is_open() && !compressed_open)
	{
		log.error("Failed to create output file. Experiment list mode will not be saved!");
	}
	else
	{
		log.info("Saving list mode data under: %s.", output_file.c_str());

		// Write the header
		writeOutputLine("count_timestamp,counts,meta_timestamp,pos_c1,pos_c2,pos_table,pos_det,c2_moving,temp_c1,temp_c2\n");
	}
}

void Composer::closeOutputFile()
{
	flushCacheToOutput();
	if(_output_compressed)
	{
		_output_file_compressed.close();
	}
	else
	{
		_output_file.close();
	}
}

Composer::~Composer()
{
	if(_exp_running)
	{
		mulex::LogError("Stopping the composer before experiment is done!");
		stopMeasurement(0);
	}
}

void Composer::startMeasurement(std::uint64_t runno)
{
	_exp_running.store(true);

	subscribeEvent("cidaq::counts", [this](const auto* data, auto len, const auto* udata) {
		std::vector<std::uint8_t> buffer(data, data + len);
		CICountEvent e;
		std::memcpy(&e.timestamp, buffer.data(), sizeof(std::int64_t));
		std::memcpy(&e.counts, buffer.data() + sizeof(std::int64_t), sizeof(std::uint64_t));

		// Issue a new line everytime we get counts from the daq
		enqueueBinReadout(e);
	});

	_file_writer_thread = std::thread([this, runno](){
		openOutputFile(runno);
		static std::vector<std::uint8_t> buffer(sizeof(ComposerOutputList));

		while(true)
		{
			// Do something when new bins come in
			std::vector<CICountEvent> counts = waitForNewBinReadout();

			if(counts.empty())
			{
				// We want to stop
				break;
			}

			// I.e. populate ComposerOutputList and write a file
			{
				std::unique_lock lock(_output_mtx);
				for(const auto& count : counts)
				{
					const ComposerOutputList list = createComposerOutputList(count);
					cacheOutputLine(listToOutputLine(list));

					std::memcpy(buffer.data(), &list, sizeof(ComposerOutputList));

					dispatchEvent("composer::output", buffer);
				}
			}

			// Check cache and trigger write
			if(_output_cache.size() >= _output_cache_flush_size)
			{
				// deferExec([this](){
				flushCacheToOutput();
				// });
			}
		}

		closeOutputFile();
	});
}

void Composer::stopMeasurement(std::uint64_t runno)
{
	unsubscribeEvent("cidaq::counts");
	_exp_running.store(false);
	_queue_cv.notify_one();
	_file_writer_thread.join();
}

int main(int argc, char* argv[])
{
	Composer backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
