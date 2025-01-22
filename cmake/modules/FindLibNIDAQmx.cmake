# For native x86_64
set(NI_PPATH "National Instruments/Shared/ExternalCompilerSupport/C")
set(_pf_x86 "$ENV{ProgramFiles\(x86\)}/${NI_PPATH}")
list(APPEND NIDAQMX_PATH ${_pf_x86})

# Search on any other locations case necessary
# list(APPEND NIDAQMX_PATH "C:/ProgramFiles(x86)/National Instruments/Shared/ExternalCompilerSupport/C")

# Find installed library using CMake functions
find_library(LIBNIDAQMX_LIBRARY 
			NAMES "nidaqmx"
            PATHS ${NIDAQMX_PATH}
            PATH_SUFFIXES "lib64/msvc")

message(STATUS ${LIBNIDAQMX_LIBRARY})
message(STATUS ${NIDAQMX_PATH})
            
find_path(LIBNIDAQMX_INCLUDE_DIR 
			NAMES "NIDAQmx.h"
            PATHS ${NIDAQMX_PATH}
            PATH_SUFFIXES "include")

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(LibNIDAQmx  DEFAULT_MSG
                                  LIBNIDAQMX_LIBRARY LIBNIDAQMX_INCLUDE_DIR)

# Dont display these vars to the user
mark_as_advanced(LIBNIDAQMX_LIBRARY LIBNIDAQMX_INCLUDE_DIR)
