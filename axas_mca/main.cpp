//  Brief : Backend to read the AXAS MCA via USB
// Author : César Godinho
//   Date : 18/03/2025

#include <WinSock2.h>
#include <vicolib.h>
#include <mxbackend.h>

class AxasMCA : public mulex::MxBackend
{
public:
	AxasMCA(int argc, char* argv[]);
	~AxasMCA();

private:
	std::int32_t devindex;
	InterfaceType devinterface;
	CharType serial[12];
	CharType ipaddr[12];
	std::vector<UInt8Type> mcadata;
	bool status;
	UInt16Type bins;
	UInt8Type bpb;

protected:
	void startMeasurement(std::uint64_t runno);
	void stopMeasurement(std::uint64_t runno);

private:
	void setupBinsAndTimings();
	void updateStats();

	template<typename F, typename... Args>
	void runWithCheck(F f, Args... args)
	{
		const int status = f(args...);
		if(status != DPP_SUCCESS && status != VICO_SUCCESS && status != MCU_SUCCESS)
		{
			log.error("Error! Status = %#02x.", status);
		}
	}
};

AxasMCA::AxasMCA(int argc, char* argv[]) : mulex::MxBackend(argc, argv), status(false)
{
	// Init usb device
	runWithCheck(scanUsbDevices);

	UInt8Type ndevices = 0;
	runWithCheck(getNumberOfDevices, &ndevices);

	if(ndevices == 0)
	{
		log.warn("No AXAS device found. Aborting init...");
		log.info("Check connections and restart this backend.");
		return;
	}

	log.info("Found #%d devices.", ndevices);

	for(int i = 0; i < ndevices; i++)
	{
		std::string status;
		runWithCheck(getDeviceInfoByIndex, i, 12, serial, &devinterface);
		status = "Device #" + std::to_string(i) + " S/N " + serial + " ";

		switch(devinterface)
		{
			case INTERFACE_ETHERNET_TCP:
			{
				runWithCheck(getIPAddress, serial, 12, ipaddr);
				status += "connected over TCP via IP: ";
				status += ipaddr;
				break;
			}
			case INTERFACE_ETHERNET_UDP:
			{
				status += "connected over UDP.";
				break;
			}
			case INTERFACE_USB:
			{
				status += "connected over USB (FT4222).";
				break;
			}
			case INTERFACE_USB_HID:
			{
				status += "connected over USB (HID).";
				break;
			}
			case INTERFACE_UNKNOWN:
			{
				status += "connected over an unknown interface.";
				break;
			}
		}

		log.info(status.c_str());
	}

	rdb["/user/axas/index"].create(mulex::RdbValueType::INT32, std::int32_t(0));
	devindex = rdb["/user/axas/index"];

	log.info("Using device index %d from '/user/axas/index'.", devindex);

	if(devindex >= std::int32_t(ndevices))
	{
		log.error("Invalid device index. Aborting...");
		return;
	}

	runWithCheck(getDeviceInfoByIndex, devindex, 12, serial, &devinterface);

	setupBinsAndTimings();

	registerRunStartStop(&AxasMCA::startMeasurement, &AxasMCA::stopMeasurement);
}

AxasMCA::~AxasMCA()
{
	// Virtually stop the run
	stopMeasurement(0);
}

void AxasMCA::setupBinsAndTimings()
{
	// Valid range 25 - 12600 ns
	rdb["/user/axas/timings/peaking"].create(mulex::RdbValueType::FLOAT32, 1000.0f);
	FloatType peaking = rdb["/user/axas/timings/peaking"];
	runWithCheck(setSlowFilterPeakingTime, serial, &peaking);
	log.info("Setting peaking time to %f ns.", peaking);

	// We want realtime soft mode, so no stop condition on de DPP
	StopConditionType stopcond = NONE;
	DoubleType mt = 0.0; // NOTE: (César) Should not matter
	runWithCheck(setStopCondition, serial, stopcond, &mt);
	log.info("Setting stop contidion to none.");

	// No. of bins
	rdb["/user/axas/bins/size"].create(mulex::RdbValueType::UINT16, std::uint16_t(4096));
	bins = rdb["/user/axas/bins/size"];
	rdb["/user/axas/bins/bytes_per_bin"].create(mulex::RdbValueType::UINT8, std::uint8_t(3)); // 24-bit UI inside the DPP
	bpb = rdb["/user/axas/bins/bytes_per_bin"];
	runWithCheck(setMCANumberOfBins, serial, &bins);
	runWithCheck(setMCABytesPerBin, serial, &bpb);
	log.info("Setting DPP with %d bins (%d bytes per bin).", bins, bpb);

	mcadata.resize(bins * bpb);
	status = true;

	rdb["/user/axas/stats/realtime"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/axas/stats/livetime"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/axas/stats/outrate"].create(mulex::RdbValueType::UINT32, std::uint32_t(0));
	rdb["/user/axas/stats/inrate"].create(mulex::RdbValueType::UINT32, std::uint32_t(0));

	registerEvent("axas::mcadata");
}

void AxasMCA::updateStats()
{
	RunStatisticsType runstats;
	runWithCheck(getRunStatistics, serial, &runstats);

	if(!runstats.isRunActive)
	{
		// Early out
		return;
	}

	// Stats
	rdb["/user/axas/stats/realtime"] = runstats.realTime;
	rdb["/user/axas/stats/livetime"] = runstats.liveTime;
	rdb["/user/axas/stats/outrate"] = runstats.outputCountRate;
	rdb["/user/axas/stats/inrate"] = runstats.inputCountRate;

	// MCA Data buffer
	runWithCheck(getMCADataRaw, serial, bpb * bins, mcadata.data());
	dispatchEvent("axas::mcadata", mcadata);

	// Update stats and MCA array every second
	deferExec(&AxasMCA::updateStats, 1000);
}

void AxasMCA::startMeasurement(std::uint64_t runno)
{
	if(status)
	{
		runWithCheck(startRun, serial);
		deferExec(&AxasMCA::updateStats);
	}
}

void AxasMCA::stopMeasurement(std::uint64_t runno)
{
	if(status)
	{
		runWithCheck(stopRun, serial);
	}
}

int main(int argc, char* argv[])
{
	AxasMCA backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
