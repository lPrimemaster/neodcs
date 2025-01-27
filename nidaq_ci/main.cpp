#include "../common/daq.h"
#include <span>

class CIDaq : public mulex::MxBackend
{
public:
	CIDaq(int argc, char* argv[]);
	~CIDaq();

	// Pass by value is important here. Do not modify
	void dispatchChannelEvents(TaskHandle task, std::vector<double> data, std::uint64_t timestamp, uInt32 nchannels);

	void pollCounter();

private:
	NIDaq _daq;
};

// If we need more fine grained events (time-wise) use a every N callback instead
void CIDaq::pollCounter()
{
	static TaskHandle task = _daq.getTask("dcs_counter");
	uInt32 counts;
	static uInt32 last_counts = 0;
	NIError error = NIGetError(DAQmxReadCounterScalarU32(task, -1, &counts, nullptr));

	// Use software timestamp
	std::int64_t timestamp = mulex::SysGetCurrentTime();

	if(error)
	{
		mulex::LogError("Failed to get samples.");
		mulex::LogError("Extended error: %s.", error.message.c_str());
		_daq.stopTask("dcs_counter");
		return;
	}

	uInt32 inc = counts - last_counts;
	if(inc > 0)
	{
		static std::vector<std::uint8_t> data(16); data.clear();

		// Dispatch the number of counts this frame
		dispatchEvent("cidaq::counts", mulex::MxEventBuilder(data).add(timestamp).add(inc));
		last_counts = counts;
	}
}

CIDaq::CIDaq(int argc, char* argv[]) : mulex::MxBackend(argc, argv), _daq(&log)
{
	_daq.createTask("dcs_counter");

	// This backend also declared the signals onto the rdb for other backends to use
	rdb["/user/signals/counter/hardware_channel"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Dev1/ctr0"));

	mulex::mxstring<512> counter_hc = rdb["/user/signals/counter/hardware_channel"];

	std::string cname = _daq.createCounterInputChannel("dcs_counter", counter_hc.c_str(), "counts");
	registerEvent("cidaq::" + cname);

	_daq.startTask("dcs_counter");

	deferExec(&CIDaq::pollCounter, 0, 50); // 20 Hz
}

CIDaq::~CIDaq()
{
	_daq.stopTask("dcs_counter");
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

void CIDaq::dispatchChannelEvents(TaskHandle task, std::vector<double> data, std::uint64_t timestamp, uInt32 nchannels)
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
	CIDaq backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}

