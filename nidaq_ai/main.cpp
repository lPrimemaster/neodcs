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

	using ChannelWorker = std::function<void(const std::span<double>&)>;

	// Pass by value is important here. Do not modify
	void dispatchChannelEvents(TaskHandle task, std::vector<double> data, std::uint64_t timestamp, uInt32 nchannels);
	void channelDoWork(const std::string& channel, const ChannelWorker& f);

	void calculateClinometerAngle(const std::span<double>& data, std::atomic<double>& out);
	void calculatePiraniPressure(const std::span<double>& data, std::atomic<double>& out);

	void setupClinometer();
	void setupDetectors();
	void setupPiraniGauges();

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
		instance->deferExec([instance, nchannels, task, timestamp]() { instance->dispatchChannelEvents(task, data, timestamp, nchannels); });
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

void AIDaq::setupDetectors()
{
	rdb["/user/signals/apd0_signal/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai0"));
	rdb["/user/signals/apd1_signal/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai1"));

	mulex::mxstring<512> apd0_hc = rdb["/user/signals/apd0_signal/hardware_channel"];
	mulex::mxstring<512> apd1_hc = rdb["/user/signals/apd1_signal/hardware_channel"];

	std::string cname = _daq.createAnalogInputChannel("dcs_analog", apd0_hc.c_str(), -10.0, 10.0, "apd0_signal");
	cname = _daq.createAnalogInputChannel("dcs_analog", apd1_hc.c_str(), -10.0, 10.0, "apd1_signal");
}

void AIDaq::setupClinometer()
{
	rdb["/user/signals/clinometerx/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai1"));
	rdb["/user/signals/clinometery/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai0"));
	mulex::mxstring<512> clix_hc = rdb["/user/signals/clinometerx/hardware_channel"];
	mulex::mxstring<512> cliy_hc = rdb["/user/signals/clinometery/hardware_channel"];

	std::string cname = _daq.createAnalogInputChannel("dcs_analog", clix_hc.c_str(), 0.0, 5.0, "clinometerx", DAQmx_Val_RSE);
	channelDoWork(cname, [this](const auto& data) { calculateClinometerAngle(data, _cli_anglex); });

	cname = _daq.createAnalogInputChannel("dcs_analog", cliy_hc.c_str(), 0.0, 5.0, "clinometery", DAQmx_Val_RSE);
	channelDoWork(cname, [this](const auto& data) { calculateClinometerAngle(data, _cli_angley); });

	rdb["/user/anglex"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/angley"].create(mulex::RdbValueType::FLOAT64, 0.0);

	rdb["/user/pirani0"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/pirani1"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/pirani2"].create(mulex::RdbValueType::FLOAT64, 0.0);
}

void AIDaq::setupPiraniGauges()
{
	for(int i = 0; i < NPIRANI; i++)
	{
		const std::string name = "pirani" + std::to_string(i);
		const std::string key = "/user/signals/" + name + "/hardware_channel";
		rdb[key].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ai" + std::to_string(i + 4)));
		const mulex::mxstring<512> channel = rdb[key];
		std::string cname = _daq.createAnalogInputChannel("dcs_analog", channel.c_str(), 0.0, 10.0, name.c_str(), DAQmx_Val_RSE);
		channelDoWork(cname, [this, i](const auto& data) {
			calculatePiraniPressure(data, _pirani_mbar[i]);
		});
	}
}

AIDaq::AIDaq(int argc, char* argv[]) : mulex::MxBackend(argc, argv), _daq(&log)
{
	// Create DAQ task
	_daq.createTask("dcs_analog");
	
	// Generic setup
	// setupDetectors();
	setupClinometer();
	setupPiraniGauges();

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
		auto span = std::span<double>(data.data() + start, NIDaq::SAMPLES_PER_CHANNEL);
		CopyDoubleVectorToBytes(span, buffer, sizeof(std::uint64_t));
		auto channel_alias = _daq.getChannelAlias(channel);
		start += NIDaq::SAMPLES_PER_CHANNEL;

		auto worker = _workers.find(channel_alias.value_or(channel));
		if(worker != _workers.end())
		{
			worker->second(span);
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

