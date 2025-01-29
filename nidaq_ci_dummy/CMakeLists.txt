add_executable(cidaq
	main.cpp
	../common/daq.cpp
)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)
find_package(LibNIDAQmx REQUIRED)

# Unfortunately nidaq has an issue with gcc regarding __int64
# This is a fix (on the version I have)
target_compile_definitions(cidaq PUBLIC "__int64=long long int")

target_link_libraries(cidaq PRIVATE Mx::MxBackend Mx::MxDrivers ${LIBNIDAQMX_LIBRARY})
target_include_directories(cidaq PRIVATE ${LIBNIDAQMX_INCLUDE_DIR})
