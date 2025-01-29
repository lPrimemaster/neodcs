#pragma once
#include <vector>
#include <string>

// Utilities
std::vector<std::string> splitString(const std::string& str, char delim = ',');
std::string trimString(const std::string& str, const std::string& whitespace = " \t");
