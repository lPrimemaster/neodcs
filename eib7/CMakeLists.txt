add_executable(eib7
	main.cpp
)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)

find_package(EIB7 REQUIRED)

message(STATUS ${EIB7_LIBRARY})
target_link_libraries(eib7 PRIVATE ${EIB7_LIBRARY})
target_link_libraries(eib7 PRIVATE Mx::MxBackend Mx::MxDrivers)
target_include_directories(eib7 PRIVATE ${EIB7_INCLUDE_DIR})
# target_link_libraries(eib7 PRIVATE Mx::MxBackend Mx::MxDrivers)
