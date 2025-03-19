//  Brief : Backend to read the AXAS MCA via USB
// Author : César Godinho
//   Date : 18/03/2025

#define _CRT_SECURE_NO_WARNINGS
#include <WinSock2.h>
#include <handel.h>
#include <handel_errors.h>
#include <handel_generic.h>
#include <md_generic.h>
#include <mxbackend.h>
#include <filesystem>

class AxasMCA : public mulex::MxBackend
{
public:
	AxasMCA(int argc, char* argv[]);
	~AxasMCA();

private:
	std::int32_t devindex;
	bool status;
	unsigned int devchannels;
	std::vector<std::uint8_t> mcadata;

protected:
	void startMeasurement(std::uint64_t runno);
	void stopMeasurement(std::uint64_t runno);

private:
	unsigned int findChannels();
	void update();

	template<typename F, typename... Args>
	void runWithCheck(F f, Args... args)
	{
		const int status = f(args...);
		if(status != XIA_SUCCESS)
		{
			log.error("Error! Status = %#02x. Message = %s.", status, xiaGetErrorText(status));
			// xiaExit();
			// xiaCloseLog();
		}
	}

	template<typename T>
	void setupParameter(std::string name, T defvalue)
	{
		std::string pkey = "/user/axas/" + name;
		if constexpr(std::is_same_v<T, double>) rdb[pkey].create(mulex::RdbValueType::FLOAT64, defvalue);
		else static_assert(false, "Type not allowed on setup parameter.");

		T value = rdb[pkey];
		log.info("Setting up %s: %s.", name.c_str(), std::to_string(defvalue).c_str());
		runWithCheck(xiaSetAcquisitionValues, 0, name.data(), (void*)&value);
	}
};

AxasMCA::AxasMCA(int argc, char* argv[]) : mulex::MxBackend(argc, argv), status(false)
{
	// Setup logging to file
	xiaSetLogLevel(MD_DEBUG);
	rdb["/user/axas/logpath"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("handel.log"));
	mulex::mxstring<512> logpath = rdb["/user/axas/logpath"];
	xiaSetLogOutput(const_cast<char*>(logpath.c_str()));

	// Startup system
	rdb["/user/axas/inipath"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("DPP2.ini"));
	mulex::mxstring<512> inipath = rdb["/user/axas/inipath"];

	if(!std::filesystem::is_regular_file(inipath.c_str()))
	{
		log.error(
			"File [%s] not found. Make sure you use a correct DPP2 ini file. "
			"Can be copied from the default generation from ProSpect 1.1.",
			inipath.c_str()
		);
		return;
	}

	char* cinipath = const_cast<char*>(inipath.c_str());
	runWithCheck(xiaInit, cinipath);

	// Boot hardware
	runWithCheck(xiaStartSystem);

	devchannels = findChannels();

	// Setup DPP parameters
	setupParameter("parset", 3.0);
	setupParameter("genset", 0.0);
	setupParameter("number_mca_channels", 4096.0);
	setupParameter("trigger_threshold", 25.0);
	setupParameter("gain", 5.700);
	setupParameter("bytes_per_bin", 3.0);

	// Apply parameters
	std::string cmd = "apply";
	unsigned short ignored = 0;
	runWithCheck(xiaBoardOperation, 0, cmd.data(), (void*)&ignored);

	// Save presets
	cmd = "save_genset";
	double genset = rdb["/user/axas/genset"];
	unsigned short gensets = static_cast<unsigned short>(genset);
	runWithCheck(xiaBoardOperation, 0, cmd.data(), (void*)&gensets);
	cmd = "save_parset";
	double parset = rdb["/user/axas/parset"];
	unsigned short parsets = static_cast<unsigned short>(parset);
	runWithCheck(xiaBoardOperation, 0, cmd.data(), (void*)&parsets);
	
	// Find current peaking times
	cmd = "get_number_pt_per_fippi";
	unsigned short npt = 0;
	std::vector<double> peakingtimes;
	runWithCheck(xiaBoardOperation, 0, cmd.data(), &npt);
	peakingtimes.resize(npt);
	cmd = "get_current_peaking_times";
	runWithCheck(xiaBoardOperation, 0, cmd.data(), peakingtimes.data());

	for(int i = 0; i < npt; i++)
	{
		log.info("Peaking time %d -> %lf", i, peakingtimes[i]);
	}

	// Check length
	unsigned long mcalen;
	cmd = "mca_length";
	runWithCheck(xiaGetRunData, 0, cmd.data(), &mcalen);

	if(mcalen == 0)
	{
		log.error("mca_length returned 0.");
		return;
	}

	double nchan = rdb["/user/axas/number_mca_channels"];
	if(mcalen != static_cast<unsigned long>(nchan))
	{
		log.error("mca_length returned unexpected value.");
		return;
	}

	log.info("Allocating %lu words for MCA...", mcalen * sizeof(unsigned long));
	mcadata.resize(mcalen * sizeof(unsigned long));

	registerRunStartStop(&AxasMCA::startMeasurement, &AxasMCA::stopMeasurement);
	registerEvent("axas::mcadata");
}

AxasMCA::~AxasMCA()
{
	// Virtually stop the run
	stopMeasurement(0);

	xiaExit();
	xiaCloseLog();
}

unsigned int AxasMCA::findChannels()
{
	char module[MAXALIAS_LEN];
	int nchannels_module = 0;

	unsigned int nmodules = 0;
	unsigned int nchannels = 0;

	std::string command = "number_of_channels";

	runWithCheck(xiaGetNumModules, &nmodules);
	log.info("Found #%d XIA modules.", nmodules);

	for(unsigned int i = 0; i < nmodules; i++)
	{
		runWithCheck(xiaGetModules_VB, i, module);
		log.info("Module: %s.", module);
		runWithCheck(xiaGetModuleItem, module, command.data(), &nchannels_module);
		nchannels += nchannels_module;
	}

	return nchannels;
}

void AxasMCA::update()
{
	static double statistics[9];
	static std::string cmd1 = "mca";
	static std::string cmd2 = "module_statistics_2";

	if(!status)
	{
		// Run will stop
		return;
	}

	for(int c = 0; c < devchannels; c++)
	{
		runWithCheck(xiaGetRunData, c, cmd1.data(), mcadata.data());
		runWithCheck(xiaGetRunData, c, cmd2.data(), statistics);

		if(statistics[0] <= 0.0)
		{
			// Run will stop
			return;
		}
	}

	// Stats
	rdb["/user/axas/stats/realtime"] = statistics[0];
	rdb["/user/axas/stats/livetime"] = statistics[1];
	rdb["/user/axas/stats/outrate"] = statistics[6];
	rdb["/user/axas/stats/inrate"] = statistics[5];

	dispatchEvent("axas::mcadata", mcadata);

	// Update stats and MCA array every second
	deferExec(&AxasMCA::update, 1000);
}

void AxasMCA::startMeasurement(std::uint64_t runno)
{
	status = true;
	runWithCheck(xiaStartRun, -1, static_cast<unsigned short>(0));
	deferExec(&AxasMCA::update);
}

void AxasMCA::stopMeasurement(std::uint64_t runno)
{
	if(status)
	{
		status = false;
		runWithCheck(xiaStopRun, -1);
	}
}

int main(int argc, char* argv[])
{
	AxasMCA backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
