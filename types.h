#pragma once
#include <cstdint>
#include <type_traits>
#include <vector>
#include <mxsystem.h>
#include <cmath>

struct Serializable;

template<typename T>
concept SerializableType = std::is_trivial_v<T> || std::is_base_of_v<Serializable, T>;

struct Serializable
{
	virtual std::vector<std::uint8_t> serialize() const = 0;
	virtual void deserialize(std::vector<std::uint8_t>& buffer) = 0;

	template<SerializableType T>
	static inline void FromVector(std::vector<std::uint8_t>& buffer, const std::vector<T>& data)
	{
		if(data.size() == 0) return;

		if constexpr(std::is_base_of_v<Serializable, T>)
		{
			// buffer.reserve(buffer.size() + data.size() * data[0].size());
			FromValue(buffer, data.size());
			for(const auto& value : data)
			{
				std::vector<std::uint8_t> sbuffer = value.serialize();
				buffer.insert(buffer.end(), sbuffer.begin(), sbuffer.end());
			}
		}
		if constexpr(std::is_trivial_v<T>)
		{
			std::uint64_t psize = buffer.size();
			std::uint64_t vsize = data.size();
			buffer.resize(buffer.size() + data.size() * sizeof(T) + sizeof(std::uint64_t));
			std::memcpy(buffer.data() + psize, &vsize, sizeof(std::uint64_t));
			std::memcpy(buffer.data() + psize + sizeof(std::uint64_t), data.data(), data.size() * sizeof(T));
		}
	}

	template<SerializableType T>
	static inline void FromValue(std::vector<std::uint8_t>& buffer, const T& value)
	{
		if constexpr(std::is_base_of_v<Serializable, T>)
		{
			std::vector<std::uint8_t> sbuffer = value.serialize();
			buffer.insert(buffer.end(), sbuffer.begin(), sbuffer.end());
		}
		if constexpr(std::is_trivial_v<T>)
		{
			std::uint64_t psize = buffer.size();
			buffer.resize(buffer.size() + sizeof(T));
			std::memcpy(buffer.data() + psize, &value, sizeof(T));
		}
	}

	template<SerializableType T>
	static inline void ToVector(std::vector<std::uint8_t>& buffer, std::vector<T>& data)
	{
		if constexpr(std::is_base_of_v<Serializable, T>)
		{
			// buffer.reserve(buffer.size() + data.size() * data[0].size());
			std::uint64_t size;
			std::memcpy(&size, buffer.data(), sizeof(std::uint64_t));
			data.resize(size);
			for(std::uint64_t i = 0; i < size; i++)
			{
				data[i].deserialize(buffer);
				// buffer.erase(buffer.begin(), buffer.begin() + rsize);
			}
		}
		if constexpr(std::is_trivial_v<T>)
		{
			std::uint64_t size;
			std::memcpy(&size, buffer.data(), sizeof(std::uint64_t));
			data.resize(size);
			std::memcpy(data.data(), buffer.data() + sizeof(std::uint64_t), data.size());
			buffer.erase(buffer.begin(), buffer.begin() + size * sizeof(T) + sizeof(std::uint64_t));
		}
	}

	template<SerializableType T>
	static inline void ToValue(std::vector<std::uint8_t>& buffer, T& value)
	{
		if constexpr(std::is_base_of_v<Serializable, T>)
		{
			value.deserialize(buffer);
			// buffer.erase(buffer.begin(), buffer.begin() + rsize);
		}
		if constexpr(std::is_trivial_v<T>)
		{
			std::memcpy(buffer.data(), &value, sizeof(T));
			buffer.erase(buffer.begin(), buffer.begin() + sizeof(T));
		}
	}

	operator std::vector<std::uint8_t>()
	{
		return serialize();
	}
};

struct ADCBuffer : Serializable
{
	std::vector<double> waveform;
	std::int64_t soft_timestamp;

	inline virtual std::vector<std::uint8_t> serialize() const override
	{
		std::vector<std::uint8_t> buffer;
		FromVector(buffer, waveform);
		FromValue(buffer, soft_timestamp);
		return buffer;
	}

	inline virtual void deserialize(std::vector<std::uint8_t>& buffer) override
	{
		ToVector(buffer, waveform);
		ToValue(buffer, soft_timestamp);
	}
};

struct AnalogPeak : Serializable
{
	std::uint64_t pos;
	double height;
	std::uint64_t width;

	inline virtual std::vector<std::uint8_t> serialize() const override
	{
		std::vector<std::uint8_t> buffer;
		FromValue(buffer, pos);
		FromValue(buffer, height);
		FromValue(buffer, width);
		return buffer;
	}

	inline virtual void deserialize(std::vector<std::uint8_t>& buffer) override
	{
		ToValue(buffer, pos);
		ToValue(buffer, height);
		ToValue(buffer, width);
	}
};

struct CountEvent : Serializable
{
	std::vector<AnalogPeak> peaks;
	std::uint64_t counts;
	std::int64_t acq_timestamp;

	// Pressure at chamber points
	double pressure0;
	double pressure1;
	double pressure2;
	std::int64_t ce_timestamp;

	// Relative inclination
	double cli_c1_y;
	double cli_c2_y;
	double cli_c1_x;
	double cli_c2_x;

	// Positions
	double pos_c1;
	double pos_c2;
	double pos_det;
	double pos_tab;

	// Temperature
	double temp_c1;
	double temp_c2;

	// Wobble
	double wobble_c1_x;
	double wobble_c1_y;
	double wobble_c2_x;
	double wobble_c2_y;

	CountEvent(
		std::vector<AnalogPeak> peaks,
		std::uint64_t counts,
		std::int64_t timestamp,
		double p0, double p1, double p2,
		double cc1y, double cc2y,
		double cc1x, double cc2x,
		double posc1, double posc2,
		double posdet, double postab,
		double tc1, double tc2,
		double wc1x, double wc2x,
		double wc1y, double wc2y
	)
	{
		ce_timestamp = mulex::SysGetCurrentTime();
		peaks = peaks;
		counts = counts;
		acq_timestamp = timestamp;
		pressure0 = p0;
		pressure1 = p1;
		pressure2 = p2;
		cli_c1_y = cc1y;
		cli_c2_y = cc2y;
		cli_c1_x = cc1x;
		cli_c2_x = cc2x;
		pos_c1 = posc1;
		pos_c2 = posc2;
		pos_det = posdet;
		pos_tab = postab;
		temp_c1 = tc1;
		temp_c2 = tc2;
		wobble_c1_x = wc1x;
		wobble_c1_y - wc1y;
		wobble_c2_x = wc2x;
		wobble_c2_y - wc2y;
	}

	inline virtual std::vector<std::uint8_t> serialize() const override
	{
		std::vector<std::uint8_t> buffer;
		FromVector(buffer, peaks);
		FromValue(buffer, counts);
		FromValue(buffer, acq_timestamp);
		FromValue(buffer, ce_timestamp);

		FromValue(buffer, pressure0);
		FromValue(buffer, pressure1);
		FromValue(buffer, pressure2);

		FromValue(buffer, cli_c1_y);
		FromValue(buffer, cli_c2_y);
		FromValue(buffer, cli_c1_x);
		FromValue(buffer, cli_c2_x);

		FromValue(buffer, pos_c1);
		FromValue(buffer, pos_c2);
		FromValue(buffer, pos_det);
		FromValue(buffer, pos_tab);

		FromValue(buffer, temp_c1);
		FromValue(buffer, temp_c2);

		FromValue(buffer, wobble_c1_x);
		FromValue(buffer, wobble_c2_x);
		FromValue(buffer, wobble_c1_y);
		FromValue(buffer, wobble_c2_y);
		return buffer;
	}

	inline virtual void deserialize(std::vector<std::uint8_t>& buffer) override
	{
		ToVector(buffer, peaks);
		ToValue(buffer, counts);
		ToValue(buffer, acq_timestamp);
		ToValue(buffer, ce_timestamp);

		ToValue(buffer, pressure0);
		ToValue(buffer, pressure1);
		ToValue(buffer, pressure2);

		ToValue(buffer, cli_c1_y);
		ToValue(buffer, cli_c2_y);
		ToValue(buffer, cli_c1_x);
		ToValue(buffer, cli_c2_x);

		ToValue(buffer, pos_c1);
		ToValue(buffer, pos_c2);
		ToValue(buffer, pos_det);
		ToValue(buffer, pos_tab);

		ToValue(buffer, temp_c1);
		ToValue(buffer, temp_c2);

		ToValue(buffer, wobble_c1_x);
		ToValue(buffer, wobble_c2_x);
		ToValue(buffer, wobble_c1_y);
		ToValue(buffer, wobble_c2_y);
	}
};

struct CICountEvent : Serializable
{
	std::int64_t  timestamp;
	std::uint64_t counts;

	inline virtual std::vector<std::uint8_t> serialize() const override
	{
		std::vector<std::uint8_t> buffer;
		FromValue(buffer, timestamp);
		FromValue(buffer, counts);
		return buffer;
	}

	inline virtual void deserialize(std::vector<std::uint8_t>& buffer) override
	{
		ToValue(buffer, timestamp);
		ToValue(buffer, counts);
	}
};

struct ComposerOutputList
{
	std::int64_t  soft_counts_timestamp;
	std::uint64_t counts;

	std::int64_t  soft_pos_timestamp;
	double 		  c1_pos;
	double 		  c2_pos;
	bool		  c2_moving;
	double 		  table_pos;
	double 		  det_pos;

	double		  temp_c1;
	double		  temp_c2;
};

// Wobble Table
class WobbleTable
{
public:
	WobbleTable(
		const std::vector<double>& r,
		const std::vector<double>& x,
		const std::vector<double>& y
	) : _r(r), _x(x), _y(y)
	{
		_valid = (x.size() == y.size() && x.size() == r.size() && !r.empty());
		_lindex = _r.size() - 1;
	}

	WobbleTable() : _valid(false) { }

	std::pair<double, double> interp(double r)
	{
		if(!_valid) return { 0, 0 };

		if(r <= _r[0]) return { _x[0], _y[0] };
		if(r >= _r[_lindex]) return { _x[_lindex], _y[_lindex] };

		const std::ptrdiff_t idx = std::distance(_r.begin(), std::lower_bound(_r.begin(), _r.end(), r));

		const double r0 = _r[idx - 1];
		const double r1 = _r[idx];
		const double factor = (r - r0) / (r1 - r0);

		return {
			std::lerp(_x[idx - 1], _x[idx], factor),
			std::lerp(_y[idx - 1], _y[idx], factor)	
		};
	}

private:
	std::vector<double> _r, _x, _y;
	bool _valid;
	std::uint64_t _lindex;
};