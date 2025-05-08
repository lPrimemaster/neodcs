#include <mxbackend.h>
#include <libusb.h>
#include <sstream>

class PMC8742 : public mulex::MxBackend
{
public:
	PMC8742(int argc, char* argv[]);
	~PMC8742();

	void send(const std::string& command);
	std::string receive();
	bool getEndpoints();

	void moveAbsolute(int controller, int axis, int steps);
	void moveRelative(int controller, int axis, int steps);

private:
	libusb_context* _ctx = nullptr;
	libusb_device_handle* _handle = nullptr;
	bool _error = false;

	std::uint8_t _ep_in;
	std::uint8_t _ep_out;
};

PMC8742::PMC8742(int argc, char* argv[]) : MxBackend(argc, argv)
{
	if(libusb_init(&_ctx) < 0)
	{
		log.error("Failed to init libusb.");
		_error = true;
		return;
	}

	rdb["/user/pmc8742/vid"].create(mulex::RdbValueType::UINT16, std::uint16_t());
	rdb["/user/pmc8742/pid"].create(mulex::RdbValueType::UINT16, std::uint16_t());

	std::uint16_t vid = rdb["/user/pmc8742/vid"];
	std::uint16_t pid = rdb["/user/pmc8742/pid"];

	_handle = libusb_open_device_with_vid_pid(_ctx, vid, pid);
	if(!_handle)
	{
		log.error("Failed to open pmc8742 at %dx-%dx.", vid, pid);
		libusb_exit(_ctx);
		_error = true;
		return;
	}

	if(!getEndpoints())
	{
		log.error("Failed to query USB interface endpoints.");
		_error = true;
		return;
	}

	if(libusb_claim_interface(_handle, 0) < 0)
	{
		log.error("Failed to claim USB interface.");
		_error = true;
		libusb_close(_handle);
		libusb_exit(_ctx);
		return;
	}
}

PMC8742::~PMC8742()
{
	if(!_error)
	{
		libusb_release_interface(_handle, 0);
		libusb_close(_handle);
		libusb_exit(_ctx);
	}
}

void PMC8742::send(const std::string& data)
{
	if(_error) return;

	int written;
	int r = libusb_bulk_transfer(_handle, _ep_out, reinterpret_cast<std::uint8_t*>(const_cast<char*>(data.data())), data.size() + 1, &written, 1000);

	if(r != 0 || written != data.size() + 1)
	{
		log.error("Failed to send data via USB.");
	}
}

std::string PMC8742::receive()
{
	if(_error) return "";

	static std::uint8_t buffer[512];
	int read;
	int r = libusb_bulk_transfer(_handle, _ep_in, buffer, 512, &read, 1000);

	if(r != 0)
	{
		log.error("Failed to receive data via USB.");
		return "";
	}

	std::string out = reinterpret_cast<char*>(buffer);
	// out.resize(read);
	// std::memcpy(out.data(), buffer, read);
	return out;
}

// using last endpoints
bool PMC8742::getEndpoints()
{
	if(_error) return false;

	libusb_device* dev = libusb_get_device(_handle);
	libusb_device_descriptor desc;
	libusb_get_device_descriptor(dev, &desc);

	libusb_config_descriptor* config;
	libusb_get_config_descriptor(dev, 0, &config);

	for(int i = 0; i < config->bNumInterfaces; i++)
	{
		const libusb_interface& iface = config->interface[i];
		for(int j = 0; j < iface.num_altsetting; j++)
		{
			const libusb_interface_descriptor& aset = iface.altsetting[j];
			for(int k = 0; k < aset.bNumEndpoints; k++)
			{
				const libusb_endpoint_descriptor& ep = aset.endpoint[k];
				bool in = (ep.bEndpointAddress & LIBUSB_ENDPOINT_DIR_MASK) == LIBUSB_ENDPOINT_IN;
				log.info("Found Endpoint: 0x%dx (%s).",
			 		ep.bEndpointAddress,
			 		in ? "IN" : "OUT"
				);

				if(in)
				{
					_ep_in = ep.bEndpointAddress;
				}
				else
				{
					_ep_out = ep.bEndpointAddress;
				}
			}
		}
	}

	libusb_free_config_descriptor(config);

	return true;
}

void PMC8742::moveAbsolute(int controller, int axis, int steps)
{
	std::ostringstream ss;
	ss << controller << ">" << axis << "PA" << steps << ";";
	send(ss.str());
}

void PMC8742::moveRelative(int controller, int axis, int steps)
{
	std::ostringstream ss;
	ss << controller << ">" << axis << "PR" << steps << ";";
	send(ss.str());
}

int main(int argc, char* argv[])
{
	PMC8742 instance(argc, argv);
	instance.init();
	instance.spin();
	return 0;
}
