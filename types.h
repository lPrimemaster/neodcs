#pragma once
#include <cstdint>
#include <type_traits>
#include <vector>

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
	std::int64_t timestamp; // This is the timestamp at EVALUTATION TIME!

	CountEvent(std::vector<AnalogPeak> peaks, std::uint64_t counts, std::int64_t timestamp)
	{
		peaks = peaks;
		counts = counts;
		timestamp = timestamp;
	}

	inline virtual std::vector<std::uint8_t> serialize() const override
	{
		std::vector<std::uint8_t> buffer;
		FromVector(buffer, peaks);
		FromValue(buffer, counts);
		FromValue(buffer, timestamp);
		return buffer;
	}

	inline virtual void deserialize(std::vector<std::uint8_t>& buffer) override
	{
		ToVector(buffer, peaks);
		ToValue(buffer, counts);
		ToValue(buffer, timestamp);
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

