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

#define SM(x) { RunContStatus::x, #x }
static std::map<RunContStatus, std::string> _status_lookup = {
	SM(STARTING),
	SM(STOPPING),
	SM(RUNNING),
	SM(STOPPED),
	SM(ABORTED)
};
#undef SM

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

	void calculateWobbleProfileLookup();

	bool checkEnginesStartPositions();

	void startMeasurement(std::uint64_t runno);
	void stopMeasurement(std::uint64_t runno);
	void setRunStatus(const RunContStatus& status);

	void moveC1Abs(double to);
	void moveC2Abs(double to);
	void moveDEAbs(double to);

	double getC1Pos();
	double getC2Pos();
	double getDEPos();

private:
	RunContMode   				 _mode;
	RunContStatus 				 _status = RunContStatus::STOPPED;
	std::unique_ptr<std::thread> _measurement_thread;
	std::mutex 					 _status_mtx;
};

void RunCont::setRunStatus(const RunContStatus& status)
{
	std::unique_lock lock(_status_mtx);
	_status = status;
	rdb["/user/runcont/status"] = static_cast<std::int32_t>(_status);
	setStatus(_status_lookup[status], "#00ff00");
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

	registerEvent("runcont::wtable_c1");
	registerEvent("runcont::wtable_c2");
}

bool RunCont::setupStart()
{
	double c1pos = rdb["/user/runcont/c1/position"];
	double c2pos = rdb["/user/runcont/c2/start"];
	double tapos = rdb["/user/runcont/table/position"];

	// TODO: (Cesar) Calculate detector start pos

	log.info("Setup start. C1 = %.3lf, C2 = %.3lf, Table = %.3lf", c1pos, c2pos, tapos);

	moveC1Abs(c1pos);
	moveC2Abs(c2pos);
	moveDEAbs(tapos);

	constexpr std::int64_t timeout = 60000; // 2 minutes timeout

	// Wait for position to be within the setpoint
	log.info("Waiting for motion to complete...");
	std::int64_t tp = mulex::SysGetCurrentTime();

	// TODO: (Cesar) Read a file with wobble because we are poor (still)
	// calculateWobbleProfileLookup();

	while(true)
	{
		if(checkEnginesStartPositions())
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

	log.info("Current increment: %.3lf mdeg.", inc * 1000.0);
	log.info("Current tpb: %llu s.", tpb);

	std::uint32_t nbins = static_cast<std::uint32_t>((stop - start) / inc);
	std::int64_t delta = nbins * static_cast<std::int64_t>(tpb);
	std::int64_t eta = mulex::SysGetCurrentTime() + delta;
	rdb["/user/runcont/eta"] = eta;

	log.info("Calculated number of bins: %u.", nbins);

	// TODO: (Cesar) Adjust C1 if need be during the measurement

	if(_measurement_thread)
	{
		_measurement_thread->join();
		_measurement_thread.reset();
	}
	_measurement_thread = std::make_unique<std::thread>([this, nbins, inc, tpb, start](){
		double setpoint = start;
		log.info("Measurement started.");
		for(std::uint32_t i = 0; i < nbins; i++)
		{
			log.info("Current Bin: %u/%u.", i, nbins);
			// NOTE: (Cesar) sleep_for does not assure a super fine wait
			// 				 but should be more than enough for this task
			std::this_thread::sleep_for(std::chrono::seconds(tpb));

			// Move to next
			setpoint += inc;
			moveC2Abs(setpoint);
			// NOTE: (Cesar) Moving time is included in the tpb.
			// 				 The composer logs this on the listmode output.
			// 				 Here we also assume the drift is negligible
			// 				 comparing to the bin time.

			{
				std::unique_lock lock(_status_mtx);
				if(_status != RunContStatus::RUNNING)
				{
					break;
				}
			}
		}
		log.info("Measurement stopped.");

		// Hack run stop
		rdb["/system/run/status"] = std::uint8_t(0);
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

	std::uint8_t cmd = 0;
	double c1 = std::get<1>(callUserRpc<double>("esp301.exe", CallTimeout(1000), std::uint8_t(0), cmd)); // c1
	double c2 = std::get<1>(callUserRpc<double>("esp301.exe", CallTimeout(1000), std::uint8_t(1), cmd)); // c2
	
	double ec1 = std::abs(c1 - spc1);
	double ec2 = std::abs(c2 - spc2);

	// Use 1 mdeg only here
	return (ec1 <= 0.001 && ec2 <= 0.001);
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

void RunCont::moveC1Abs(double to)
{
	callUserRpc("esp301.exe", CallTimeout(1000), std::uint8_t(0), std::uint8_t(1), to); // c1
}

double RunCont::getC1Pos()
{
	return std::get<1>(callUserRpc<double>("esp301.exe", CallTimeout(1000), std::uint8_t(0), std::uint8_t(0))); // c1
}

double RunCont::getC2Pos()
{
	return std::get<1>(callUserRpc<double>("esp301.exe", CallTimeout(1000), std::uint8_t(1), std::uint8_t(0))); // c1
}

double RunCont::getDEPos()
{
	return std::get<1>(callUserRpc<double>("esp301.exe", CallTimeout(1000), std::uint8_t(2), std::uint8_t(0))); // c1
}

void RunCont::moveC2Abs(double to)
{
	callUserRpc("esp301.exe", CallTimeout(1000), std::uint8_t(1), std::uint8_t(1), to); // c2
}

void RunCont::moveDEAbs(double to)
{
	callUserRpc("esp301.exe", CallTimeout(1000), std::uint8_t(2), std::uint8_t(1), to); // det
}

void RunCont::calculateWobbleProfileLookup()
{
	moveC1Abs(0.0);
	moveC2Abs(0.0);

	double c1p = getC1Pos();
	double c2p = getC2Pos();

	// Use an epsilon if this poses a problem
	// WARN: (Cesar) No timeout
	while(c1p != 0.0 && c2p != 0.0)
	{
		c1p = getC1Pos();
		c2p = getC2Pos();
		std::this_thread::sleep_for(std::chrono::milliseconds(100));
	}

	// =======================
	// Calculate wobble for C1
	// =======================
	moveC1Abs(360.0);
	c1p = getC1Pos();

	std::vector<double> r, x, y;
	auto sendTableData = [&](const std::string& evt) {
		std::vector<std::uint8_t> buffer(r.size() * 3 * sizeof(double));
		std::memcpy(buffer.data(), r.data(), r.size() * sizeof(double));
		std::memcpy(buffer.data() + buffer.size() / 3, x.data(), x.size() * sizeof(double));
		std::memcpy(buffer.data() + (buffer.size() / 3 * 2), y.data(), y.size() * sizeof(double));
		dispatchEvent(evt, buffer);
	};


	// Create a table - polling at 10Hz
	while(c1p < 360.0)
	{
		c1p = getC1Pos();

		r.push_back(c1p);
		x.push_back(static_cast<double>(rdb["/user/anglex"]));
		y.push_back(static_cast<double>(rdb["/user/angley"]));

		std::this_thread::sleep_for(std::chrono::milliseconds(100));
	}
	sendTableData("runcont::wtable_c1");

	// =======================
	// Calculate wobble for C2
	// =======================
	moveC2Abs(360.0);
	c1p = getC2Pos();

	r.clear();
	x.clear();
	y.clear();

	// Create a table - polling at 10Hz
	while(c2p < 360.0)
	{
		c1p = getC2Pos();

		r.push_back(c1p);
		x.push_back(static_cast<double>(rdb["/user/anglex"]));
		y.push_back(static_cast<double>(rdb["/user/angley"]));

		std::this_thread::sleep_for(std::chrono::milliseconds(100));
	}
	sendTableData("runcont::wtable_c2");
}

RunCont::~RunCont()
{
	stopMeasurement(0);

	if(_measurement_thread)
	{
		_measurement_thread->join();
		_measurement_thread.reset();
	}
}

int main(int argc, char* argv[])
{
	RunCont backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}