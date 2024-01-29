/* Copyright 2019 The TensorFlow Authors. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/


#include <cstdlib>
#include <cstring>
#include <string.h>

// FreeRTOS.h must be included before some of the following dependencies.
// Solves b/150260343.
// clang-format off
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
// clang-format on

#include "driver/i2s.h"
#include "esp_log.h"
#include "esp_spi_flash.h"
#include "esp_system.h"
#include "esp_timer.h"
#include "freertos/task.h"

#include "esp_bt.h"
#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"
#include "esp_bt_main.h"
#include "gatts_table_creat_demo.h"
#include "esp_gatt_common_api.h"

#include <stdio.h>
#include "driver/ledc.h"
#include "esp_err.h"

#define LEDC_TIMER              LEDC_TIMER_0
#define LEDC_MODE               LEDC_LOW_SPEED_MODE
#define LEDC_OUTPUT_IO          (8) // Define the output GPIO
#define LEDC_CHANNEL            LEDC_CHANNEL_2
#define LEDC_DUTY_RES           LEDC_TIMER_13_BIT // Set duty resolution to 13 bits
#define LEDC_DUTY               (4095) // Set duty to 50%. ((2 ** 13) - 1) * 50% = 4095
#define LEDC_FREQUENCY          (5000) // Frequency in Hertz. Set frequency at 5 kHz

using namespace std;

static const char* TAG = "AUDIO_PROVIDER";

extern uint16_t heart_rate_handle_table[HRS_IDX_NB];    // BLE로 데이터 전송을 위해 외부의 테이블 데이터
extern uint8_t state;                                   // BLE 연결상태 확인을 위해 외부의 state 데이터

namespace {
int16_t g_audio_output_buffer[512];
bool g_is_audio_initialized = false;
}  // namespace

const int32_t kAudioCaptureBufferSize = 80000;
const int16_t i2s_bytes_to_read = 3200;

uint8_t audio_8data[32000];

static void example_ledc_init(void)
{
    // Prepare and then apply the LEDC PWM timer configuration
    ledc_timer_config_t ledc_timer = {
        .speed_mode       = LEDC_MODE,
        .duty_resolution  = LEDC_DUTY_RES,
        .timer_num        = LEDC_TIMER,
        .freq_hz          = LEDC_FREQUENCY,  // Set output frequency at 5 kHz
        .clk_cfg          = LEDC_AUTO_CLK
    };
    ESP_ERROR_CHECK(ledc_timer_config(&ledc_timer));

    // Prepare and then apply the LEDC PWM channel configuration
    ledc_channel_config_t ledc_channel = {
        .gpio_num       = LEDC_OUTPUT_IO,
        .speed_mode     = LEDC_MODE,
        .channel        = LEDC_CHANNEL,
        .intr_type      = LEDC_INTR_DISABLE,
        .timer_sel      = LEDC_TIMER,
        .duty           = 0, // Set duty to 0%
        .hpoint         = 0
    };
    ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));
}

// audio sensor init
void i2s_init(void) {
  // Start listening for audio: MONO @ 16KHz
  i2s_config_t i2s_config = {
      .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX | I2S_MODE_TX),
      .sample_rate = 16000,
      .bits_per_sample = (i2s_bits_per_sample_t)16,
      .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
      .communication_format = I2S_COMM_FORMAT_I2S,
      .intr_alloc_flags = 0,
      .dma_buf_count = 3,
      .dma_buf_len = 300,
      .use_apll = false,
      .tx_desc_auto_clear = false,
      .fixed_mclk = -1,
  };
  i2s_pin_config_t pin_config = {
      .bck_io_num = 41,    // IIS_SCLK
      .ws_io_num = 42,     // IIS_LCLK
      .data_out_num = -1,  // IIS_DSIN
      .data_in_num = 2,   // IIS_DOUT
  };
  esp_err_t ret = 0;
  ret = i2s_driver_install((i2s_port_t)1, &i2s_config, 0, NULL);
  if (ret != ESP_OK) {
    ESP_LOGE(TAG, "Error in i2s_driver_install");
  }
  ret = i2s_set_pin((i2s_port_t)1, &pin_config);
  if (ret != ESP_OK) {
    ESP_LOGE(TAG, "Error in i2s_set_pin");
  }

  ret = i2s_zero_dma_buffer((i2s_port_t)1);
  if (ret != ESP_OK) {
    ESP_LOGE(TAG, "Error in initializing dma buffer with 0");
  }
  example_ledc_init();    // led 초기화
}

// 1초동안 audio data Capture
void CaptureSamples() {
  ESP_LOGI(TAG, "CaptureSamples() called!");
  ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, LEDC_CHANNEL, LEDC_DUTY));
  // Update duty to apply the new value
  ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, LEDC_CHANNEL));
  size_t bytes_read = i2s_bytes_to_read;
  uint8_t i2s_read_buffer[i2s_bytes_to_read] = {};
  uint8_t send_block[400];  //BLE 전송을 위한 데이터 공간
  uint8_t* block_buffer;
  // 100ms 마다 3200 bytes씩 음성 데이터를 읽어와 전송 (10번 반복하여 1초동안의 오디오 데이터를 전송)
  for(int i=0;i<10;i++) {
    /* read 100ms data at once from i2s */
    i2s_read((i2s_port_t)1, (void*)i2s_read_buffer, i2s_bytes_to_read,
             &bytes_read, 10);
    if (bytes_read <= 0) {
      ESP_LOGE(TAG, "Error in I2S read : %d", bytes_read);
    } else {
      if (bytes_read < i2s_bytes_to_read) {
        ESP_LOGW(TAG, "Partial I2S read");
      }
      
      for(int i=0;i<8;i++) {
        // 3200 bytes를 400bytes씩 8번 나누어 전송 (MTU가 500으로 설정되어있어 끊어서 전송이 필요함)
        memcpy(send_block,(i2s_read_buffer + i*400),sizeof(uint8_t)*400);
        esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_voiceData],
                                    sizeof(send_block), send_block, false);
      }
      ESP_LOGI(TAG, "send COMPLETE!!");
    }
  }
  ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, LEDC_CHANNEL, 0));
  // Update duty to apply the new value
  ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, LEDC_CHANNEL));
  vTaskDelete(NULL);
}

void CaptureSamples2() {
  ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, LEDC_CHANNEL, LEDC_DUTY));
  // Update duty to apply the new value
  ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, LEDC_CHANNEL));
  ESP_LOGI(TAG, "CaptureSamples2() called!");
  size_t bytes_read = i2s_bytes_to_read;
  uint8_t i2s_read_buffer[i2s_bytes_to_read] = {};
  // 100ms 마다 3200 bytes씩 음성 데이터를 읽어와 전송 (10번 반복하여 1초동안의 오디오 데이터를 전송)
  for(int i=0;i<10;i++) {
    /* read 100ms data at once from i2s */
    i2s_read((i2s_port_t)1, (void*)i2s_read_buffer, i2s_bytes_to_read,
             &bytes_read, 10);
    if (bytes_read <= 0) {
      ESP_LOGE(TAG, "Error in I2S read : %d", bytes_read);
    } else {
      if (bytes_read < i2s_bytes_to_read) {
        ESP_LOGW(TAG, "Partial I2S read");
      }
      // for(int j=0;j<i2s_bytes_to_read;j+=2) {
      //   audio_data[i*1600 + j/2] = (i2s_read_buffer[j+1] << 8) | i2s_read_buffer[j];
      // }
      memcpy(&audio_8data[i * 3200], i2s_read_buffer, sizeof(i2s_read_buffer));
      ESP_LOGI(TAG, "store COMPLETE!!");
    }
  }
  ESP_LOGI(TAG, "ALL store COMPLETE!!");
  ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, LEDC_CHANNEL, 0));
  // Update duty to apply the new value
  ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, LEDC_CHANNEL));
}