#include "../common/daq.h"
#include "../types.h"
#include <span>

class CIDaq : public mulex::MxBackend
{
public:
	CIDaq(int argc, char* argv[]);
	~CIDaq();

	void pollCounter();
};

// If we need more fine grained events (time-wise) use a every N callback instead
void CIDaq::pollCounter()
{
	// Use software timestamp
	std::int64_t timestamp = mulex::SysGetCurrentTime();

	std::uint64_t inc = 1;
	if(inc > 0)
	{
		static std::vector<std::uint8_t> data(16); data.clear();

		// CICountEvent e;
		// e.timestamp = timestamp;
		// e.counts = inc;

		// Dispatch the number of counts this frame
		dispatchEvent("cidaq::counts", mulex::MxEventBuilder(data).add(timestamp).add(inc));
	}
}

CIDaq::CIDaq(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	registerEvent("cidaq::counts");
	deferExec(&CIDaq::pollCounter, 0, 500); // 2 Hz
}

CIDaq::~CIDaq()
{
}

int main(int argc, char* argv[])
{
	CIDaq backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}

