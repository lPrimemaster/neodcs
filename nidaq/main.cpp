#include <NIDAQmx.h>
#include <cstdint>
#include <optional>
#include <span>
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

static NIError NIGetError(std::int32_t error)
{
	if(error != 0)
	{
		char buffer[2048];
		DAQmxGetExtendedErrorInfo(buffer, 2048);
		return { .status = error < 0 ? NIError::Status::ERROR : NIError::Status::WARN, .message = buffer };
	}
	return { .status = NIError::Status::OK };
}

std::vector<std::string> splitString(const std::string& str, char delim = ',')
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

std::string trimString(const std::string& str, const std::string& whitespace = " \t")
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

static uInt32 NIGetTaskNumChannels(TaskHandle task)
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

class NIDaq : public mulex::MxBackend
{
public:
	NIDaq(int argc, char* argv[]);
	~NIDaq();

	// Pass by value is important here. Do not modify
	void dispatchChannelEvents(TaskHandle task, std::vector<double> data, std::uint64_t timestamp, uInt32 nchannels);

public:
	static constexpr std::uint64_t SAMPLES_PER_CHANNEL = 1000;

private:
	void createTask(const char* name = "");
	void createAnalogInputChannel(const std::string& task, const std::string& channel, double rmin, double rmax, const std::string& virtual_name = "");
	void setClockSampleTiming(const std::string& task, double rate);
	void registerCallback(const std::string& task, DAQmxEveryNSamplesEventCallbackPtr func);

	inline void startTask(const std::string& task);
	inline void stopTask(const std::string& task);
	inline void clearTask(const std::string& task);

	inline TaskHandle getTask(const std::string& task);
	inline uInt32 getTaskNumChannels(const std::string& task);
	inline std::vector<std::string> getTaskChannels(TaskHandle task);
	inline std::optional<std::string> getChannelAlias(const std::string& channel);

	std::vector<std::string> getDevices();
	bool gotError(std::int32_t error);

private:
	std::unordered_map<std::string, TaskHandle>  _tasks;
	std::unordered_map<std::string, std::string> _channel_alias;
};

static int32 NIVoltageCallback(TaskHandle task, int32 everyNsamplesEventType, uInt32 nSamples, void* userData)
{
	uInt32 nchannels = NIGetTaskNumChannels(task);
	NIDaq* instance = reinterpret_cast<NIDaq*>(userData);

	static std::vector<double> data(NIDaq::SAMPLES_PER_CHANNEL * nchannels, 0.0);

	int32 samplesRead;
	NIError error = NIGetError(
		DAQmxReadAnalogF64(
			task,
			NIDaq::SAMPLES_PER_CHANNEL,
			DAQmx_Val_WaitInfinitely,
			DAQmx_Val_GroupByChannel,
			data.data(),
			nchannels * NIDaq::SAMPLES_PER_CHANNEL,
			&samplesRead,
			nullptr
	));

	// Use software timestamp
	std::int64_t timestamp = mulex::SysGetCurrentTime();

	if(error)
	{
		mulex::LogError("Failed to get samples.");
		mulex::LogError("Extended error: %s.", error.message.c_str());
		DAQmxStopTask(task);
		return 0;
	}

	// No error continue
	if(samplesRead > 0)
	{
		// Dispatch each channel event
		instance->deferExec([instance, nchannels, task, timestamp]() { instance->dispatchChannelEvents(task, data, timestamp, nchannels); });
	}

	return 0;
}

NIDaq::NIDaq(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	createTask("dcs_analog");

	// This backend also declared the signals onto the rdb for other backends to use
	rdb["/user/signals/apd0_signal/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai0"));
	rdb["/user/signals/apd1_signal/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai1"));
	rdb["/user/signals/clinometerx/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai2"));
	rdb["/user/signals/clinometery/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai3"));

	mulex::mxstring<512> apd0_hc = rdb["/user/signals/apd0_signal/hardware_channel"];
	mulex::mxstring<512> apd1_hc = rdb["/user/signals/apd1_signal/hardware_channel"];
	mulex::mxstring<512> clix_hc = rdb["/user/signals/clinometerx/hardware_channel"];
	mulex::mxstring<512> cliy_hc = rdb["/user/signals/clinometery/hardware_channel"];

	createAnalogInputChannel("dcs_analog", apd0_hc.c_str(), -10.0, 10.0, "apd0_signal");
	createAnalogInputChannel("dcs_analog", apd1_hc.c_str(), -10.0, 10.0, "apd1_signal");
	createAnalogInputChannel("dcs_analog", clix_hc.c_str(),   0.0,  5.0, "clinometerx");
	createAnalogInputChannel("dcs_analog", cliy_hc.c_str(),   0.0,  5.0, "clinometery");

	rdb["/user/nidaq/sample_rate"].create(mulex::RdbValueType::FLOAT64, 250000.0);
	setClockSampleTiming("dcs_analog", rdb["/user/nidaq/sample_rate"]);

	registerCallback("dcs_analog", NIVoltageCallback);

	startTask("dcs_analog");
}

NIDaq::~NIDaq()
{
	stopTask("dcs_analog");
}

static void CopyDoubleVectorToBytes(const std::span<double>& data, std::vector<uint8_t>& buffer, std::uint64_t offset)
{
	if(buffer.size() < data.size() * sizeof(double) + offset)
	{
		mulex::LogError("Buffer size too small to copy data.");
		return;
	}

	std::memcpy(buffer.data() + offset, data.data(), data.size() * sizeof(double));
}

void NIDaq::dispatchChannelEvents(TaskHandle task, std::vector<double> data, std::uint64_t timestamp, uInt32 nchannels)
{
	static std::vector<std::uint8_t> buffer(sizeof(double) * SAMPLES_PER_CHANNEL + sizeof(std::uint64_t));

	std::uint64_t start = 0;
	for(const std::string& channel : getTaskChannels(task))
	{
		std::memcpy(buffer.data(), &timestamp, sizeof(std::uint64_t));
		CopyDoubleVectorToBytes(std::span<double>(data.data() + start, SAMPLES_PER_CHANNEL), buffer, sizeof(std::uint64_t));
		auto channel_alias = getChannelAlias(channel);
		dispatchEvent("nidaq::" + channel_alias.value_or(channel), buffer);
		start += SAMPLES_PER_CHANNEL;
	}
}

inline void NIDaq::startTask(const std::string& task)
{
	if(gotError(DAQmxStartTask(getTask(task))))
	{
		log.error("Failed to start task: %s.", task.c_str());
	}
	log.info("Started task %s.", task.c_str());
}

inline void NIDaq::stopTask(const std::string& task)
{
	if(gotError(DAQmxStopTask(getTask(task))))
	{
		log.error("Failed to stop task: %s.", task.c_str());
	}
	log.info("Stopped task %s.", task.c_str());
}

inline void NIDaq::clearTask(const std::string& task)
{
	if(gotError(DAQmxClearTask(getTask(task))))
	{
		log.error("Failed to clear task: %s.", task.c_str());
	}
	log.info("Cleared task %s.", task.c_str());
}

inline TaskHandle NIDaq::getTask(const std::string& task)
{
	auto taskit = _tasks.find(task);
	if(taskit == _tasks.end())
	{
		log.error("Failed to find task named: %s.", task.c_str());
		return nullptr;
	}
	return taskit->second;
}

inline uInt32 NIDaq::getTaskNumChannels(const std::string& task)
{
	uInt32 nchannels;
	if(gotError(DAQmxGetTaskNumChans(getTask(task), &nchannels)))
	{
		log.error("Failed to fetch task number of channels.");
		return 0;
	}
	return nchannels;
}

inline std::vector<std::string> NIDaq::getTaskChannels(TaskHandle task)
{
	char buffer[4096];
	if(gotError(DAQmxGetTaskChannels(task, buffer, 4096)))
	{
		log.error("Failed to fetch task channel names.");
		return {};
	}

	std::vector<std::string> channels = splitString(buffer, ',');
	for(std::string& channel : channels)
	{
		channel = trimString(channel);
	}
	return channels;
}

inline std::optional<std::string> NIDaq::getChannelAlias(const std::string& channel)
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
		log.error("NI Error: %s.", nierr.message.c_str());
		return true;
	}
	else if(nierr.status == NIError::Status::WARN)
	{
		log.warn("NI WARN: %s.", nierr.message.c_str());
		return false;
	}

	return false;
}

void NIDaq::createTask(const char* name)
{
	TaskHandle handle;
	if(gotError(DAQmxCreateTask(name, &handle)))
	{
		log.error("Failed to create NI task.");
		return;
	}
	_tasks.emplace(name, handle);
}

void NIDaq::createAnalogInputChannel(const std::string& task, const std::string& channel, double rmin, double rmax, const std::string& virtual_name)
{
	TaskHandle taskh = getTask(task);
	if(!taskh) return;

	if(gotError(DAQmxCreateAIVoltageChan(taskh, channel.c_str(), "", DAQmx_Val_Cfg_Default, rmin, rmax, DAQmx_Val_Volts, NULL)))
	{
		log.error("Failed to create analog channel.");
		return;
	}

	if(!virtual_name.empty())
	{
		_channel_alias[channel] = virtual_name;
	}

	auto channel_alias = getChannelAlias(channel);
	registerEvent("nidaq::" + channel_alias.value_or(channel));

	log.info("Created analog input channel on hardware channel: %s.", channel.c_str());
}

void NIDaq::setClockSampleTiming(const std::string& task, double rate)
{
	TaskHandle taskh = getTask(task);
	if(!taskh) return;

	// Setting up for the internal clock
	if(gotError(DAQmxCfgSampClkTiming(taskh, "", rate, DAQmx_Val_Rising, DAQmx_Val_ContSamps, SAMPLES_PER_CHANNEL)))
	{
		log.error("Failed to setup clock sample timing.");
		return;
	}

	log.info("Created sampling clock for task %s with clock rate %.2lf [INTERNAL].", task.c_str(), rate);
}

void NIDaq::registerCallback(const std::string& task, DAQmxEveryNSamplesEventCallbackPtr func)
{
	TaskHandle taskh = getTask(task);
	if(!taskh) return;

	uInt32 nchannels = getTaskNumChannels(task);
	if(nchannels == 0)
	{
		log.error("Failed to fetch task number of channels.");
		return;
	}

	if(gotError(DAQmxRegisterEveryNSamplesEvent(taskh, DAQmx_Val_Acquired_Into_Buffer, SAMPLES_PER_CHANNEL, 0, func, this)))
	{
		log.error("Failed to register every N samples callback.");
		return;
	}

	log.info("Registered user function callback for task: %s.", task.c_str());
}

std::vector<std::string> NIDaq::getDevices()
{
	char buffer[4096];
	if(!gotError(DAQmxGetSysDevNames(buffer, 4096)))
	{
		// Split on commas
		return splitString(buffer, ',');
	}

	log.error("Failed to enumerate devices.");
	return {};
}

int main(int argc, char* argv[])
{
	NIDaq backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}

