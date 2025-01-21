add_executable(esp301
	main.cpp
)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)
target_link_libraries(esp301 PRIVATE Mx::MxBackend Mx::MxDrivers)
