#include "../common/daq.h"
#include "../types.h"

class CIDaq : public mulex::MxBackend
{
public:
	CIDaq(int argc, char* argv[]);
	~CIDaq();

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
		// static std::vector<std::uint8_t> data(16); data.clear();

		CICountEvent e;
		e.timestamp = timestamp;
		e.counts = inc;

		// log.info("Poll source PFI39: %d", inc);

		// Dispatch the number of counts this frame
		dispatchEvent("cidaq::counts", e.serialize());
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

int main(int argc, char* argv[])
{
	CIDaq backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}

