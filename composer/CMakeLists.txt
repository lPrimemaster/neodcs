add_executable(composer
	main.cpp
)

find_package(MxBackend REQUIRED)
target_link_libraries(composer PRIVATE Mx::MxBackend)
