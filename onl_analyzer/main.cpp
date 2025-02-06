//  Brief : Backend to online analyze the data and produce a simple spectrum
// Author : César Godinho
//   Date : 31/01/2025

#include <cstdint>
#include <mutex>
#include <mxbackend.h>
#include <optional>
#include "../types.h"

class Analyzer : public mulex::MxBackend
{
public:
	Analyzer(int argc, char* argv[]);
	~Analyzer();

	void addEvent(const ComposerOutputList& evt);
	std::optional<ComposerOutputList> fetchEvent();

	void analyze(const ComposerOutputList& evt);

private:
	std::queue<ComposerOutputList> _events;
	std::mutex 					   _events_mtx;
	std::condition_variable 	   _events_cv;

	std::unique_ptr<std::thread> _analyzer_thread;
	std::atomic<bool>			 _analyzer_running;

	std::mutex									  _output_mtx;
	std::vector<std::pair<double, std::uint64_t>> _output_increments;
	std::atomic<double>							  _output_start;
	std::atomic<double>							  _output_stop;
	std::atomic<double>							  _output_inc;
};

void Analyzer::addEvent(const ComposerOutputList& evt)
{
	{
		std::unique_lock lock(_events_mtx);
		_events.push(evt);
	}
	_events_cv.notify_one();
}

std::optional<ComposerOutputList> Analyzer::fetchEvent()
{
	std::unique_lock lock(_events_mtx);
	_events_cv.wait(lock);

	if(_events.empty())
	{
		return std::nullopt;
	}

	ComposerOutputList list;
	list = _events.front();
	_events.pop();
	return list;
}

void Analyzer::analyze(const ComposerOutputList& evt)
{
	std::unique_lock lock(_output_mtx);
	log.info("Analyze: %lf, %llu", evt.c2_pos, evt.counts);
	_output_increments.push_back({ evt.c2_pos, evt.counts });
}

Analyzer::Analyzer(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	rdb["/user/analyzer/update_interval"].create(mulex::RdbValueType::UINT64, std::uint64_t(1000)); // Update histogram every second
	std::uint64_t interval = rdb["/user/analyzer/update_interval"];
	
	registerEvent("analyzer::output");

	// deferExec([this]() {
	// 	static std::vector<std::uint8_t> buffer;
	// 	{
	// 		std::unique_lock lock(_output_mtx);
	// 		if(_output_increments.empty()) return;

	// 		buffer.resize((sizeof(double) + sizeof(std::uint64_t)) * _output_increments.size());

	// 		std::uint8_t* ptr = buffer.data();
	// 		for(const auto& pair : _output_increments)
	// 		{
	// 			std::memcpy(ptr, &pair.first , sizeof(double));		   ptr += sizeof(double);
	// 			std::memcpy(ptr, &pair.second, sizeof(std::uint64_t)); ptr += sizeof(std::uint64_t);
	// 			log.info("pf: %lf, ps: %llu", pair.first, pair.second);
	// 		}

	// 		_output_increments.clear();
	// 	}
	// 	dispatchEvent("analyzer::output", buffer);
	// }, 0, static_cast<std::int64_t>(interval));

	subscribeEvent("composer::output", [this](const auto* data, auto len, const auto* udata) {
		ComposerOutputList list;
		static std::vector<std::uint8_t> buffer(sizeof(double) + sizeof(std::uint64_t));
		std::memcpy(&list, data, sizeof(ComposerOutputList));
		std::memcpy(buffer.data(), &list.c2_pos, sizeof(double));
		std::memcpy(buffer.data() + sizeof(double), &list.counts, sizeof(std::uint64_t));
		dispatchEvent("analyzer::output", buffer);
		// log.info("Add: %lf, %llu", list.c2_pos, list.counts);
		//addEvent(list);
	});

	// _analyzer_running.store(true);
	// _analyzer_thread = std::make_unique<std::thread>([this]() {
	// 	while(_analyzer_running.load())
	// 	{
	// 		const std::optional<ComposerOutputList> list = fetchEvent();
			
	// 		if(!list.has_value())
	// 		{
	// 			break;
	// 		}

	// 		analyze(list.value());
	// 	}
	// });
}

Analyzer::~Analyzer()
{
	{
		std::unique_lock lock(_events_mtx);
		while(!_events.empty()) _events.pop();
	}
	_events_cv.notify_one();
	_analyzer_running.store(false);
	if(_analyzer_thread)
	{
		_analyzer_thread->join();
	}
}

int main(int argc, char* argv[])
{
	Analyzer backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
