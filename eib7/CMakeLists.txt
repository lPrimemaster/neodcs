add_executable(eib7
	main.cpp
)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)

find_package(EIB7 REQUIRED)

target_link_libraries(eib7 PRIVATE Mx::MxBackend Mx::MxDrivers ${EIB7_LIBRARY})
# target_link_libraries(eib7 PRIVATE Mx::MxBackend Mx::MxDrivers)
