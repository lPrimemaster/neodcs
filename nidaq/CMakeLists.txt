add_executable(nidaq
	main.cpp
)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)
find_package(LibNIDAQmx REQUIRED)

# Unfortunately nidaq has an issue with gcc regarding __int64
# This is a fix (on the version I have)
target_compile_definitions(nidaq PUBLIC "__int64=long long int")

target_link_libraries(nidaq PRIVATE Mx::MxBackend Mx::MxDrivers ${LIBNIDAQMX_LIBRARY})
target_include_directories(nidaq PRIVATE ${LIBNIDAQMX_INCLUDE_DIR})
