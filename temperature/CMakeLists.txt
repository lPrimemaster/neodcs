add_executable(temperature
	main.cpp
)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)

target_link_libraries(temperature PRIVATE Mx::MxBackend Mx::MxDrivers)
