add_executable(composer
	main.cpp
)

find_package(MxBackend REQUIRED)
target_link_libraries(composer PRIVATE Mx::MxBackend ZLIB::ZLIB)
target_compile_definitions(composer PRIVATE _CRT_SECURE_NO_WARNINGS) # Shut up the compiler
