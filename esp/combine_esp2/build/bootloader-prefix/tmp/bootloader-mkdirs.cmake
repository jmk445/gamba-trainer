# Distributed under the OSI-approved BSD 3-Clause License.  See accompanying
# file Copyright.txt or https://cmake.org/licensing for details.

cmake_minimum_required(VERSION 3.5)

file(MAKE_DIRECTORY
  "/home/gamba/esp/esp-idf-v5.1.1/components/bootloader/subproject"
  "/home/gamba/Main/Gamba_Trainer_Dev/esp/combine_esp2/build/bootloader"
  "/home/gamba/Main/Gamba_Trainer_Dev/esp/combine_esp2/build/bootloader-prefix"
  "/home/gamba/Main/Gamba_Trainer_Dev/esp/combine_esp2/build/bootloader-prefix/tmp"
  "/home/gamba/Main/Gamba_Trainer_Dev/esp/combine_esp2/build/bootloader-prefix/src/bootloader-stamp"
  "/home/gamba/Main/Gamba_Trainer_Dev/esp/combine_esp2/build/bootloader-prefix/src"
  "/home/gamba/Main/Gamba_Trainer_Dev/esp/combine_esp2/build/bootloader-prefix/src/bootloader-stamp"
)

set(configSubDirs )
foreach(subDir IN LISTS configSubDirs)
    file(MAKE_DIRECTORY "/home/gamba/Main/Gamba_Trainer_Dev/esp/combine_esp2/build/bootloader-prefix/src/bootloader-stamp/${subDir}")
endforeach()
if(cfgdir)
  file(MAKE_DIRECTORY "/home/gamba/Main/Gamba_Trainer_Dev/esp/combine_esp2/build/bootloader-prefix/src/bootloader-stamp${cfgdir}") # cfgdir has leading slash
endif()
