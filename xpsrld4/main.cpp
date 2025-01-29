//  Brief : Backend to crontrol the motion of engines via the ESP301 module
// Author : César Godinho
//   Date : 21/01/2025

#include <condition_variable>
#include <functional>
#include <mxbackend.h>
#include <mxdrv.h>
#include <mxtypes.h>
#include <queue>
#include <sstream>
#include <string>
#include <iomanip>
#include <type_traits>

#ifdef __linux__
#include <fcntl.h>
#else
#include <Windows.h>
#endif

#include "../common/pid.h"
#include "../common/utils.h"

// Simple tiny job queue 
class JobQueue
{
public:
	JobQueue(std::uint32_t size);
	~JobQueue();
	void schedule(std::function<void()>&& job, std::uint32_t id);

private:
	struct Job
	{
		Job() : _worker([this](){
			while(true)
			{
				std::function<void()> task;
				{
					std::unique_lock lock(_mutex);
					_cv.wait(lock, [this](){ return _stop || !_queue.empty(); });
					if(_stop) return; // Exit even if the queue as scheduled jobs
					task = std::move(_queue.front());
					_queue.pop();
				}
				task();
			}
		}), _stop(false) { }

		Job(Job&& j)
		{
			_worker = std::move(j._worker);
			_stop = false;
		}

		std::thread _worker;
		std::queue<std::function<void()>> _queue;
		std::mutex _mutex;
		std::condition_variable _cv;
		bool _stop;
	};

	std::vector<Job> _jobs;
};

JobQueue::JobQueue(std::uint32_t size)
{
	_jobs.resize(size);
}

JobQueue::~JobQueue()
{
	for(auto& jq : _jobs)
	{
		{
			std::unique_lock lock(jq._mutex);
			jq._stop = true;
		}
		jq._cv.notify_one();
		jq._worker.join();
	}
}

class Xpsrld4 : public mulex::MxBackend
{
public:
	enum class Engine
	{
		C1,
		C2,
		DET,
		TABLE
	};

	Xpsrld4(int argc, char* argv[]);
	~Xpsrld4();

private:
	std::string writeCommand(std::string& command, bool response = true);
	inline std::string toStringPrecision(double value, int prec);
	void moveEngineAbsolute(Engine engine, double pos);
	void moveEngine(Engine engine, double pos);
	bool checkEngineExtents(Engine engine, double pos);
	void moveEnginePID(Engine engine, double pos, double tolerance);
	double getEnginePosition(Engine engine);

private:
	std::string _ip;
	mulex::DrvTCP _handle;
	std::string _pos_c1;
	std::string _pos_c2;
	std::string _pos_table;
	std::string _pos_detector;

	double _tolerance_c1;
	double _tolerance_c2;

	static constexpr std::uint64_t NUM_PID_JOBS = 2;
	JobQueue _pid_jobs;
	std::vector<PidController> _pid;
};

Xpsrld4::Xpsrld4(int argc, char* argv[]) : mulex::MxBackend(argc, argv), _pid_jobs(NUM_PID_JOBS)
{
	// The XPS-RLD4 uses an rdb key as a target to move the engines
	// Every time this target changes, this backend attempts to move them
	rdb["/user/xpsrld4/c1/setpoint"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/xpsrld4/c2/setpoint"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/xpsrld4/table/setpoint"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/xpsrld4/detector/setpoint"].create(mulex::RdbValueType::FLOAT64, 0.0f);

	// Table and detector get their position from the xpsrld4 controller
	rdb["/user/xpsrld4/table/position"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/xpsrld4/detector/position"].create(mulex::RdbValueType::FLOAT64, 0.0f);

	// Set default PID values
	rdb["/user/xpsrld4/c1/kp"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c1/ki"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c1/kd"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c1/kmin"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c1/kmax"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c1/kbias"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c1/ktolerance"].create(mulex::RdbValueType::FLOAT64, 0.00005);
	_tolerance_c1 = rdb["/user/xpsrld4/c1/ktolerance"];

	rdb["/user/xpsrld4/c2/kp"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c2/ki"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c2/kd"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c2/kmin"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c2/kmax"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c2/kbias"].create(mulex::RdbValueType::FLOAT64, 0.0);
	rdb["/user/xpsrld4/c2/ktolerance"].create(mulex::RdbValueType::FLOAT64, 0.00005);
	_tolerance_c2 = rdb["/user/xpsrld4/c2/ktolerance"];

	double kp = rdb["/user/xpsrld4/c1/kp"];
	double ki = rdb["/user/xpsrld4/c1/ki"];
	double kd = rdb["/user/xpsrld4/c1/kd"];
	double min = rdb["/user/xpsrld4/c1/kmin"];
	double max = rdb["/user/xpsrld4/c1/kmax"];
	double bias = rdb["/user/xpsrld4/c1/kbias"];
	_pid.push_back(PidController(min, max, kp, kd, ki));
	_pid.back().setBias(bias);

	kp = rdb["/user/xpsrld4/c2/kp"];
	ki = rdb["/user/xpsrld4/c2/ki"];
	kd = rdb["/user/xpsrld4/c2/kd"];
	min = rdb["/user/xpsrld4/c2/kmin"];
	max = rdb["/user/xpsrld4/c2/kmax"];
	bias = rdb["/user/xpsrld4/c2/kbias"];
	_pid.push_back(PidController(min, max, kp, kd, ki));
	_pid.back().setBias(bias);

	// Default positioners
	rdb["/user/xpsrld4/c1/positioner"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("C1.Pos"));
	rdb["/user/xpsrld4/c2/positioner"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("C2.Pos"));
	rdb["/user/xpsrld4/table/positioner"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Table.Pos"));
	rdb["/user/xpsrld4/detector/positioner"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("Detector.Pos"));
	_pos_c1 	  = std::string(static_cast<mulex::mxstring<512>>(rdb["/user/xpsrld4/c1/positioner"]).c_str());
	_pos_c2 	  = std::string(static_cast<mulex::mxstring<512>>(rdb["/user/xpsrld4/c2/positioner"]).c_str());
	_pos_table 	  = std::string(static_cast<mulex::mxstring<512>>(rdb["/user/xpsrld4/table/positioner"]).c_str());
	_pos_detector = std::string(static_cast<mulex::mxstring<512>>(rdb["/user/xpsrld4/detector/positioner"]).c_str());
	rdb["/user/xpsrld4/c1/positioner"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		_pos_c1 = mulex::mxstring<512>(value).c_str();
	});
	rdb["/user/xpsrld4/c2/positioner"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		_pos_c2 = mulex::mxstring<512>(value).c_str();
	});
	rdb["/user/xpsrld4/table/positioner"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		_pos_table = mulex::mxstring<512>(value).c_str();
	});
	rdb["/user/xpsrld4/detector/positioner"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		_pos_detector = mulex::mxstring<512>(value).c_str();
	});

	// Default ip
	rdb["/user/xpsrld4/ip"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("10.80.0.100"));
	_ip = std::string(static_cast<mulex::mxstring<512>>(rdb["/user/xpsrld4/ip"]).c_str());


	// Open the serial port
	_handle = mulex::DrvTCPInit(_ip, 5001, 100); // 100ms timeout recv
	if(_handle._socket._error)
	{
		log.error("Failed to initialize device serial handle at ip %s.", _ip.c_str());
	}
	else
	{
		log.info("Connected to %s:5001.", _ip.c_str());
	}
	
	// Now set the watch for setpoint changes and execute motions
	rdb["/user/xpsrld4/c1/setpoint"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::C1, pos); });
	});
	rdb["/user/xpsrld4/c2/setpoint"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::C2, pos); });
	});
	rdb["/user/xpsrld4/detector/setpoint"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::DET, pos); });
	});
	rdb["/user/xpsrld4/table/setpoint"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::TABLE, pos); });
	});

	// Not so critical, update every 500 ms
	// Wait 1 second to start gathering
	deferExec([this]() {
		rdb["/user/xpsrld4/table/posiotion"] = getEnginePosition(Engine::TABLE);
		rdb["/user/xpsrld4/detector/posiotion"] = getEnginePosition(Engine::DET);
	}, 1000, 500);
}

Xpsrld4::~Xpsrld4()
{
	if(!_handle._socket._error)
	{
		log.info("Closing connection.");
		mulex::DrvTCPClose(_handle);
	}
}

std::string Xpsrld4::writeCommand(std::string& command, bool response)
{
	std::string output;

	if(_handle._socket._error)
	{
		log.error("Failed to write command to invalid socket.");
		return output;
	}

	mulex::DrvTCPSend(_handle, reinterpret_cast<std::uint8_t*>(command.data()), command.size());

	if(response)
	{
		std::uint8_t buffer[256];
		std::uint64_t rlen;

		auto res = mulex::DrvTCPRecv(_handle, buffer, 256, 0, &rlen);
		if(res != mulex::DrvTCPResult::RECV_OK || res != mulex::DrvTCPResult::RECV_TIMEOUT)
		{
			log.error("Failed to read result when issueing command: %s", command.c_str());
			return output;
		}

		output.resize(rlen);
		std::memcpy(output.data(), buffer, rlen);
	}

	return output;
}

inline std::string Xpsrld4::toStringPrecision(double value, int prec)
{
	std::stringstream ss;
	ss << std::fixed << std::setprecision(prec) << value;
	return ss.str();
}

bool Xpsrld4::checkEngineExtents(Engine engine, double pos)
{
	switch(engine)
	{
		case Engine::C1:
		case Engine::C2:
		case Engine::DET:
		{
			if(pos < 0.0 || pos > 360.0) return false;
			break;
		}
		case Engine::TABLE:
		{
			log.warn("Check extents for table is wrong.");
			if(pos < 0.0 || pos > 360.0) return false;
			break;
		}
	}
	return true;
}

void Xpsrld4::moveEngineAbsolute(Engine engine, double pos)
{
	std::string command;

	if(!checkEngineExtents(engine, pos))
	{
		log.error("Failed to increment engine %d to theoretical position %lf", static_cast<int>(engine), pos);
		return;
	}

	switch(engine)
	{
		// C1/C2 can move at the same time assuming the xps-rld4 supports it
		case Engine::C1:
		{
			_pid_jobs.schedule([this, engine, pos](){ moveEnginePID(engine, pos, _tolerance_c1); }, 0);
			break;
		}
		case Engine::C2:
		{
			_pid_jobs.schedule([this, engine, pos](){ moveEnginePID(engine, pos, _tolerance_c2); }, 1);
			break;
		}
		case Engine::DET:
		case Engine::TABLE:
		{
			// Detector and table cannot move at the same time
			// Nor at the same time than C1/C2
			moveEngine(engine, pos);
			break;
		}
	}
}

void Xpsrld4::moveEngine(Engine engine, double pos)
{
	std::string command;

	if(!checkEngineExtents(engine, pos))
	{
		log.error("Failed to increment engine %d to theoretical position %lf", static_cast<int>(engine), pos);
		return;
	}

	switch(engine)
	{
		case Engine::C1:
		{
			command = "GroupMoveRelative(" + _pos_c1 + "," + std::to_string(pos) + ")";
			break;
		}
		case Engine::C2:
		{
			command = "GroupMoveRelative(" + _pos_c2 + "," + std::to_string(pos) + ")";
			break;
		}
		case Engine::DET:
		{
			command = "GroupMoveAbsolute(" + _pos_detector + "," + std::to_string(pos) + ")";
			break;
		}
		case Engine::TABLE:
		{
			command = "GroupMoveAbsolute(" + _pos_table + "," + std::to_string(pos) + ")";
			break;
		}
	}

	writeCommand(command);
}

void Xpsrld4::moveEnginePID(Engine engine, double pos, double tolerance)
{
	std::underlying_type_t<Engine> axis = static_cast<std::underlying_type_t<Engine>>(engine);
	if(axis > 1)
	{
		log.error("Cannot move with PID engine that uses positon self-referencing on XPS-RLD4.");
		return;
	}

	double read_pos = rdb["/user/eib7/axis/" + std::to_string(axis) + "/position"];
	PidController& pid = _pid[axis];
	pid.setTarget(pos);
	double err = pid.getError(read_pos);

	const std::uint32_t maxtries = 5;
	std::uint32_t ntry = 0;
	while(std::abs(err) > tolerance)
	{
		if(++ntry > maxtries)
		{
			log.warn("Moving engine reached max tries on PID. Aborting...");
			break;
		}

		double move = pid.correct(read_pos);

		// NOTE: (Cesar) How long does this take? Is the return just an ACK? Or does it wait for motion to end?
		moveEngine(engine, move);

		// NOTE: (Cesar) Wait to stabilize (is this necessary?) - At least the trigger period of the encoder
		std::this_thread::sleep_for(std::chrono::milliseconds(100));

		read_pos = rdb["/user/eib7/axis/" + std::to_string(axis) + "/position"];
		err = pid.getError(read_pos);
	}
}

double Xpsrld4::getEnginePosition(Engine engine)
{
	std::string command;
	switch(engine)
	{
		case Engine::C1:
		case Engine::C2:
		{
			log.error("C1/C2 position is not retreivable from XPS-RLD4.");
			break;
		}
		case Engine::DET:
		{
			command = "GroupPositionCurrentGet(" + _pos_detector + ", double*)";
			break;
		}
		case Engine::TABLE:
		{
			command = "GroupPositionCurrentGet(" + _pos_table + ", double*)";
			break;
		}
	}

	std::string pos_str = writeCommand(command);
	std::vector<std::string> res = splitString(pos_str);

	if(res.size() < 1)
	{
		log.error("Unexpected response from XPS-RLD4.");
		return 0.0;
	}

	if(std::stoi(res[0]) != 0)
	{
		log.error("Error fetching position for positioner. Command: %s.", command.c_str());
		return 0.0;
	}

	if(res.size() < 2)
	{
		log.error("Unexpected response from XPS-RLD4.");
		return 0.0;
	}

	return std::stod(res[1]);
}

int main(int argc, char* argv[])
{
	Xpsrld4 backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
