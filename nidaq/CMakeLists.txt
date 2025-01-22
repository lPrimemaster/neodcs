add_executable(nidaq
	main.cpp
)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)
find_package(LibNIDAQmx REQUIRED)

target_link_libraries(nidaq PRIVATE Mx::MxBackend Mx::MxDrivers ${LIBNIDAQMX_LIBRARY})
target_include_directories(nidaq PRIVATE ${LIBNIDAQMX_INCLUDE_DIR})
