//  Brief : Backend to online analyze the data and produce a simple spectrum
// Author : César Godinho
//   Date : 31/01/2025

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

	std::unique_ptr<std::thread>   _analyzer_thread;
	std::atomic<bool>			   _analyzer_running;
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
}

Analyzer::Analyzer(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	subscribeEvent("composer::output", [this](const auto* data, auto len, const auto* udata) {
		ComposerOutputList list;
		std::memcpy(&list, data, sizeof(ComposerOutputList));
		addEvent(list);
	});

	_analyzer_running.store(true);
	_analyzer_thread = std::make_unique<std::thread>([this]() {
		while(_analyzer_running.load())
		{
			const std::optional<ComposerOutputList> list = fetchEvent();
			
			if(!list.has_value())
			{
				break;
			}

			analyze(list.value());
		}
	});
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
