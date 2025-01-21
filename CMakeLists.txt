cmake_minimum_required(VERSION 3.10)

project(neodcs VERSION 1.0.0)

set(CMODE "" CACHE STRING "What version are we compiling (PARis or LISbon).")

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

macro(generate_paris)
	add_subdirectory(xpsrld4)
endmacro()

macro(generate_lisbon)
	add_subdirectory(esp301) # ESP301 engine control
endmacro()

if(CMODE STREQUAL "")
	message(FATAL_ERROR "CMODE must be specified on configure time at least once. Valid modes = [PAR, LIS].")
elseif(CMODE STREQUAL "PAR")
	generate_paris()
elseif(CMODE STREQUAL "LIS")
	generate_lisbon()
else()
	message(FATAL_ERROR "CMODE ${CMODE} is not valid. Valid modes = [PAR, LIS].")
endif()
