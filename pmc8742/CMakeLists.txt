add_executable(pmc8742
	main.cpp
)

find_package(PkgConfig REQUIRED)
pkg_check_modules(libusb REQUIRED IMPORTED_TARGET libusb-1.0)

target_link_libraries(pmc8742 PRIVATE PkgConfig::libusb)

find_package(MxBackend REQUIRED)
target_link_libraries(pmc8742 PRIVATE Mx::MxBackend)
