//  Brief : Backend to crontrol the motion of engines via the ESP301 module
// Author : César Godinho
//   Date : 21/01/2025

#include <mxbackend.h>
#include <mxdrv.h>
#include <mxtypes.h>
#include <sstream>
#include <string>
#include <iomanip>
#include <cstdint>

#ifdef __linux__
#include <fcntl.h>
#else
#include <Windows.h>
#endif

class Esp301 : public mulex::MxBackend
{
public:
	enum class Engine : std::uint8_t
	{
		C1,
		C2,
		DET,
		TABLE
	};

	enum class Command : std::uint8_t
	{
		GET,
		SET
	};

	Esp301(int argc, char* argv[]);
	~Esp301();

	mulex::RPCGenericType userRPC(const std::vector<std::uint8_t>& data);

private:
	std::string writeCommand(const std::string& command, bool response = true);
	inline std::string toStringPrecision(double value, int prec);
	void moveEngineAbsolute(Engine engine, double pos);
	double getEnginePosition(Engine engine);
	bool checkEngineExtents(Engine engine, double pos);

private:
	std::string _port;
	mulex::DrvSerialArgs _serial_args;
	mulex::DrvSerial _handle;

	std::atomic<double> _pos[3];
};

Esp301::Esp301(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	// Default com port
	rdb["/user/esp301/port"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("COM3"));
	rdb["/user/esp301/port"] = mulex::mxstring<512>("COM3");
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

	registerUserRpc(&Esp301::userRPC);

	// Set axis max velocity to 5
	writeCommand("1VA5", false);
	writeCommand("2VA5", false);
	writeCommand("3VA5", false);

	log.info("OK.");

	std::string v1 = writeCommand("1VA?", true);
	std::string v2 = writeCommand("2VA?", true);
	std::string v3 = writeCommand("3VA?", true);

	mulex::LogDebug("Axis 1 velocity: %s", v1.c_str());
	mulex::LogDebug("Axis 2 velocity: %s", v2.c_str());
	mulex::LogDebug("Axis 3 velocity: %s", v3.c_str());

	deferExec([this]() {
		_pos[0]  = getEnginePosition(Engine::C1);
		_pos[1]  = getEnginePosition(Engine::C2);
		_pos[2] = getEnginePosition(Engine::DET);
	}, 0, 250);
}

Esp301::~Esp301()
{
	if(!_handle._error)
	{
		log.info("Closing serial port.");
		mulex::DrvSerialClose(_handle);
	}
}

mulex::RPCGenericType Esp301::userRPC(const std::vector<std::uint8_t>& data)
{
	// auto [raxis, rtype] = mulex::SysUnpackArguments<std::uint8_t, std::uint8_t>(data);
	const std::uint8_t raxis = *data.data();
	const std::uint8_t rtype = *(data.data() + sizeof(std::uint8_t));

	Engine axis = static_cast<Engine>(raxis);
	Command cmd = static_cast<Command>(rtype);

	std::cout << static_cast<int>(raxis) << " " << static_cast<int>(rtype) << " " << _pos[raxis].load() << std::endl;

	if(cmd == Command::SET)
	{
		const double amount = *reinterpret_cast<const double*>(data.data() + 2 * sizeof(std::uint8_t));
		moveEngineAbsolute(axis, amount);
	}
	else if(cmd == Command::GET)
	{
		return _pos[raxis].load();
	}

	std::cout << "Bad!" << std::endl;
	return std::int32_t(0);
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
	mulex::DrvSerialWrite(_handle, reinterpret_cast<const std::uint8_t*>("\r\n"), 2);

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
			command = "3PA";
			break;
		}
		case Engine::C2:
		{
			command = "1PA";
			break;
		}
		case Engine::DET:
		{
			command = "2PA";
			break;
		}
		case Engine::TABLE:
		{
			break;
		}
	}
	command += toStringPrecision(pos, 6);
	command += ";";

	log.info("Moving engine %d to: %.4lf", static_cast<int>(engine), pos);

	writeCommand(command, false);
}

double Esp301::getEnginePosition(Engine engine)
{
	std::string command;
	switch(engine)
	{
		case Engine::C1:
		{
			command = "3TP";
			break;
		}
		case Engine::C2:
		{
			command = "1TP";
			break;
		}
		case Engine::DET:
		{
			command = "2TP";
			break;
		}
		case Engine::TABLE:
		{
			break;
		}
	}
	command += "?";

	return std::stod(writeCommand(command, true));
}

int main(int argc, char* argv[])
{
	Esp301 backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
