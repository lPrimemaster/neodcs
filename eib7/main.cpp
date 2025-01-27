//  Brief : Backend to read the EIB7 angular encoder 
// Author : César Godinho
//   Date : 26/01/2025

#include <chrono>
#include <memory>
#include <mxbackend.h>
#include <string>
#include <mxdrv.h>
#include <mxtypes.h>

#include <eib7.h>
#include <thread>

class Eib7 : public mulex::MxBackend
{
public:
	Eib7(int argc, char* argv[]);
	~Eib7();

private:
	void checkError(EIB7_ERR error);
	void calibrateRefs();
	void poll();

private:
	static constexpr std::uint64_t NUM_AXES = 4;
	static constexpr std::uint32_t TIMESTAMP_PERIOD = 1000; // us
	static constexpr std::uint32_t TRIGGER_PERIOD = 100000; // us

private:
	std::string _hostname;
	EIB7_HANDLE _handle;
	EIB7_AXIS _axis[NUM_AXES];
	EIB7_DataRegion _regions[NUM_AXES] = {
		EIB7_DR_Encoder1,
		EIB7_DR_Encoder2,
		EIB7_DR_Encoder3,
		EIB7_DR_Encoder4
	};
	std::unique_ptr<std::thread> _poll_thread;
	std::atomic<bool> _poll_stop;
	// std::uint32_t _poll_sleep;
};

void Eib7::checkError(EIB7_ERR error)
{
	if(error != EIB7_NoError)
	{
		char mnemonic[32];
        char message[256];

        EIB7GetErrorInfo(error, mnemonic, 32, message, 256);

        log.error("EIB7 Error %08x (%s): %s", error, mnemonic, message);
	}
}

Eib7::Eib7(int argc, char* argv[]) : mulex::MxBackend(argc, argv)
{
	rdb["/user/eib7/calib_mode"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("manual")); // manual or auto

	rdb["/user/eib7/ip"].create(mulex::RdbValueType::STRING, mulex::mxstring<512>("10.80.0.99"));
	_hostname = mulex::mxstring<512>(rdb["/user/eib7/hostname"]).c_str();

	// rdb["/user/eib7/poll_sleep"].create(mulex::RdbValueType::UINT32, std::uint32_t(100));
	// _poll_sleep = rdb["/user/eib7/poll_sleep"];

	std::uint32_t ip;
	std::uint32_t naxes;
	char fw_version[20];

	checkError(EIB7GetHostIP(_hostname, &ip));
	checkError(EIB7Open(ip, &_handle, EIB_TCP_TIMEOUT, fw_version, sizeof(fw_version)));
	checkError(EIB7GetAxis(_handle, _axis, NUM_AXES, &naxes));

	std::uint32_t timestampTicks;
    checkError(EIB7GetTimestampTicks(_handle, &timestampTicks));
	std::uint32_t timestampPeriod = TIMESTAMP_PERIOD * timestampTicks;
    checkError(EIB7SetTimestampPeriod(_handle, timestampPeriod));

	EIB7_DataPacketSection packet[5];
	checkError(EIB7AddDataPacketSection(packet, 0, EIB7_DR_Global, EIB7_PDF_TriggerCounter));

	// enable internal trigger (for now)
	std::uint32_t timerTicks;
    checkError(EIB7GetTimerTriggerTicks(_handle, &timerTicks));
	std::uint32_t timerPeriod = TRIGGER_PERIOD * timerTicks;
    checkError(EIB7SetTimerTriggerPeriod(_handle, timerPeriod));
    checkError(EIB7MasterTriggerSource(_handle, EIB7_AT_TrgTimer));

	rdb["/user/eib7/axis/0/enabled"].create(mulex::RdbValueType::BOOL, true);
	rdb["/user/eib7/axis/1/enabled"].create(mulex::RdbValueType::BOOL, true);
	rdb["/user/eib7/axis/2/enabled"].create(mulex::RdbValueType::BOOL, true);
	rdb["/user/eib7/axis/3/enabled"].create(mulex::RdbValueType::BOOL, true);

	rdb["/user/eib7/axis/0/refmarks"].create(mulex::RdbValueType::UINT8, std::uint8_t(1));
	rdb["/user/eib7/axis/1/refmarks"].create(mulex::RdbValueType::UINT8, std::uint8_t(1));
	rdb["/user/eib7/axis/2/refmarks"].create(mulex::RdbValueType::UINT8, std::uint8_t(1));
	rdb["/user/eib7/axis/3/refmarks"].create(mulex::RdbValueType::UINT8, std::uint8_t(1));

	rdb["/user/eib7/axis/0/sigperiods"].create(mulex::RdbValueType::FLOAT64, 36000.0);
	rdb["/user/eib7/axis/1/sigperiods"].create(mulex::RdbValueType::FLOAT64, 36000.0);
	rdb["/user/eib7/axis/2/sigperiods"].create(mulex::RdbValueType::FLOAT64, 36000.0);
	rdb["/user/eib7/axis/3/sigperiods"].create(mulex::RdbValueType::FLOAT64, 36000.0);

	std::uint32_t packetIndex = 1;
	for(std::int32_t i = 0; i < static_cast<std::int32_t>(naxes); i++)
	{
		bool enabled = rdb["/user/eib7/axis/" + std::to_string(i) + "/enabled"];
		if(!enabled)
		{
			log.warn("Axis %d (X1%d) disabled by control behaviour.", i, i + 1);
			continue;
		}
		log.info("Setting up axis X1%d...", i + 1);

		checkError(EIB7InitAxis(_axis[i],
				EIB7_IT_Incremental_11u,
                EIB7_EC_Rotary,
                EIB7_RM_One,
                0,                    /* reference marks not used */
                0,                    /* reference marks not used */
                EIB7_HS_None,
                EIB7_LS_None,
                EIB7_CS_CompActive,   /* signal compensation on   */
                EIB7_BW_High,         /* signal bandwidth: high   */
                EIB7_CLK_Default,     /* not used for incremental interface */
                EIB7_RT_Long,         /* not used for incremental interface */
                EIB7_CT_Long          /* not used for incremental interface */
		));

		checkError(EIB7SetTimestamp(_axis[i], EIB7_MD_Enable));
        checkError(EIB7AddDataPacketSection(packet, packetIndex++, _regions[i], EIB7_PDF_StatusWord | EIB7_PDF_PositionData | EIB7_PDF_Timestamp | EIB7_PDF_ReferencePos));
        checkError(EIB7AxisTriggerSource(_axis[i], EIB7_AT_TrgTimer));

		log.info("Done.");
	}

	checkError(EIB7ConfigDataPacket(_handle, packet, packetIndex));

    // enable SoftRealtime mode
    checkError(EIB7SelectMode(_handle, EIB7_OM_SoftRealtime));

	calibrateRefs();

	_poll_stop.store(false);
	_poll_thread = std::make_unique<std::thread>(&Eib7::poll, this);
}

void Eib7::poll()
{
	bool enabled[NUM_AXES];
	double sigperiods[NUM_AXES];
	std::string pos_keys[NUM_AXES];
	
	for(std::int32_t i = 0; i < static_cast<std::int32_t>(NUM_AXES); i++)
	{
		   enabled[i] = rdb["/user/eib7/axis/" + std::to_string(i) + "/enabled"];
		sigperiods[i] = rdb["/user/eib7/axis/" + std::to_string(i) + "/sigperiods"];
		  pos_keys[i] = "/user/eib7/axis/" + std::to_string(i) + "/position";

		rdb[pos_keys[i]].create(mulex::RdbValueType::FLOAT64, 0.0);
	}

	while(!_poll_stop.load())
	{
		std::uint8_t  udp_data[200];
		std::uint32_t entries;
		void* 		  field;
		std::uint32_t sz;
		EncoderAxisData eadata;
		EncoderData edata;

		// Read FIFO with UDP
		EIB7_ERR error = EIB7ReadFIFOData(_handle, udp_data, 1, &entries, 0);
		if(error == EIB7_FIFOOverflow)
		{
			log.warn("EIB7 FIFO queue overflow. Clearing.");
			EIB7ClearFIFO(_handle);
		}
		if(entries > 0)
		{
			edata.numAxis = 0;
			for(std::int32_t i = 0; i < static_cast<std::int32_t>(NUM_AXES); i++)
			{
				if(!enabled[i]) continue;

				edata.numAxis++;
				// read trigger counter
				checkError(EIB7GetDataFieldPtr(eib, udp_data, 
							EIB7_DR_Global, 
							EIB7_PDF_TriggerCounter, 
							&field, &sz));
				eadata.triggerCounter = *(u16*)field;

				// read timestamp
				checkError(EIB7GetDataFieldPtr(_handle, udp_data, 
							_regions[i], 
							EIB7_PDF_Timestamp, 
							&field, &sz));
				eadata.timestamp = *(u16*)field;

				// read position
				checkError(EIB7GetDataFieldPtr(_handle, udp_data, 
							_regions[i], 
							EIB7_PDF_PositionData, 
							&field, &sz));
				eadata.position = *(i64*)field;

				// read status
				checkError(EIB7GetDataFieldPtr(_handle, udp_data, 
							_regions[i], 
							EIB7_PDF_StatusWord, 
							&field, &sz));
				eadata.status = *(u16*)field;

				// read ref
				checkError(EIB7GetDataFieldPtr(_handle, udp_data, 
							_regions[i], 
							EIB7_PDF_ReferencePos,
							&field, &sz));
				std::int64_t* posVal = (std::int64_t*)field;
				eadata.ref[0] = posVal[0];
				eadata.ref[1] = posVal[1];

				eadata.position -= eadata.ref[0]; // HACK: (Cesar) One reference mark only
				checkError(EIB7IncrPosToDouble(eadata.position, &eadata.calpos));
				eadata.calpos *= 360.0 / sigperiods[i];

				eadata.axis = (std::int8_t)i + 1;

				edata.axis[i] = eadata;

				// Try RDB
				rdb[pos_keys[i]] = edata.axis[i].calpos;
			}   

			// std::this_thread::sleep_for(std::chrono::milliseconds(_poll_sleep));
		}
		else
		{
			// Sleep until atleast next trigger
			static constexpr i64 spleeptime = TRIGGER_PERIOD / 10;
			std::this_thread::sleep_for(std::chrono::microseconds(spleeptime));
		}
	}
}

Eib7::~Eib7()
{
	_poll_stop.store(true);
	_poll_thread->join();
	_poll_thread.reset();

	// disable trigger
    checkError(EIB7GlobalTriggerEnable(_handle, EIB7_MD_Disable, EIB7_TS_All));

    // disable SoftRealtime mode
    checkError(EIB7SelectMode(_handle, EIB7_OM_Polling));

    // close connection to EIB
    EIB7Close(_handle);
}

void Eib7::calibrateRefs()
{
	log.info("Starting to calibrate reference marks...");

	std::string calib_mode = mulex::mxstring<512>(rdb["/user/eib7/calib_mode"]).c_str();
	bool auto_calib = true;

	if(calib_mode == "manual")
	{
		auto_calib = false;
		log.warn("Reference calibration mode is set to manual. Change the motors setpoint to calibrate reference mark...");
	}

	// Run the ref loop for the encoders
	std::uint32_t nactive_axes = 0;
	for(std::uint32_t i = 0; i < static_cast<std::uint32_t>(NUM_AXES); i++)
	{
		bool enabled = rdb["/user/eib7/axis/" + std::to_string(i) + "/enabled"];
		std::uint8_t nrefs = rdb["/user/eib7/axis/" + std::to_string(i) + "/refmarks"];

		if(!enabled) continue;

		if(nrefs == 0)
		{
			log.warn("Axis %d (X1%d) not using reference marks. Skipping calibration...", i, i + 1);
			continue;
		}

		nactive_axes++;

		checkError(EIB7ClearRefStatus(_axis[i]));

		// HACK: (Cesar) This might be wrong for 2 marks check (legacy code does not handle 2 marks)
		checkError(EIB7StartRef(_axis[i], nrefs == 1 ? EIB7_RP_RefPos1 : EIB7_RP_RefPos2)); // Assuming 1 ref pos only
	}

	std::uint8_t  udp_data[200];
	std::uint32_t entries;
	void* 		  field;
	std::uint32_t sz;
	std::uint32_t got_ref = 0;
	bool 		  referencing[NUM_AXES] = { true, true, true, true };

	if(auto_calib)
	{
		log.info("Automatic calibration is ON. Assuming the XPS-RLD4 backend is online.");
		if(!rdb["/user/xpsrld4/c1/setpoint"].exists())
		{
			log.error("Could not read setpoint key for XPS-RLD4. Defaulting to manual calibration mode.");
			auto_calib = false;
		}
		else
		{
			// Assume c2 exists if c1 does
			// Set all to zero absolute wherever that might be
			rdb["/user/xpsrld4/c1/setpoint"] = 0.0;
			rdb["/user/xpsrld4/c2/setpoint"] = 0.0;
		}
	}

	while(got_ref < nactive_axes)
	{
		EIB7_ERR error = EIB7ReadFIFOData(_handle, udp_data, 1, &entries, 0);
		if(error == EIB7_FIFOOverflow)
		{
			log.warn("EIB7 FIFO queue overflow. Clearing.");
			EIB7ClearFIFO(_handle);
		}

		if(entries > 0)
		{
			for(std::uint32_t i = 0; i < static_cast<std::uint32_t>(NUM_AXES); i++)
			{
				checkError(EIB7GetDataFieldPtr(_handle,
					udp_data,
					_regions[i],
					EIB7_PDF_StatusWord,
					&field,
					&sz
				));

				unsigned short status = *(unsigned short *)field;
				if((status & (1 << 8)))
				{
					if(referencing[i])
					{
						checkError(EIB7GetDataFieldPtr(_handle, udp_data,
							_regions[i],
							EIB7_PDF_ReferencePos,
							&field,
							&sz
						));

						ENCODER_POSITION ref = *(ENCODER_POSITION *)field;
						log.info("Encoder %d (X1%d) head referenced. [ref: %lld]", i, i + 1, ref);
						referencing[i] = false;
					}
					got_ref++;
				}
			}
		}
	}
	log.info("Encoder referencing done!");
}

int main(int argc, char* argv[])
{
	Eib7 backend(argc, argv);
	backend.init();
	backend.spin();
	return 0;
}
