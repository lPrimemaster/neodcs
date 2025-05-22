#include "../common/daq.h"
#include <span>
#include <numeric>
#include <cmath>

class AIDaq : public mulex::MxBackend
{
private:
	static constexpr std::uint64_t NPIRANI = 3;
public:
	AIDaq(int argc, char* argv[]);
	~AIDaq();

	using ChannelWorker = std::function<void(const std::span<double>&, const std::int64_t)>;

	// Pass by value is important here. Do not modify
	void dispatchChannelWork(TaskHandle task, std::vector<double> data, std::int64_t timestamp, uInt32 nchannels);
	void channelDoWork(const std::string& channel, const ChannelWorker& f);

	void calculateClinometerAngle(const std::span<double>& data, std::atomic<double>& out);
	void calculatePiraniPressure(const std::span<double>& data, std::atomic<double>& out);
	void dispatchDetectorReadout(const std::span<double>& data, const std::int64_t timestamp, const std::string& evt);

	void setupClinometer();
	void setupDetectors();
	void setupPiraniGauges();

	void setupGenericSignal(const std::string& name, const std::string& channel, double min, double max, const ChannelWorker& worker, int type = DAQmx_Val_RSE);
private:
	NIDaq _daq;
	std::map<std::string, ChannelWorker> _workers;

	std::atomic<double> _cli_angley;
	std::atomic<double> _cli_anglex;

	std::atomic<double> _pirani_mbar[NPIRANI];
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
		instance->deferExec([instance, nchannels, task, timestamp]() { instance->dispatchChannelWork(task, data, timestamp, nchannels); });
	}

	return 0;
}

void AIDaq::calculateClinometerAngle(const std::span<double>& data, std::atomic<double>& out)
{
	double avg = std::accumulate(data.begin(), data.end(), 0.0) / data.size();
	out = (avg - 2.5) / (5.0 / 20.0);
}

void AIDaq::calculatePiraniPressure(const std::span<double>& data, std::atomic<double>& out)
{
	double avg = std::accumulate(data.begin(), data.end(), 0.0) / data.size();
	out = std::pow(10, (avg - 6.143) / 1.286);
}

void AIDaq::dispatchDetectorReadout(const std::span<double>& data, const std::int64_t timestamp, const std::string& evt)
{
	static std::vector<std::uint8_t> buffer(NIDaq::SAMPLES_PER_CHANNEL * sizeof(double) + sizeof(std::int64_t));
	std::memcpy(buffer.data(), &timestamp, sizeof(std::int64_t));
	std::memcpy(buffer.data() + sizeof(std::int64_t), data.data(), data.size() * sizeof(double));
	dispatchEvent(evt, buffer);
}

void AIDaq::setupGenericSignal(const std::string& name, const std::string& channel, double min, double max, const ChannelWorker& worker, int type)
{
	std::string cname = _daq.createAnalogInputChannel("dcs_analog", channel, min, max, name, type);
	channelDoWork(cname, worker);
}

void AIDaq::setupDetectors()
{
	setupGenericSignal("apd0", "Dev1/ai0", -10.0, 10.0, [this](const auto& data, const auto& ts) { dispatchDetectorReadout(data, ts, "aidaq::apd0"); });
	registerEvent("aidaq::apd0");
}

void AIDaq::setupClinometer()
{
	setupGenericSignal("clinometery", "Dev1/ai2", 0.0, 5.0, [this](const auto& data, const auto& ts) { calculateClinometerAngle(data, _cli_angley); });
	setupGenericSignal("clinometerx", "Dev1/ai3", 0.0, 5.0, [this](const auto& data, const auto& ts) { calculateClinometerAngle(data, _cli_anglex); });

	rdb["/user/anglex"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/angley"].create(mulex::RdbValueType::FLOAT64, 0.0);
}

void AIDaq::setupPiraniGauges()
{
	setupGenericSignal("pirani0", "Dev1/ai4", 0.0, 10.0, [this](const auto& data, const auto& ts) { calculatePiraniPressure(data, _pirani_mbar[0]); });
	setupGenericSignal("pirani1", "Dev1/ai5", 0.0, 10.0, [this](const auto& data, const auto& ts) { calculatePiraniPressure(data, _pirani_mbar[1]); });
	setupGenericSignal("pirani2", "Dev1/ai6", 0.0, 10.0, [this](const auto& data, const auto& ts) { calculatePiraniPressure(data, _pirani_mbar[2]); });

	rdb["/user/pirani0"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/pirani1"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/pirani2"].create(mulex::RdbValueType::FLOAT64, 0.0);
}

AIDaq::AIDaq(int argc, char* argv[]) : mulex::MxBackend(argc, argv), _daq(&log)
{
	// Create DAQ task
	_daq.createTask("dcs_analog");
	
	// Generic setup
	setupDetectors();
	setupClinometer();
	setupPiraniGauges();

	// Update local variables every half a second
	deferExec([this]() {
		rdb["/user/anglex"] = _cli_anglex.load();
		rdb["/user/angley"] = _cli_angley.load();

		rdb["/user/pirani0"] = _pirani_mbar[0].load();
		rdb["/user/pirani1"] = _pirani_mbar[1].load();
		rdb["/user/pirani2"] = _pirani_mbar[2].load();
	}, 0, 500);

	// Set Task Timings and callback
	rdb["/user/nidaq/sample_rate"].create(mulex::RdbValueType::FLOAT64, 250000.0);
	_daq.setClockSampleTiming("dcs_analog", rdb["/user/nidaq/sample_rate"]);
	_daq.registerCallback("dcs_analog", NIVoltageCallback, this);
	_daq.startTask("dcs_analog");
}

AIDaq::~AIDaq()
{
	_daq.stopTask("dcs_analog");
}

void AIDaq::dispatchChannelWork(TaskHandle task, std::vector<double> data, std::int64_t timestamp, uInt32 nchannels)
{
	std::uint64_t start = 0;
	for(const std::string& channel : _daq.getTaskChannels(task))
	{
		auto span = std::span<double>(data.data() + start, NIDaq::SAMPLES_PER_CHANNEL);
		auto channel_alias = _daq.getChannelAlias(channel);
		start += NIDaq::SAMPLES_PER_CHANNEL;

		auto worker = _workers.find(channel_alias.value_or(channel));
		if(worker != _workers.end())
		{
			worker->second(span, timestamp);
		}
	}
}

void AIDaq::channelDoWork(const std::string& channel, const ChannelWorker& f)
{
	_workers[channel] = f;
}

int main(int argc, char* argv[])
{
	AIDaq backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}

