add_executable(axasmca
	main.cpp
)

# Default path from Windows installer
set(XIA_PATH "$ENV{ProgramFiles\(x86\)}/XIA/ProSpect 1.1/sdk")
add_library(xialib INTERFACE)
target_include_directories(xialib INTERFACE ${XIA_PATH}/inc/)
target_link_libraries(xialib INTERFACE ${XIA_PATH}/lib/handel.lib)
message(STATUS ${XIA_PATH})
add_custom_command(TARGET axasmca POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different ${XIA_PATH}/lib/handel.dll $<TARGET_FILE_DIR:axasmca>)
add_custom_command(TARGET axasmca POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different ${XIA_PATH}/lib/xia_usb2.dll $<TARGET_FILE_DIR:axasmca>)
add_custom_command(TARGET axasmca POST_BUILD COMMAND ${CMAKE_COMMAND} -E copy_if_different ${XIA_PATH}/lib/xw.dll $<TARGET_FILE_DIR:axasmca>)

find_package(MxBackend REQUIRED)
find_package(MxDrivers REQUIRED)
target_link_libraries(axasmca PRIVATE Mx::MxBackend Mx::MxDrivers xialib)
