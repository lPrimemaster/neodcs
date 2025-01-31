//  Brief : Backend to automatically control the DCS mid experiment
// Author : César Godinho
//   Date : 31/01/2025

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <mxbackend.h>
#include <mxtypes.h>
#include <thread>

enum class RunContMode : std::int32_t
{
	PARALLEL,
	ANTIPARALLEL
};

enum class RunContStatus : std::int32_t
{
	STARTING,
	STOPPING,
	RUNNING,
	STOPPED,
	ABORTED
};

class RunCont : public mulex::MxBackend
{
public:
	RunCont(int argc, char* argv[]);
	~RunCont();

private:
	void startAnti();
	void startPara();
	bool setupStart();

	void measureAnti();
	void measurePara();

	bool checkEnginesStartPositions();

	void startMeasurement(std::uint64_t runno);
	void stopMeasurement(std::uint64_t runno);
	void setRunStatus(const RunContStatus& status);

private:
	RunContMode   				 _mode;
	RunContStatus 				 _status = RunContStatus::STOPPED;
	std::unique_ptr<std::thread> _measurement_thread;
};

void RunCont::setRunStatus(const RunContStatus& status)
{
	_status = status;
	rdb["/user/runcont/status"] = static_cast<std::int32_t>(_status);
}

RunCont::RunCont(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	registerRunStartStop(&RunCont::startMeasurement, &RunCont::stopMeasurement);

	rdb["/user/runcont/c1/position"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/runcont/table/position"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/runcont/c2/start"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/runcont/c2/stop"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/runcont/c2/increment"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/runcont/c2/tpb"].create(mulex::RdbValueType::UINT64, std::uint64_t(300)); // 5 min per bin
	rdb["/user/runcont/mode"].create(mulex::RdbValueType::INT32, std::int32_t(0));
	rdb["/user/runcont/status"].create(mulex::RdbValueType::INT32, static_cast<std::int32_t>(_status));
	rdb["/user/runcont/eta"].create(mulex::RdbValueType::INT64, std::int64_t(0));
	// The detector just follows the line
	
	_mode = static_cast<RunContMode>(std::clamp(static_cast<std::int32_t>(rdb["/user/runcont/mode"]), 0, 1));
	rdb["/user/runcont/mode"].watch([this](const auto& key, const auto& value) {
		std::int32_t imode = value;
		imode = std::clamp(imode, 0, 1);
		_mode = static_cast<RunContMode>(imode);
	});
}

bool RunCont::setupStart()
{
	double c1pos = rdb["/user/runcon/c1/position"];
	double c2pos = rdb["/user/runcon/c2/start"];
	double tapos = rdb["/user/runcon/table/position"];

	// TODO: (Cesar) Calculate detector start pos

	rdb["/user/xpsrld4/c1/setpoint"] = c1pos;
	rdb["/user/xpsrld4/c2/setpoint"] = c2pos;
	rdb["/user/xpsrld4/table/setpoint"] = tapos;

	constexpr std::int32_t timeout = 60000; // 2 minutes timeout

	// Wait for position to be within the setpoint
	log.info("Waiting for motion to complete...");
	std::int32_t tp = mulex::SysGetCurrentTime();

	while(true)
	{
		bool c1moving 	 = rdb["/user/xpsrld4/c1/moving"];
		bool c2moving 	 = rdb["/user/xpsrld4/c2/moving"];
		bool tablemoving = rdb["/user/xpsrld4/table/moving"];
		bool detmoving 	 = rdb["/user/xpsrld4/detector/moving"];

		if(!c1moving && !c2moving && !tablemoving && !detmoving)
		{
			break;
		}

		if((mulex::SysGetCurrentTime() - tp) > timeout)
		{
			log.warn("Motion not completed in %d seconds. Timeout issued... Aborting start on this run.", timeout / 1000);
			setRunStatus(RunContStatus::ABORTED);
			return false;
		}

		std::this_thread::sleep_for(std::chrono::milliseconds(500));
	}

	log.info("Motion done! Engines are at requested starting position.");
	return true;
}

void RunCont::measureAnti()
{
	log.info("Starting antiparallel measurement...");

	double start = rdb["/user/runcont/c2/start"];
	double stop = rdb["/user/runcont/c2/stop"];
	double inc = rdb["/user/runcont/c2/increment"];
	std::uint64_t tpb = rdb["/user/runcont/c2/tpb"];

	log.info("Current increment: %.3lf mdeg.", inc / 1000.0);
	log.info("Current tpb: %llu s.", tpb);

	std::uint32_t nbins = static_cast<std::uint32_t>((stop - start) / inc);
	std::int64_t delta = nbins * static_cast<std::int64_t>(tpb);
	std::int64_t eta = mulex::SysGetCurrentTime() + delta;
	rdb["/user/runcont/eta"] = eta;

	log.info("Calculated number of bins: %u.", nbins);

	// TODO: (Cesar) Adjust C1 if need be during the measurement

	_measurement_thread = std::make_unique<std::thread>([this, nbins, inc, tpb, start](){
		double setpoint = start;
		log.info("Measurement started.");
		for(std::uint32_t i = 0; i < nbins; i++)
		{
			log.info("Current Bin: %u/%u.", i, nbins);
			// NOTE: (Cesar) sleep_for does not assure a super fine wait
			// 				 but should be more than enough for this task
			std::this_thread::sleep_for(std::chrono::milliseconds(tpb));

			// Move to next
			setpoint += inc;
	  		rdb["/user/xpsrld4/c2/setpoint"] = setpoint;
			// NOTE: (Cesar) Moving time is included in the tpb.
			// 				 The composer logs this on the listmode output.
			// 				 Here we also assume the drift is negligible
			// 				 comparing to the bin time.
		}
		log.info("Measurement stopped.");

		// Hack run stop
		rdb["/system/run/status"] = std::uint8_t(0);
		// mulex::SysGetConnectedExperiment().value()->_rpc_client->call(29);
	});
}

void RunCont::measurePara()
{
	log.info("Starting parallel measurement...");
}

void RunCont::startAnti()
{
	log.info("Setting up for antiparallel mode...");

	// Move engines to desired start location
	setupStart();

	if(!checkEnginesStartPositions())
	{
		log.warn("Engine positions do not match the expected. Aborting...");
		setRunStatus(RunContStatus::ABORTED);
		return;
	}

	// Finally start the measurement
	measureAnti();
	setRunStatus(RunContStatus::RUNNING);
}

void RunCont::startPara()
{
	log.info("Setting up for parallel mode...");

	// Move engines to desired start location
	setupStart();

	if(!checkEnginesStartPositions())
	{
		log.warn("Engine positions do not match the expected. Aborting...");
		setRunStatus(RunContStatus::ABORTED);
		return;
	}

	// Finally start the measurement
	measurePara();
	setRunStatus(RunContStatus::RUNNING);
}

bool RunCont::checkEnginesStartPositions()
{
	double spc1 = rdb["/user/runcont/c1/position"];
	double spc2 = rdb["/user/runcont/c2/start"];
	double spta = rdb["/user/runcont/table/position"];

	double pc1 = rdb["/user/eib7/axis/0/position"];
	double pc2 = rdb["/user/eib7/axis/1/position"];
	double pta = rdb["/user/xpsrld4/table/position"];
	
	double ec1 = std::abs(spc1 - pc1);
	double ec2 = std::abs(spc2 - pc2);
	double eta = std::abs(spta - pta);

	// Use 1 mdeg only here
	return (ec1 <= 0.001 && ec2 <= 0.001 && eta <= 0.001);
}

void RunCont::startMeasurement(std::uint64_t runno)
{
	setRunStatus(RunContStatus::STARTING);
	log.info("Received run start command. Adjusting initial parameters.");

	switch(_mode)
	{
		case RunContMode::PARALLEL:
		{
			startPara();
			break;
		}
		case RunContMode::ANTIPARALLEL:
		{
			startAnti();
			break;
		}
	}
}

void RunCont::stopMeasurement(std::uint64_t runno)
{
	setRunStatus(RunContStatus::STOPPING);
	log.warn("Received run stop command. Stopping run as is.");
	setRunStatus(RunContStatus::STOPPED);
}

RunCont::~RunCont()
{
}

int main(int argc, char* argv[])
{
	RunCont backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
