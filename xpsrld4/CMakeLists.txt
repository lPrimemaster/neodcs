add_executable(xpsrld4
	main.cpp
)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)
target_link_libraries(xpsrld4 PRIVATE Mx::MxBackend Mx::MxDrivers)
