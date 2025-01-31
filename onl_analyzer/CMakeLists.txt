add_executable(analyzer
	main.cpp
)

find_package(MxBackend REQUIRED)
target_link_libraries(analyzer PRIVATE Mx::MxBackend)
