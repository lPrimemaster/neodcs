#include "daq.h"

NIError NIGetError(std::int32_t error)
{
	if(error != 0)
	{
		char buffer[2048];
		DAQmxGetExtendedErrorInfo(buffer, 2048);
		return { .status = error < 0 ? NIError::Status::ERROR : NIError::Status::WARN, .message = buffer };
	}
	return { .status = NIError::Status::OK };
}

std::vector<std::string> splitString(const std::string& str, char delim)
{
    std::vector<std::string> strings;
    size_t start;
    size_t end = 0;
    while ((start = str.find_first_not_of(delim, end)) != std::string::npos)
	{
        end = str.find(delim, start);
        strings.push_back(str.substr(start, end - start));
    }
    return strings;
}

std::string trimString(const std::string& str, const std::string& whitespace)
{
    const auto strBegin = str.find_first_not_of(whitespace);
    if (strBegin == std::string::npos)
	{
        return "";
	}
    const auto strEnd = str.find_last_not_of(whitespace);
    const auto strRange = strEnd - strBegin + 1;
    return str.substr(strBegin, strRange);
}

std::uint32_t NIGetTaskNumChannels(TaskHandle task)
{
	static std::unordered_map<TaskHandle, uInt32> _channel_count_cache;
	if(_channel_count_cache.find(task) == _channel_count_cache.end())
	{
		uInt32 tc;
		DAQmxGetTaskNumChans(task, &tc);
		_channel_count_cache[task] = tc;
	}
	return _channel_count_cache[task];
}

NIDaq::NIDaq(mulex::MsgEmitter* log) : _log(log) { }

NIDaq::~NIDaq() { }

void NIDaq::startTask(const std::string& task)
{
	if(gotError(DAQmxStartTask(getTask(task))))
	{
		_log->error("Failed to start task: %s.", task.c_str());
	}

	_log->info("Started task %s.", task.c_str());
}

void NIDaq::stopTask(const std::string& task)
{
	if(gotError(DAQmxStopTask(getTask(task))))
	{
		_log->error("Failed to stop task: %s.", task.c_str());
	}

	_log->info("Stopped task %s.", task.c_str());
}

void NIDaq::clearTask(const std::string& task)
{
	if(gotError(DAQmxClearTask(getTask(task))))
	{
		_log->error("Failed to clear task: %s.", task.c_str());
	}

	_log->info("Cleared task %s.", task.c_str());
}

TaskHandle NIDaq::getTask(const std::string& task)
{
	auto taskit = _tasks.find(task);
	if(taskit == _tasks.end())
	{
		_log->error("Failed to find task named: %s.", task.c_str());
		return nullptr;
	}
	return taskit->second;
}

uInt32 NIDaq::getTaskNumChannels(const std::string& task)
{
	uInt32 nchannels;
	if(gotError(DAQmxGetTaskNumChans(getTask(task), &nchannels)))
	{
		_log->error("Failed to fetch task number of channels.");
		return 0;
	}
	return nchannels;
}

std::vector<std::string> NIDaq::getTaskChannels(TaskHandle task)
{
	char buffer[4096];
	if(gotError(DAQmxGetTaskChannels(task, buffer, 4096)))
	{
		_log->error("Failed to fetch task channel names.");
		return {};
	}

	std::vector<std::string> channels = splitString(buffer, ',');
	for(std::string& channel : channels)
	{
		channel = trimString(channel);
	}
	return channels;
}

std::optional<std::string> NIDaq::getChannelAlias(const std::string& channel)
{
	if(_channel_alias.find(channel) == _channel_alias.end())
	{
		return std::nullopt;
	}
	return _channel_alias[channel];
}

bool NIDaq::gotError(std::int32_t error)
{
	NIError nierr = NIGetError(error);
	if(nierr.status == NIError::Status::ERROR)
	{
		_log->error("NI Error: %s.", nierr.message.c_str());
		return true;
	}
	// else if(nierr.status == NIError::Status::WARN)
	// {
	// 	log.warn("NI Warning: %s.", nierr.message.c_str());
	// 	return false;
	// }
	return false;
}

void NIDaq::createTask(const char* name)
{
	TaskHandle handle;
	if(gotError(DAQmxCreateTask(name, &handle)))
	{
		_log->error("Failed to create NI task.");
		return;
	}
	_tasks.emplace(name, handle);
}

std::string NIDaq::createAnalogInputChannel(const std::string& task, const std::string& channel, double rmin, double rmax, const std::string& virtual_name)
{
	TaskHandle taskh = getTask(task);
	if(!taskh) return "";

	if(gotError(DAQmxCreateAIVoltageChan(taskh, channel.c_str(), "", DAQmx_Val_Cfg_Default, rmin, rmax, DAQmx_Val_Volts, NULL)))
	{
		_log->error("Failed to create analog channel.");
		return "";
	}

	if(!virtual_name.empty())
	{
		_channel_alias[channel] = virtual_name;
	}

	auto channel_alias = getChannelAlias(channel);
	// registerEvent("nidaq::" + channel_alias.value_or(channel));
	//
	_log->info("Created analog input channel on hardware channel: %s.", channel.c_str());
	return channel_alias.value_or(channel);
}

std::string NIDaq::createCounterInputChannel(const std::string& task, const std::string& channel, const std::string& virtual_name)
{
	TaskHandle taskh = getTask(task);
	if(!taskh) return "";

	if(gotError(DAQmxCreateCICountEdgesChan(taskh, channel.c_str(), "", DAQmx_Val_Rising, 0, DAQmx_Val_CountUp)))
	{
		_log->error("Failed to create counter channel.");
		return "";
	}

	if(!virtual_name.empty())
	{
		_channel_alias[channel] = virtual_name;
	}

	auto channel_alias = getChannelAlias(channel);
	// registerEvent("nidaq::" + channel_alias.value_or(channel));
	//
	_log->info("Created counter input channel on hardware channel: %s.", channel.c_str());
	return channel_alias.value_or(channel);
}

void NIDaq::setClockSampleTiming(const std::string& task, double rate)
{
	TaskHandle taskh = getTask(task);
	if(!taskh) return;

	// Setting up for the internal clock
	if(gotError(DAQmxCfgSampClkTiming(taskh, "", rate, DAQmx_Val_Rising, DAQmx_Val_ContSamps, SAMPLES_PER_CHANNEL)))
	{
		_log->error("Failed to setup clock sample timing.");
		return;
	}

	_log->info("Created sampling clock for task %s with clock rate %.2lf [INTERNAL].", task.c_str(), rate);
}

void NIDaq::registerCallback(const std::string& task, DAQmxEveryNSamplesEventCallbackPtr func, void* userdata)
{
	TaskHandle taskh = getTask(task);
	if(!taskh) return;
	uInt32 nchannels = getTaskNumChannels(task);

	if(nchannels == 0)
	{
		_log->error("Failed to fetch task number of channels.");
		return;
	}

	if(gotError(DAQmxRegisterEveryNSamplesEvent(taskh, DAQmx_Val_Acquired_Into_Buffer, SAMPLES_PER_CHANNEL, 0, func, userdata)))
	{
		_log->error("Failed to register every N samples callback.");
		return;
	}

	_log->info("Registered user function callback for task: %s.", task.c_str());
}

std::vector<std::string> NIDaq::getDevices()
{
	char buffer[4096];
	if(!gotError(DAQmxGetSysDevNames(buffer, 4096)))
	{
		// Split on commas
		return splitString(buffer, ',');
	}

	_log->error("Failed to enumerate devices.");
	return {};
}

