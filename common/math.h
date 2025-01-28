#pragma once
#include <vector>
#include <numeric>

template<typename T>
T MathAverageArray(const std::vector<T>& values)
{
	return std::accumulate(values.begin(), values.end(), static_cast<T>(0)) / values.size();
}
