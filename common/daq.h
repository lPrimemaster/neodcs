#pragma once
#include <NIDAQmx.h>
#include <cstdint>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>
#include <mxbackend.h>

// Handling NI Errors
struct NIError
{
	enum class Status
	{
		OK,
		WARN,
		ERROR
	} status;
	std::string message;

	operator bool() const
	{
		return status != Status::OK;
	}
};
NIError NIGetError(std::int32_t error);

// NI DAQ Common
std::uint32_t NIGetTaskNumChannels(TaskHandle task);

class NIDaq
{
public:
	NIDaq(mulex::MsgEmitter* log);
	~NIDaq();

public:
	static constexpr std::uint64_t SAMPLES_PER_CHANNEL = 10000;

public:
	void createTask(const char* name = "");
	std::string createAnalogInputChannel(const std::string& task, const std::string& channel, double rmin, double rmax, const std::string& virtual_name = "");
	std::string createCounterInputChannel(const std::string& task, const std::string& channel, const std::string& virtual_name = "");
	void setClockSampleTiming(const std::string& task, double rate);
	void registerCallback(const std::string& task, DAQmxEveryNSamplesEventCallbackPtr func, void* userdata);

	void startTask(const std::string& task);
	void stopTask(const std::string& task);
	void clearTask(const std::string& task);

	TaskHandle getTask(const std::string& task);
	uInt32 getTaskNumChannels(const std::string& task);
	std::vector<std::string> getTaskChannels(TaskHandle task);
	std::optional<std::string> getChannelAlias(const std::string& channel);

	std::vector<std::string> getDevices();
	bool gotError(std::int32_t error);

private:
	std::unordered_map<std::string, TaskHandle>  _tasks;
	std::unordered_map<std::string, std::string> _channel_alias;
	mulex::MsgEmitter* _log;
};
