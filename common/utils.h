#pragma once
#include <vector>
#include <string>
#include <cstdint>
#include <algorithm>

// Utilities
std::vector<std::string> splitString(const std::string& str, char delim = ',');
std::string trimString(const std::string& str, const std::string& whitespace = " \t");