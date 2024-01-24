/* Copyright 2020 The TensorFlow Authors. All Rights Reserved.

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
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/time.h>
#include <cmath>

#include "esp_log.h"
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "gatts_table_creat_demo.h"

#include "tensorflow/lite/micro/micro_interpreter.h"
#include "tensorflow/lite/micro/micro_log.h"
#include "tensorflow/lite/micro/micro_mutable_op_resolver.h"
#include "tensorflow/lite/micro/system_setup.h"
#include "tensorflow/lite/schema/schema_generated.h"

#include <driver/gpio.h>
#include <driver/uart.h>
#include <icm42670.h>

#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"

#include "mfcc.h"
#include "buttonApp.h"
#include "esp_event.h"

#define ICM42670_I2C_ADDR_GND (0x68)
#define ICM42670_I2C_ADDR_VCC (0x69)
#define PORT 0
#define I2C_ADDR ICM42670_I2C_ADDR_GND

const gpio_num_t EXAMPLE_I2C_MASTER_SCL = GPIO_NUM_5; // GPIO number for I2C Master clock line
const gpio_num_t EXAMPLE_I2C_MASTER_SDA = GPIO_NUM_4; // GPIO number for I2C Master data line
const gpio_num_t EXAMPLE_INT_INPUT_PIN = GPIO_NUM_0;   // GPIO number for Interrupt Input Pin


extern uint8_t *newModelFileData;                     // 가장 최근 수신된 모델
extern uint8_t state;                                 // 현재 state
extern int16_t acc_gyro_value[6];                     // 6측 센서의 값을 저장할 공간
extern float buffer[6];                               // 6측 센서의 값을 [-1,1]로 매핑하여 저장 및 전송을 위해 쓰이는 공간
extern uint16_t heart_rate_handle_table[HRS_IDX_NB];  // 핸들러의 저장 공간
extern uint8_t audio_8data[32000];                    //오디오 데이터 저장공간
extern uint8_t what_project;
extern uint8_t recording_speech;
extern uint8_t num_label;

// Globals, used for compatibility with Arduino-style sketches.
namespace {
const tflite::Model* model = nullptr;
tflite::MicroInterpreter* interpreter = nullptr;
TfLiteTensor* model_input = nullptr;
TfLiteTensor* model_output = nullptr;

constexpr int kTensorArenaSize = 24 * 1024;
uint8_t tensor_arena[kTensorArenaSize];

uint8_t numSamples = 20;
uint8_t samplesRead = 20;
float accelerationThreshold = 0.03;
bool isModelLoded = false;

// 동작 종류, 모델의 class와 동일해야함
const uint8_t GESTURES[] = {
    0, 1, 2, 3, 4, 5, 6
};
// const char* GESTURES2[] = {
//     "up", "down", "left", "right"
// };
}  // namespace

// #define NUM_GESTURES (sizeof(GESTURES) / sizeof(GESTURES[0]))

void setup() {
  ESP_LOGI("test", "setup() called!");
  // Map the model into a usable data structure. This doesn't involve any
  // copying or parsing, it's a very lightweight operation.
  model = tflite::GetModel(newModelFileData);
  if (model->version() != TFLITE_SCHEMA_VERSION) {
    MicroPrintf("Model provided is schema version %d not equal to supported "
                "version %d.", model->version(), TFLITE_SCHEMA_VERSION);
    return;
  }

  static tflite::MicroMutableOpResolver<7> micro_op_resolver;
  if (micro_op_resolver.AddFullyConnected() != kTfLiteOk) {
    return;
  }
  if (micro_op_resolver.AddRelu() != kTfLiteOk) {
    return;
  }
  if (micro_op_resolver.AddSoftmax() != kTfLiteOk) {
    return;
  }
  if (micro_op_resolver.AddConv2D() != kTfLiteOk) {
    return;
  }
  if (micro_op_resolver.AddDepthwiseConv2D() != kTfLiteOk) {
    return;
  }
  if (micro_op_resolver.AddMaxPool2D() != kTfLiteOk) {
    return;
  }
  if (micro_op_resolver.AddReshape() != kTfLiteOk) {
    return;
  }

  // Build an interpreter to run the model with.
  static tflite::MicroInterpreter static_interpreter(
      model, micro_op_resolver, tensor_arena, kTensorArenaSize);
  interpreter = &static_interpreter;

  // Allocate memory from the tensor_arena for the model's tensors.
  TfLiteStatus allocate_status = interpreter->AllocateTensors();
  if (allocate_status != kTfLiteOk) {
    MicroPrintf("AllocateTensors() failed");
    return;
  }

  // Get information about the memory area to use for the model's input.
  model_input = interpreter->input(0);
  model_output = interpreter->output(0);
  ESP_LOGI("test", "void setup() complete");

}

// 만들어진 모델을 통해 특정모션(imuData)을 추론하고 결과를 전송하는 Task, state가 3(INFERENCE)일때만 데이터를 보내다가 state 변경시 task Delete
void inference() {
  ESP_LOGI("test","void inference called! %u, %u", state, what_project);
  if(what_project == 0) {
    icm42670_t dev = { 0 };
    ESP_ERROR_CHECK(icm42670_init_desc(&dev, I2C_ADDR, PORT, EXAMPLE_I2C_MASTER_SDA, EXAMPLE_I2C_MASTER_SCL));
    ESP_ERROR_CHECK(icm42670_init(&dev));

    // enable accelerometer and gyro in low-noise (LN) mode
    ESP_ERROR_CHECK(icm42670_set_gyro_pwr_mode(&dev, ICM42670_GYRO_ENABLE_LN_MODE));
    ESP_ERROR_CHECK(icm42670_set_accel_pwr_mode(&dev, ICM42670_ACCEL_ENABLE_LN_MODE));

    /* OPTIONAL */
    // enable low-pass-filters on accelerometer and gyro
    ESP_ERROR_CHECK(icm42670_set_accel_lpf(&dev, ICM42670_ACCEL_LFP_53HZ));
    ESP_ERROR_CHECK(icm42670_set_gyro_lpf(&dev, ICM42670_GYRO_LFP_53HZ));
    // set output data rate (ODR)
    ESP_ERROR_CHECK(icm42670_set_accel_odr(&dev, ICM42670_ACCEL_ODR_200HZ));
    ESP_ERROR_CHECK(icm42670_set_gyro_odr(&dev, ICM42670_GYRO_ODR_200HZ));
    // set full scale range (FSR)
    ESP_ERROR_CHECK(icm42670_set_accel_fsr(&dev, ICM42670_ACCEL_RANGE_16G));
    ESP_ERROR_CHECK(icm42670_set_gyro_fsr(&dev, ICM42670_GYRO_RANGE_2000DPS));

    int16_t raw_reading;
    uint8_t data_register;
    
    data_register = ICM42670_REG_GYRO_DATA_X1;

    while(state == 3) {
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_ACCEL_DATA_X1, &acc_gyro_value[0]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_ACCEL_DATA_Y1, &acc_gyro_value[1]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_ACCEL_DATA_Z1, &acc_gyro_value[2]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_GYRO_DATA_X1, &acc_gyro_value[3]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_GYRO_DATA_Y1, &acc_gyro_value[4]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_GYRO_DATA_Z1, &acc_gyro_value[5]));

      buffer[0] = acc_gyro_value[0] / 32768.0;
      buffer[1] = acc_gyro_value[1] / 32768.0;
      buffer[2] = acc_gyro_value[2] / 32768.0;
      buffer[3] = acc_gyro_value[3] / 32768.0;
      buffer[4] = acc_gyro_value[4] / 32768.0;
      buffer[5] = acc_gyro_value[5] / 32768.0;
      if (samplesRead == numSamples) {
        const float aSum = (fabs(buffer[0]) + fabs(buffer[1]) + fabs(buffer[2]) + fabs(buffer[3]) + fabs(buffer[4]) + fabs(buffer[5])) / 6.0;
        // check if it's above the threshold
        if (aSum >= accelerationThreshold) {
          samplesRead = 0;
          for (int i = 0; i < model_input->bytes; ++i) {
            model_input->data.uint8[i] = 0.0f;
          }
        }
      }

      if (samplesRead < numSamples) {  
        const int dataLen = 6;
        ESP_LOGI("test", "%f, %f, %f, %f, %f, %f",buffer[0], buffer[1], buffer[2], buffer[3], buffer[4] ,buffer[5]);
        const float velocity = (fabs(buffer[0]) + fabs(buffer[1]) + fabs(buffer[2])) / 3.0; 
        
        model_input->data.f[samplesRead * dataLen + 0] = buffer[0];
        model_input->data.f[samplesRead * dataLen + 1] = buffer[1];
        model_input->data.f[samplesRead * dataLen + 2] = buffer[2];
        model_input->data.f[samplesRead * dataLen + 3] = buffer[3];
        model_input->data.f[samplesRead * dataLen + 4] = buffer[4];
        model_input->data.f[samplesRead * dataLen + 5] = buffer[5];
        
        samplesRead++;

        if (samplesRead == numSamples)
        {
          // Run inferencing
          TfLiteStatus invokeStatus = interpreter->Invoke();
          if (invokeStatus != kTfLiteOk)
          {
            ESP_LOGE("test", "Invoke failed!");
            while (1);
            return;
          }
          ESP_LOGI("test","Input size: %u",model_input->bytes / 4);
          ESP_LOGI("test", "Output size: %d", model_output->bytes / 4);
          // Loop through the output tensor values from the model
          uint8_t maxIndex = 0;
          float maxValue = 0;
          for (int i = 0; i < num_label; i++) {
            float _value = model_output->data.f[i];
            if (_value > maxValue)
            {
              maxValue = _value;
              maxIndex = i;
            }
            ESP_LOGI("test","%d:  %f",GESTURES[i], _value);
          }
          ESP_LOGI("test","Winner:  %d",GESTURES[maxIndex]);
          //uint8_t result[3] = {maxIndex, (uint8_t)(maxValue * 255.999), (uint8_t)velocity};
          uint8_t result[1] = {maxIndex};
          esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_inferenceTx],
                                      sizeof(result), result, false);
          uint8_t uart_result[2] = {maxIndex, 0xfe};
          uart_write_bytes(ECHO_UART_PORT_NUM, (const char *) uart_result, 2);
          ESP_LOGI("uart", "gogo1 %u", uart_result[0]);
          if(ret) {
            ESP_LOGI("error", "errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
          }
          
        }
      }
      vTaskDelay(pdMS_TO_TICKS(50));
    }
  }
  else if(what_project == 1) {
    mfcc_init();
    while(state == 3) {
      if(recording_speech != 1) {
        vTaskDelay(pdMS_TO_TICKS(50));
        continue;
      }
      CaptureSamples2();
      
      int32_t data_head = 0; 
      int16_t* audio_data = NULL;  //16000
      float* freq_data = NULL; //[NUM_FRAMES * NUM_BINS]

      audio_data = (int16_t*)malloc(16000 * sizeof(int16_t));
      for (int i = 0; i < 32000; i += 2) {
        //uint16_t 변환
        uint8_t byte1 = audio_8data[i];
        uint8_t byte2 = audio_8data[i + 1];

        // Combine two 8-bit bytes into one 16-bit signed integer
        audio_data[i / 2] = (byte2 << 8) | byte1;
      }
      freq_data = (float*)malloc(NUM_FRAMES * NUM_BINS * sizeof(float));
      for (uint16_t i = 0; i < 49; i++) {
        //stft 변환
        mfcc_compute(audio_data + (i * 320), &freq_data[data_head]);
        data_head += 513;
      }
      float max = freq_data[0]; // 배열의 첫 번째 요소를 초기 최댓값으로 설정
      for (int i = 1; i < 49*513-1; i++) {
        if (freq_data[i] > max) {
          max = freq_data[i]; // 더 큰 값을 찾으면 최댓값을 업데이트
        }
      }
      ESP_LOGI("test","Max value: %f",max);
      ESP_LOGI("test","Input size: %u",model_input->bytes / 4);
      ESP_LOGI("test", "Output size: %d", model_output->bytes / 4);

      for (int i = 0; i < model_input->bytes; ++i) {
        model_input->data.uint8[i] = 0.0f;
      }

      float x_ratio = static_cast<float>(NUM_BINS - 1) / (16 - 1);
      float y_ratio = static_cast<float>(NUM_FRAMES - 1) / (16 - 1);

      for (uint8_t i = 0; i < 16; i++) {
        for (uint8_t j = 0; j < 16; j++) {
          int x_l = static_cast<int>(x_ratio * j);
          int y_l = static_cast<int>(y_ratio * i);
          int x_h = static_cast<int>(ceil(x_ratio * j));
          int y_h = static_cast<int>(ceil(y_ratio * i));

          float x_weight = (x_ratio * j) - x_l;
          float y_weight = (y_ratio * i) - y_l;

          float a = freq_data[y_l * NUM_BINS + x_l];
          float b = freq_data[y_l * NUM_BINS + x_h];
          float c = freq_data[y_h * NUM_BINS + x_l];
          float d = freq_data[y_h * NUM_BINS + x_h];

          float pixel = a * (1 - x_weight) * (1 - y_weight)
                + b * x_weight * (1 - y_weight)
                + c * y_weight * (1 - x_weight)
                + d * x_weight * y_weight;

          model_input->data.f[i*16 + j] = pixel;
          if(i == 0) {
            ESP_LOGI("test", "input Data: %f", pixel);
          }
        }
      }
      // for(int i=0; i<16*16; i++) {
      //   int start = i * NUM_FRAMES * NUM_BINS / (16*16);
      //   int end = (i + 1) * NUM_FRAMES * NUM_BINS / (16*16);

      //   float sum = 0.0;
      //   for (int j = start; j < end; j++) {
      //       sum += freq_data[j];
      //   }

      //   // ESP_LOGI("test", "sum: %f %f", sum, freq_data[i]);
      //   model_input->data.f[i] = sum / (end - start);
      // }
      TfLiteStatus invokeStatus = interpreter->Invoke();
      if (invokeStatus != kTfLiteOk)
      {
        ESP_LOGE("test", "Invoke failed!");
        while (1);
        return;
      }
      uint8_t maxIndex = 0;
      float maxValue = 0;
      for (int i = 0; i < num_label; i++) {
        float _value = model_output->data.f[i];
        if (_value > maxValue)
        {
          maxValue = _value;
          maxIndex = i;
        }
        ESP_LOGI("test","%d:  %f",GESTURES[i], _value);
      }
      ESP_LOGI("test","Winner:  %d",GESTURES[maxIndex]);
      // audio_data에 저장된 값을 spectrogram으로 만들고 resize
      // 모델 검증후 결과를 BLE로 전송
      uint8_t result[1] = {maxIndex};
      esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_inferenceTx],
                                  sizeof(result), result, false);
                                  
      uint8_t uart_result[2] = {maxIndex, 0xfe};
      uart_write_bytes(ECHO_UART_PORT_NUM, (const char *) uart_result, 2);
      ESP_LOGI("uart", "gogo2 %u", uart_result[0]);
      if(ret) {
        ESP_LOGI("error", "errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
      }
      recording_speech = 0;
      free(audio_data);
      free(freq_data);
      vTaskDelay(pdMS_TO_TICKS(50));
    }
  }
  else if(what_project == 2) {
  
  }
  vTaskDelete(NULL);
}

void challenge() {
  ESP_LOGI("test","void challenge called! %u, %u", state, what_project);
  if(what_project == 0) {
    icm42670_t dev = { 0 };
    ESP_ERROR_CHECK(icm42670_init_desc(&dev, I2C_ADDR, PORT, EXAMPLE_I2C_MASTER_SDA, EXAMPLE_I2C_MASTER_SCL));
    ESP_ERROR_CHECK(icm42670_init(&dev));

    // enable accelerometer and gyro in low-noise (LN) mode
    ESP_ERROR_CHECK(icm42670_set_gyro_pwr_mode(&dev, ICM42670_GYRO_ENABLE_LN_MODE));
    ESP_ERROR_CHECK(icm42670_set_accel_pwr_mode(&dev, ICM42670_ACCEL_ENABLE_LN_MODE));

    /* OPTIONAL */
    // enable low-pass-filters on accelerometer and gyro
    ESP_ERROR_CHECK(icm42670_set_accel_lpf(&dev, ICM42670_ACCEL_LFP_53HZ));
    ESP_ERROR_CHECK(icm42670_set_gyro_lpf(&dev, ICM42670_GYRO_LFP_53HZ));
    // set output data rate (ODR)
    ESP_ERROR_CHECK(icm42670_set_accel_odr(&dev, ICM42670_ACCEL_ODR_200HZ));
    ESP_ERROR_CHECK(icm42670_set_gyro_odr(&dev, ICM42670_GYRO_ODR_200HZ));
    // set full scale range (FSR)
    ESP_ERROR_CHECK(icm42670_set_accel_fsr(&dev, ICM42670_ACCEL_RANGE_16G));
    ESP_ERROR_CHECK(icm42670_set_gyro_fsr(&dev, ICM42670_GYRO_RANGE_2000DPS));

    int16_t raw_reading;
    uint8_t data_register;
    
    data_register = ICM42670_REG_GYRO_DATA_X1;

    while(state == 0 || state == 1) {
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_ACCEL_DATA_X1, &acc_gyro_value[0]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_ACCEL_DATA_Y1, &acc_gyro_value[1]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_ACCEL_DATA_Z1, &acc_gyro_value[2]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_GYRO_DATA_X1, &acc_gyro_value[3]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_GYRO_DATA_Y1, &acc_gyro_value[4]));
      ESP_ERROR_CHECK(icm42670_read_raw_data(&dev, ICM42670_REG_GYRO_DATA_Z1, &acc_gyro_value[5]));

      buffer[0] = acc_gyro_value[0] / 32768.0;
      buffer[1] = acc_gyro_value[1] / 32768.0;
      buffer[2] = acc_gyro_value[2] / 32768.0;
      buffer[3] = acc_gyro_value[3] / 32768.0;
      buffer[4] = acc_gyro_value[4] / 32768.0;
      buffer[5] = acc_gyro_value[5] / 32768.0;
      if (samplesRead == numSamples) {
        const float aSum = (fabs(buffer[0]) + fabs(buffer[1]) + fabs(buffer[2]) + fabs(buffer[3]) + fabs(buffer[4]) + fabs(buffer[5])) / 6.0;
        // check if it's above the threshold
        if (aSum >= accelerationThreshold) {
          samplesRead = 0;
          for (int i = 0; i < model_input->bytes; ++i) {
            model_input->data.uint8[i] = 0.0f;
          }
        }
      }

      if (samplesRead < numSamples) {  
        const int dataLen = 6;
        ESP_LOGI("test", "%f, %f, %f, %f, %f, %f",buffer[0], buffer[1], buffer[2], buffer[3], buffer[4] ,buffer[5]);
        const float velocity = (fabs(buffer[0]) + fabs(buffer[1]) + fabs(buffer[2])) / 3.0; 
        
        model_input->data.f[samplesRead * dataLen + 0] = buffer[0];
        model_input->data.f[samplesRead * dataLen + 1] = buffer[1];
        model_input->data.f[samplesRead * dataLen + 2] = buffer[2];
        model_input->data.f[samplesRead * dataLen + 3] = buffer[3];
        model_input->data.f[samplesRead * dataLen + 4] = buffer[4];
        model_input->data.f[samplesRead * dataLen + 5] = buffer[5];
        
        samplesRead++;

        if (samplesRead == numSamples)
        {
          // Run inferencing
          TfLiteStatus invokeStatus = interpreter->Invoke();
          if (invokeStatus != kTfLiteOk)
          {
            ESP_LOGE("test", "Invoke failed!");
            while (1);
            return;
          }
          ESP_LOGI("test","Input size: %u",model_input->bytes / 4);
          ESP_LOGI("test", "Output size: %d", model_output->bytes / 4);
          // Loop through the output tensor values from the model
          uint8_t maxIndex = 0;
          float maxValue = 0;
          for (int i = 0; i < num_label; i++) {
            float _value = model_output->data.f[i];
            if (_value > maxValue)
            {
              maxValue = _value;
              maxIndex = i;
            }
            ESP_LOGI("test","%d:  %f",GESTURES[i], _value);
          }
          ESP_LOGI("test","Winner:  %d",GESTURES[maxIndex]);
          //uint8_t result[3] = {maxIndex, (uint8_t)(maxValue * 255.999), (uint8_t)velocity};
          uint8_t result[1] = {maxIndex};
          
          uint8_t uart_result[2] = {maxIndex, 0xfe};
          uart_write_bytes(ECHO_UART_PORT_NUM, (const char *) uart_result, 2);
          ESP_LOGI("uart", "gogo3 %u", uart_result[0]);

          if (state == 1) {
            ESP_LOGI("test","Send inferenced result to bluetooth!");
            esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_inferenceTx],
                                        sizeof(result), result, false);
            if(ret) {
              ESP_LOGI("error", "errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
            }
          }
        }
      }
      vTaskDelay(pdMS_TO_TICKS(50));
    }
  }
  else if(what_project == 1) {
    mfcc_init();
    while(state == 0 || state == 1) {
      if(recording_speech != 1) {
        vTaskDelay(pdMS_TO_TICKS(50));
        continue;
      }
      CaptureSamples2();
      
      int32_t data_head = 0; 
      int16_t* audio_data = NULL;  //16000
      float* freq_data = NULL; //[NUM_FRAMES * NUM_BINS]

      audio_data = (int16_t*)malloc(16000 * sizeof(int16_t));
      for (int i = 0; i < 32000; i += 2) {
        //uint16_t 변환
        uint8_t byte1 = audio_8data[i];
        uint8_t byte2 = audio_8data[i + 1];

        // Combine two 8-bit bytes into one 16-bit signed integer
        audio_data[i / 2] = (byte2 << 8) | byte1;
      }
      freq_data = (float*)malloc(NUM_FRAMES * NUM_BINS * sizeof(float));
      for (uint16_t i = 0; i < 49; i++) {
        //stft 변환
        mfcc_compute(audio_data + (i * 320), &freq_data[data_head]);
        data_head += 513;
      }
      float max = freq_data[0]; // 배열의 첫 번째 요소를 초기 최댓값으로 설정
      for (int i = 1; i < 49*513-1; i++) {
        if (freq_data[i] > max) {
          max = freq_data[i]; // 더 큰 값을 찾으면 최댓값을 업데이트
        }
      }
      ESP_LOGI("test","Max value: %f",max);
      ESP_LOGI("test","Input size: %u",model_input->bytes / 4);
      ESP_LOGI("test", "Output size: %d", model_output->bytes / 4);

      for (int i = 0; i < model_input->bytes; ++i) {
        model_input->data.uint8[i] = 0.0f;
      }

      float x_ratio = static_cast<float>(NUM_BINS - 1) / (16 - 1);
      float y_ratio = static_cast<float>(NUM_FRAMES - 1) / (16 - 1);

      for (uint8_t i = 0; i < 16; i++) {
        for (uint8_t j = 0; j < 16; j++) {
          int x_l = static_cast<int>(x_ratio * j);
          int y_l = static_cast<int>(y_ratio * i);
          int x_h = static_cast<int>(ceil(x_ratio * j));
          int y_h = static_cast<int>(ceil(y_ratio * i));

          float x_weight = (x_ratio * j) - x_l;
          float y_weight = (y_ratio * i) - y_l;

          float a = freq_data[y_l * NUM_BINS + x_l];
          float b = freq_data[y_l * NUM_BINS + x_h];
          float c = freq_data[y_h * NUM_BINS + x_l];
          float d = freq_data[y_h * NUM_BINS + x_h];

          float pixel = a * (1 - x_weight) * (1 - y_weight)
                + b * x_weight * (1 - y_weight)
                + c * y_weight * (1 - x_weight)
                + d * x_weight * y_weight;

          model_input->data.f[i*16 + j] = pixel / 10;
          if(i == 0) {
            ESP_LOGI("test", "input Data: %f", pixel);
          }
        }
      }
      // for(int i=0; i<16*16; i++) {
      //   int start = i * NUM_FRAMES * NUM_BINS / (16*16);
      //   int end = (i + 1) * NUM_FRAMES * NUM_BINS / (16*16);

      //   float sum = 0.0;
      //   for (int j = start; j < end; j++) {
      //       sum += freq_data[j];
      //   }

      //   // ESP_LOGI("test", "sum: %f %f", sum, freq_data[i]);
      //   model_input->data.f[i] = sum / (end - start);
      // }
      TfLiteStatus invokeStatus = interpreter->Invoke();
      if (invokeStatus != kTfLiteOk)
      {
        ESP_LOGE("test", "Invoke failed!");
        while (1);
        return;
      }
      uint8_t maxIndex = 0;
      float maxValue = 0;
      for (int i = 0; i < num_label; i++) {
        float _value = model_output->data.f[i];
        if (_value > maxValue)
        {
          maxValue = _value;
          maxIndex = i;
        }
        ESP_LOGI("test","%d:  %f",GESTURES[i], _value);
      }
      ESP_LOGI("test","Winner:  %d",GESTURES[maxIndex]);
      // audio_data에 저장된 값을 spectrogram으로 만들고 resize
      // 모델 검증후 결과를 BLE로 전송
      uint8_t result[1] = {maxIndex};
      
      uint8_t uart_result[2] = {maxIndex, 0xfe};
      uart_write_bytes(ECHO_UART_PORT_NUM, (const char *) uart_result, 2);
      ESP_LOGI("uart", "gogo4 %u", uart_result[0]);

      if(state == 1) {
        esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_inferenceTx],
                                    sizeof(result), result, false);
                                    
        if(ret) {
          ESP_LOGI("error", "errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        }
      }
      recording_speech = 0;
      free(audio_data);
      free(freq_data);
      vTaskDelay(pdMS_TO_TICKS(50));
    }
  }
  else if(what_project == 2) {
  
  }
  vTaskDelete(NULL);
}

// The name of this function is important for Arduino compatibility.
void loop() {

}
