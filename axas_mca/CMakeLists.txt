add_executable(axasmca
	main.cpp
)

# Default path from Windows installer
set(VICOLIB_PATH "$ENV{ProgramFiles}/KETEK/VICOLib")
add_library(vicolib INTERFACE)
target_include_directories(vicolib INTERFACE ${VICOLIB_PATH}/Imports/inc/)
target_link_libraries(vicolib INTERFACE ${VICOLIB_PATH}/Imports/libs/VICOLib2.dll)
add_custom_command(TARGET axasmca POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_directory ${VICOLIB_PATH}/Imports/libs/ $<TARGET_FILE_DIR:axasmca>)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)
target_link_libraries(axasmca PRIVATE Mx::MxBackend Mx::MxDrivers vicolib)
