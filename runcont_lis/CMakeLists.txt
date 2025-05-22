add_executable(runcont
	main.cpp
)

find_package(MxBackend REQUIRED)
target_link_libraries(runcont PRIVATE Mx::MxBackend)
