#include "../common/daq.h"
#include <span>

class AIDaq : public mulex::MxBackend
{
public:
	AIDaq(int argc, char* argv[]);
	~AIDaq();

	// Pass by value is important here. Do not modify
	void dispatchChannelEvents(TaskHandle task, std::vector<double> data, std::uint64_t timestamp, uInt32 nchannels);

private:
	NIDaq _daq;
};

static int32 NIVoltageCallback(TaskHandle task, int32 everyNsamplesEventType, uInt32 nSamples, void* userData)
{
	uInt32 nchannels = NIGetTaskNumChannels(task);
	AIDaq* instance = reinterpret_cast<AIDaq*>(userData);

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

AIDaq::AIDaq(int argc, char* argv[]) : mulex::MxBackend(argc, argv), _daq(&log)
{
	_daq.createTask("dcs_analog");

	// This backend also declared the signals onto the rdb for other backends to use
	rdb["/user/signals/apd0_signal/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai0"));
	rdb["/user/signals/apd1_signal/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai1"));
	rdb["/user/signals/clinometerx/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai2"));
	rdb["/user/signals/clinometery/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai3"));

	mulex::mxstring<512> apd0_hc = rdb["/user/signals/apd0_signal/hardware_channel"];
	mulex::mxstring<512> apd1_hc = rdb["/user/signals/apd1_signal/hardware_channel"];
	mulex::mxstring<512> clix_hc = rdb["/user/signals/clinometerx/hardware_channel"];
	mulex::mxstring<512> cliy_hc = rdb["/user/signals/clinometery/hardware_channel"];

	std::string cname = _daq.createAnalogInputChannel("dcs_analog", apd0_hc.c_str(), -10.0, 10.0, "apd0_signal");
	registerEvent("aidaq::" + cname);

	cname = _daq.createAnalogInputChannel("dcs_analog", apd1_hc.c_str(), -10.0, 10.0, "apd1_signal");
	registerEvent("aidaq::" + cname);

	cname = _daq.createAnalogInputChannel("dcs_analog", clix_hc.c_str(),   0.0,  5.0, "clinometerx");
	registerEvent("aidaq::" + cname);

	cname = _daq.createAnalogInputChannel("dcs_analog", cliy_hc.c_str(),   0.0,  5.0, "clinometery");
	registerEvent("aidaq::" + cname);

	rdb["/user/nidaq/sample_rate"].create(mulex::RdbValueType::FLOAT64, 250000.0);
	_daq.setClockSampleTiming("dcs_analog", rdb["/user/nidaq/sample_rate"]);

	_daq.registerCallback("dcs_analog", NIVoltageCallback, this);

	_daq.startTask("dcs_analog");
}

AIDaq::~AIDaq()
{
	_daq.stopTask("dcs_analog");
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

void AIDaq::dispatchChannelEvents(TaskHandle task, std::vector<double> data, std::uint64_t timestamp, uInt32 nchannels)
{
	static std::vector<std::uint8_t> buffer(sizeof(double) * NIDaq::SAMPLES_PER_CHANNEL + sizeof(std::uint64_t));

	std::uint64_t start = 0;
	for(const std::string& channel : _daq.getTaskChannels(task))
	{
		std::memcpy(buffer.data(), &timestamp, sizeof(std::uint64_t));
		CopyDoubleVectorToBytes(std::span<double>(data.data() + start, NIDaq::SAMPLES_PER_CHANNEL), buffer, sizeof(std::uint64_t));
		auto channel_alias = _daq.getChannelAlias(channel);
		dispatchEvent("aidaq::" + channel_alias.value_or(channel), buffer);
		start += NIDaq::SAMPLES_PER_CHANNEL;
	}
}

int main(int argc, char* argv[])
{
	AIDaq backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}

