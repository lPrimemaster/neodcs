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

class Esp301 : public mulex::MxBackend
{
public:
	enum class Engine
	{
		C1,
		C2,
		DET,
		TABLE
	};

	Esp301(int argc, char* argv[]);
	~Esp301();

private:
	std::string writeCommand(const std::string& command, bool response = true);
	inline std::string toStringPrecision(double value, int prec);
	void moveEngineAbsolute(Engine engine, double pos);
	bool checkEngineExtents(Engine engine, double pos);

private:
	std::string _port;
	mulex::DrvSerialArgs _serial_args;
	mulex::DrvSerial _handle;
};

Esp301::Esp301(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	// The ESP301 uses an rdb key as a target to move the engines
	// Every time this target changes, this backend attempts to
	// move them
	rdb["/user/esp301/setpoint/c1"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/esp301/setpoint/c2"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/esp301/setpoint/table"].create(mulex::RdbValueType::FLOAT64, 0.0f);
	rdb["/user/esp301/setpoint/detector"].create(mulex::RdbValueType::FLOAT64, 0.0f);

	// Default com port
	rdb["/user/esp301/port"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("COM1"));
	_port = std::string(static_cast<mulex::mxstring<512>>(rdb["/user/esp301/port"]).c_str());

	// Baud rates and family could be fixed
	_serial_args.baud = 921600;
	_serial_args.parity = 0;
#ifdef __linux__
	_serial_args.flags = O_RDWR | O_NOCTTY | O_SYNC;
#else
	_serial_args.flags = GENERIC_READ | GENERIC_WRITE;
#endif
	_serial_args.blocking = true;

	// Open the serial port
	_handle = mulex::DrvSerialInit(_port, _serial_args);
	if(_handle._error)
	{
		log.error("Failed to initialize device serial handle at port %s.", _port.c_str());
	}
	else
	{
		log.info("Serial port connected.");
	}
	
	// Now set the watch for setpoint changes and execute motions
	rdb["/user/esp301/setpoint/c1"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::C1, pos); });
	});
	rdb["/user/esp301/setpoint/c2"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::C2, pos); });
	});
	rdb["/user/esp301/setpoint/detector"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::DET, pos); });
	});
	rdb["/user/esp301/setpoint/table"].watch([this](const auto& key, const mulex::RPCGenericType& value) {
		// Plan move as soon as possible
		double pos = value;
		deferExec([this, pos](){ moveEngineAbsolute(Engine::TABLE, pos); });
	});
}

Esp301::~Esp301()
{
	if(!_handle._error)
	{
		log.info("Closing serial port.");
		mulex::DrvSerialClose(_handle);
	}
}

std::string Esp301::writeCommand(const std::string& command, bool response)
{
	std::string output;

	if(_handle._error)
	{
		log.error("Failed to write command to invalid handle.");
		return output;
	}

	mulex::DrvSerialWrite(_handle, reinterpret_cast<const std::uint8_t*>(command.c_str()), command.size());
	mulex::DrvSerialWrite(_handle, reinterpret_cast<const std::uint8_t*>("\r"), 2);

	if(response)
	{
		std::uint8_t buffer[256];
		std::uint64_t rlen;

		auto res = mulex::DrvSerialRead(_handle, buffer, 256, &rlen);
		if(res != mulex::DrvSerialResult::READ_OK)
		{
			log.error("Failed to read result when issueing command: %s", command.c_str());
			return output;
		}

		output.resize(rlen);
		std::memcpy(output.data(), buffer, rlen);
	}

	return output;
}

inline std::string Esp301::toStringPrecision(double value, int prec)
{
	std::stringstream ss;
	ss << std::fixed << std::setprecision(prec) << value;
	return ss.str();
}

bool Esp301::checkEngineExtents(Engine engine, double pos)
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

void Esp301::moveEngineAbsolute(Engine engine, double pos)
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
	Esp301 backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
