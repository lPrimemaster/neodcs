//  Brief : Simple zlib compressor for gzip 
// Author : César Godinho
//   Date : 29/01/2025

#include <fstream>
#include <string>
#include <zlib.h>

class GZipCompressor
{
public:
	GZipCompressor(const std::string& filename)
	{
		open(filename);
	}

	GZipCompressor() = default;

	~GZipCompressor()
	{
		close();
	}

	bool open(const std::string& filename)
	{
		_zstream = gzopen(filename.c_str(), "ab");
		is_open = _zstream;
		return is_open;
	}

	bool write(const std::string& data)
	{
		gzwrite(_zstream, data.c_str(), data.size());
		return true;
	}

	void close()
	{
		gzclose(_zstream);
	}

private:
	gzFile _zstream;
	bool is_open = false;
};
