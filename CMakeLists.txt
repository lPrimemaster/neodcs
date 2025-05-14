cmake_minimum_required(VERSION 3.10)

project(neodcs VERSION 1.1.0)

set(CMODE "" CACHE STRING "What version are we compiling (PARis or LISbon).")

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Add find modules to module path
list(APPEND CMAKE_MODULE_PATH "${CMAKE_SOURCE_DIR}/cmake/modules/")

option(LTRACE "Enable tracing." OFF)

if(WIN32)
	set(VCPKG_TARGET_TRIPLET "x64-mingw-dynamic" CACHE STRING "Vcpkg target triplet.")
	set(VCPKG_TARGET_HOST_TRIPLET "x64-mingw-dynamic" CACHE STRING "Vcpkg target triplet.")
endif()

if(LTRACE)
	add_definitions(-DLTRACE)
endif()

macro(generate_paris)
	add_subdirectory(xpsrld4) 		# XPS-RLD4 engine control
	add_subdirectory(eib7) 			# Encoder readout from EIB7
	add_subdirectory(nidaq_ci)  	# NI CI controller
	add_subdirectory(temperature)	# Crystal temperature readout
	add_subdirectory(composer_par)  # File writer / Online analysis
	add_subdirectory(runcont)		# Run control
	add_subdirectory(onl_analyzer)  # Online analyzer
endmacro()

macro(generate_lisbon)
	add_subdirectory(esp301)   	   	# ESP301 engine control
	add_subdirectory(nidaq_ai) 	   	# NI AI controller
	add_subdirectory(composer_lis) 	# File writer / Online analysis
	add_subdirectory(runcont)	   	# Run control
	add_subdirectory(onl_analyzer)  # Online analyzer
	add_subdirectory(axas_mca)		# MCA data gathering
	add_subdirectory(pmc8742)		# Piezo tilt controller
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
