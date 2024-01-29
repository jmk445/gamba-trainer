idf_component_register(SRCS "buttonApp.c" "main_functions.cc" "mfcc.c" "gatts_table_creat_demo.c"
                        audio_provider.cc
                        main_functions.cc
                    PRIV_REQUIRES bt nvs_flash driver spi_flash esp_adc icm42670 tflite-lib esp_timer esp-dsp
                    INCLUDE_DIRS ".")

target_compile_options(${COMPONENT_LIB} PRIVATE
-Wno-maybe-uninitialized
-Wno-missing-field-initializers
-Wno-error=sign-compare
-Wno-error=double-promotion
-Wno-type-limits)