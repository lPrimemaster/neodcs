//  Brief : Backend to crontrol the motion of engines via the ESP301 module
// Author : César Godinho
//   Date : 21/01/2025

#include <mxbackend.h>
#include <mxdrv.h>
#include <mxtypes.h>
#include <sstream>
#include <string>
#include <iomanip>

#ifdef __linux__
#include <fcntl.h>
#else
#include <Windows.h>
#endif

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
	bool checkEngineExtents(Engine engine, double pos);

private:
	std::string _ip;
	mulex::DrvTCP _handle;
};

Xpsrld4::Xpsrld4(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	// The XPS-RLD4 uses an rdb key as a target to move the engines
	// Every time this target changes, this backend attempts to
	// move them
	rdb["/user/xpsrld4/setpoint/c1"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/xpsrld4/setpoint/c2"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/xpsrld4/setpoint/table"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/xpsrld4/setpoint/detector"].create(mulex::RdbValueType::FLOAT64, 0.0f);

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
	rdb["/user/xpsrld4/setpoint/c1"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::C1, pos); });
	});
	rdb["/user/xpsrld4/setpoint/c2"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::C2, pos); });
	});
	rdb["/user/xpsrld4/setpoint/detector"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::DET, pos); });
	});
	rdb["/user/xpsrld4/setpoint/table"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::TABLE, pos); });
	});
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
		log.error("Failed to move engine %d to position %lf", static_cast<int>(engine), pos);
		return;
	}

	switch(engine)
	{
		case Engine::C1:
		{
			command = "1PA";
			break;
		}
		case Engine::C2:
		{
			command = "2PA";
			break;
		}
		case Engine::DET:
		{
			command = "3PA";
			break;
		}
		case Engine::TABLE:
		{
			break;
		}
	}
	command += toStringPrecision(pos, 6);
	command += ";";

	writeCommand(command);
}

int main(int argc, char* argv[])
{
	Xpsrld4 backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
