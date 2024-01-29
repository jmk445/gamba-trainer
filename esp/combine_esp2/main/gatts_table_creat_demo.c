/*
 * SPDX-FileCopyrightText: 2021 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Unlicense OR CC0-1.0
 */

/****************************************************************************
*
* This demo showcases creating a GATT database using a predefined attribute table.
* It acts as a GATT server and can send adv data, be connected by client.
* Run the gatt_client demo, the client demo will automatically connect to the gatt_server_service_table demo.
* Client demo will enable GATT server's notify after connection. The two devices will then exchange
* data.
*
****************************************************************************/


#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "freertos/event_groups.h"
#include "esp_system.h"
#include "esp_log.h"
#include "nvs_flash.h"
#include "esp_bt.h"

#include "esp_gap_ble_api.h"
#include "esp_gatts_api.h"
#include "esp_bt_main.h"
#include "gatts_table_creat_demo.h"
#include "esp_gatt_common_api.h"
#include <inttypes.h>
#include <string.h>

#include "esp_event.h"
#include <icm42670.h>
#include <stdio.h>
#include <driver/gpio.h>
#include <driver/uart.h>
#include "driver/ledc.h"
#include "buttonApp.h"

#define GATTS_TABLE_TAG "GATTS_TABLE_DEMO"

#define ICM42670_I2C_ADDR_GND (0x68)
#define ICM42670_I2C_ADDR_VCC (0x69)

#define EXAMPLE_I2C_MASTER_SCL (5) // GPIO number for I2C Master clock line
#define EXAMPLE_I2C_MASTER_SDA (4) // GPIO number for I2C Master data line
//#define EXAMPLE_I2C_MASTER_SCL (8) // GPIO number for I2C Master clock line
//#define EXAMPLE_I2C_MASTER_SDA (10) // GPIO number for I2C Master data line
#define EXAMPLE_INT_INPUT_PIN (0)   // GPIO number for Interrupt Input Pin

#define PORT 0
#define I2C_ADDR ICM42670_I2C_ADDR_GND

#define PROFILE_NUM                 1
#define PROFILE_APP_IDX             0
#define ESP_APP_ID                  0x55
#define SAMPLE_DEVICE_NAME          "GAMBA_ESP"
#define SVC_INST_ID                 0

/* The max length of characteristic value. When the GATT client performs a write or prepare write operation,
*  the data length must be less than GATTS_DEMO_CHAR_VAL_LEN_MAX.
*/
#define GATTS_DEMO_CHAR_VAL_LEN_MAX 500
#define PREPARE_BUF_MAX_SIZE        1024
#define CHAR_DECLARATION_SIZE       (sizeof(uint8_t))

#define ADV_CONFIG_FLAG             (1 << 0)
#define SCAN_RSP_CONFIG_FLAG        (1 << 1)

#define LEDC_TIMER              LEDC_TIMER_0
#define LEDC_MODE               LEDC_LOW_SPEED_MODE
//#define LEDC_OUTPUT_IO          (45) // Define the output GPIO
// #define LEDC_CHANNEL            LEDC_CHANNEL_0
#define LEDC_DUTY_RES           LEDC_TIMER_13_BIT // Set duty resolution to 13 bits
#define LEDC_DUTY               (4095) // Set duty to 50%. ((2 ** 13) - 1) * 50% = 4095
#define LEDC_FREQUENCY          (5000) // Frequency in Hertz. Set frequency at 5 kHz

static void example_ledc_init(uint8_t io, uint8_t channel)
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
        .gpio_num       = io,
        .speed_mode     = LEDC_MODE,
        .channel        = channel,
        .intr_type      = LEDC_INTR_DISABLE,
        .timer_sel      = LEDC_TIMER,
        .duty           = 0, // Set duty to 0%
        .hpoint         = 0
    };
    ESP_ERROR_CHECK(ledc_channel_config(&ledc_channel));
}

static uint8_t adv_config_done       = 0;

uint16_t heart_rate_handle_table[HRS_IDX_NB];

typedef struct {
    uint8_t                 *prepare_buf;
    int                     prepare_len;
} prepare_type_env_t;

static prepare_type_env_t prepare_write_env;

#define CONFIG_SET_RAW_ADV_DATA
#ifdef CONFIG_SET_RAW_ADV_DATA
static uint8_t raw_adv_data[] = {
        /* flags */
        0x02, 0x01, 0x06,
        /* tx power*/
        0x02, 0x0a, 0xeb,
        /* service uuid */
        0x03, 0x03, 0xFF, 0x00,
        /* device name */
        0x0f, 0x09, 'G', 'A', 'M', 'B', 'A', ' ', 'T', 'I', 'N', 'Y', ' ','D', 'E', 'V'
};
static uint8_t raw_scan_rsp_data[] = {
        /* flags */
        0x02, 0x01, 0x06,
        /* tx power */
        0x02, 0x0a, 0xeb,
        /* service uuid */
        0x03, 0x03, 0xFF,0x00
};

#else
static uint8_t service_uuid[16] = {
    /* LSB <--------------------------------------------------------------------------------> MSB */
    //first uuid, 16bit, [12],[13] is the value
    0xfb, 0x34, 0x9b, 0x5f, 0x80, 0x00, 0x00, 0x80, 0x00, 0x10, 0x00, 0x00, 0xFF, 0x00, 0x00, 0x00,
};

/* The length of adv data must be less than 31 bytes */
static esp_ble_adv_data_t adv_data = {
    .set_scan_rsp        = false,
    .include_name        = true,
    .include_txpower     = true,
    .min_interval        = 0x0006, //slave connection min interval, Time = min_interval * 1.25 msec
    .max_interval        = 0x0010, //slave connection max interval, Time = max_interval * 1.25 msec
    .appearance          = 0x00,
    .manufacturer_len    = 0,    //TEST_MANUFACTURER_DATA_LEN,
    .p_manufacturer_data = NULL, //test_manufacturer,
    .service_data_len    = 0,
    .p_service_data      = NULL,
    .service_uuid_len    = sizeof(service_uuid),
    .p_service_uuid      = service_uuid,
    .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
};

// scan response data
static esp_ble_adv_data_t scan_rsp_data = {
    .set_scan_rsp        = true,
    .include_name        = true,
    .include_txpower     = true,
    .min_interval        = 0x0006,
    .max_interval        = 0x0010,
    .appearance          = 0x00,
    .manufacturer_len    = 0, //TEST_MANUFACTURER_DATA_LEN,
    .p_manufacturer_data = NULL, //&test_manufacturer[0],
    .service_data_len    = 0,
    .p_service_data      = NULL,
    .service_uuid_len    = sizeof(service_uuid),
    .p_service_uuid      = service_uuid,
    .flag = (ESP_BLE_ADV_FLAG_GEN_DISC | ESP_BLE_ADV_FLAG_BREDR_NOT_SPT),
};
#endif /* CONFIG_SET_RAW_ADV_DATA */

static esp_ble_adv_params_t adv_params = {
    .adv_int_min         = 0x20,
    .adv_int_max         = 0x40,
    .adv_type            = ADV_TYPE_IND,
    .own_addr_type       = BLE_ADDR_TYPE_PUBLIC,
    .channel_map         = ADV_CHNL_ALL,
    .adv_filter_policy   = ADV_FILTER_ALLOW_SCAN_ANY_CON_ANY,
};

struct gatts_profile_inst {
    esp_gatts_cb_t gatts_cb;        //콜백함수 가르킴
    uint16_t gatts_if;              //GATT Server 인터페이스
    uint16_t app_id;                //GATT Server 어플리케이션 식별자
    uint16_t conn_id;               //연결 id
    uint16_t service_handle;        //서비스 핸들
    esp_gatt_srvc_id_t service_id;  //서비스 id를 나타내는 구조체 타입
    uint16_t char_handle;           //특성 핸들
    esp_bt_uuid_t char_uuid;        //특성 uuid
    esp_gatt_perm_t perm;           //권한을 나타내는 열거형 변수
    esp_gatt_char_prop_t property;  //특성의 속성
    uint16_t descr_handle;          //descriptor 핸들
    esp_bt_uuid_t descr_uuid;       //descriptor uuid
};

static void gatts_profile_event_handler(esp_gatts_cb_event_t event,
					esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param);

/* One gatt-based profile one app_id and one gatts_if, this array will store the gatts_if returned by ESP_GATTS_REG_EVT */
static struct gatts_profile_inst heart_rate_profile_tab[PROFILE_NUM] = {
    [PROFILE_APP_IDX] = {
        .gatts_cb = gatts_profile_event_handler,
        .gatts_if = ESP_GATT_IF_NONE,       /* Not get the gatt_if, so initial is ESP_GATT_IF_NONE */
    },
};

/* Service */
static const uint16_t GATTS_SERVICE_UUID_MAIN               = 0x00FF;
static const uint16_t GATTS_CHAR_UUID_IMU_DATA_TX           = 0xFF01;
static const uint16_t GATTS_CHAR_UUID_IMU_DATA_LABELS_TX    = 0xFF02;
static const uint16_t GATTS_CHAR_UUID_VERSION_TX            = 0xFF03;

static const uint16_t GATTS_CHAR_UUID_INFERENCE_TX          = 0xFF04;
static const uint16_t GATTS_CHAR_UUID_NUM_CLASSES           = 0xFF05;
static const uint16_t GATTS_CHAR_UUID_NUM_SAMPLES           = 0xFF06;
static const uint16_t GATTS_CHAR_UUID_CAPTURE_DELAY         = 0xFF07;
static const uint16_t GATTS_CHAR_UUID_THRESHOLD             = 0xFF08;
static const uint16_t GATTS_CHAR_UUID_DISABLE_MAGNETOMETER  = 0xFF09;
static const uint16_t GATTS_CHAR_UUID_STATE_RX              = 0xFF0A;
static const uint16_t GATTS_CHAR_UUID_STATE_TX              = 0xFF0B;
static const uint16_t GATTS_CHAR_UUID_FILE_TYPE_RX          = 0xFF0C;
static const uint16_t GATTS_CHAR_UUID_HAS_MODEL_TX          = 0xFF0D;
static const uint16_t GATTS_CHAR_UUID_META_RX               = 0xFF0E;
static const uint16_t GATTS_CHAR_UUID_META_TX               = 0xFF0F;

static const uint16_t GATTS_CHAR_UUID_FILE_BLOCK            = 0x00F1;
static const uint16_t GATTS_CHAR_UUID_FILE_LENGTH           = 0x00F2;
static const uint16_t GATTS_CHAR_UUID_FILE_MAXIMUM_LENGTH   = 0x00F3;
static const uint16_t GATTS_CHAR_UUID_FILE_CHECKSUM         = 0x00F4;
static const uint16_t GATTS_CHAR_UUID_COMMAND               = 0x00F5;
static const uint16_t GATTS_CHAR_UUID_TRANSFER_STATUS       = 0x00F6;
static const uint16_t GATTS_CHAR_UUID_ERROR_MESSAGE         = 0x00F7;

static const uint16_t GATTS_CHAR_UUID_VOICE_DATA_TX         = 0xFF10;
static const uint16_t  GATTS_CHAR_UUID_RECORDING_RX         = 0xFF11; 
static const uint16_t GATTS_CHAR_UUID_WHAT_PROJECT_RX       = 0xFF12;
static const uint16_t GATTS_CHAR_UUID_RECORDING_SPEECH_RX   = 0xFF13;
static const uint16_t GATTS_CHAR_UUID_NUM_LABEL_RX          = 0xFF14;

static const uint16_t primary_service_uuid         = ESP_GATT_UUID_PRI_SERVICE;
static const uint16_t character_declaration_uuid   = ESP_GATT_UUID_CHAR_DECLARE;
static const uint16_t character_client_config_uuid = ESP_GATT_UUID_CHAR_CLIENT_CONFIG;
// static const uint8_t char_prop_read                =  ESP_GATT_CHAR_PROP_BIT_READ;
// static const uint8_t char_prop_write               = ESP_GATT_CHAR_PROP_BIT_WRITE;
static const uint8_t char_prop_read_write_notify   = ESP_GATT_CHAR_PROP_BIT_WRITE | ESP_GATT_CHAR_PROP_BIT_READ | ESP_GATT_CHAR_PROP_BIT_NOTIFY;
// 임시 데이터
static const uint8_t char_value[1]                 = {2};
// 버전
static const uint8_t VERSION[1]                    = {5};
// 최대 크기
static const int32_t maximum_value[1]              = {70 * 1024};
// imu data lebels ('acc.x, acc.y, acc.z, gyro.x, gyro.y, gyro.z, mag.x, mag.y, mag.z')
static const uint8_t imu_labels[64]                = {0x61, 0x63, 0x63, 0x2E, 0x78, 0x2C, 0x20, 0x61, 0x63, 0x63, 0x2E, 0x79, 0x2C, 0x20, 0x61, 0x63, 0x63, 0x2E, 0x7A, 0x2C, 0x20, 0x67, 0x79, 0x72, 0x6F, 0x2E, 0x78, 0x2C, 0x20, 0x67, 0x79, 0x72, 0x6F, 0x2E, 0x79, 0x2C, 0x20, 0x67, 0x79, 0x72, 0x6F, 0x2E, 0x7A, 0x2C, 0x20, 0x6D, 0x61, 0x67, 0x2E, 0x78, 0x2C, 0x20, 0x6D, 0x61, 0x67, 0x2E, 0x79, 0x2C, 0x20, 0x6D, 0x61, 0x67, 0x2E, 0x7A};

const int32_t file_block_byte_count = 128;    // 전송 받을 파일 블록의 바이트 사이즈
uint8_t file_buffers[2][70 * 1024];           // 전송받은 파일 저장을 위한 공간
int finished_file_buffer_index = -1;          // 전송이 끝난 파일 버퍼의 인덱스
uint8_t* finished_file_buffer = NULL;         // 가장 최근 전송이 끝난 파일(모델)의 버퍼
int32_t finished_file_buffer_byte_count = 0;  // 전송받은 파일의 길이

uint8_t* in_progress_file_buffer = NULL;      // 전송 진행 중의 파일 버퍼 위치
int32_t in_progress_bytes_received = 0;       // 전송 진행 중 받은 파일의 바이트
int32_t in_progress_bytes_expected = 0;       // 전송 받을 파일의 총 바이트 크기
uint32_t in_progress_checksum = 0;            // 파일의 checksum (웹에서 받은 정보)
uint16_t file_block_length = 0;               // 전송받는 파일 블록의 길이 (웹에서 받은 정보)
uint8_t* file_block_value = NULL;             // 전송받은 파일 블록의 값들
int32_t file_length_value;                    // 전송받는 파일의 총 길이 (웹에서 받은 정보)

const uint8_t fileTransferType = 1;           // 전송 타입을 결정
uint8_t *newModelFileData = NULL;             // 새롭게 업로드된 파일(모델)의 데이터
int newModelFileLength = 0;                   // 새롭게 업로드된 파일(모델)의 길이

int16_t acc_gyro_value[6];                    // 6측 센서의 값을 저장할 공간
float buffer[6];                              // 6측 센서의 값을 [-1,1]로 매핑하여 저장 및 전송을 위해 쓰이는 공간
uint8_t state = 0;                            // 현재 state를 나타내는 변수
uint8_t what_project = 0;                     // 현재 어떤 프로젝트인지 확인하는 변수
uint8_t recording_speech = 0;                  // Speech 예제에서 inference 시작 버튼
uint8_t num_label = 0;                      // 현재 탑재된 모델의 라벨 갯수
/* 0: IDLE_DISCONNECTED, 1: IDLE_CONNECTED, 2: FILE_TRANSFER, 3: INFERENCE
   4: IMU_DATA_PROVIDER, 5: ERROR_STATE, 6: CALIBRATION, 7: INFERENCE_AND_DATA_PROVIDER */

/**********************************************/
/* Full Database Description - Used to add attributes into the database */
static const esp_gatts_attr_db_t gatt_db[HRS_IDX_NB] =
{
    [IDX_SVC]        =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&primary_service_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      sizeof(uint16_t), sizeof(GATTS_SERVICE_UUID_MAIN), (uint8_t *)&GATTS_SERVICE_UUID_MAIN}},

    [IDX_CHAR_imuDataTx]     =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_imuDataTx] =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_IMU_DATA_TX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(buffer), (float *)buffer}},
    
    /* Client Characteristic Configuration Descriptor */
    [IDX_CHAR_CFG_imuDataTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_client_config_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      sizeof(float)*6, sizeof(buffer), (float *)buffer}},

    /* Characteristic Declaration */
    [IDX_CHAR_imudataLabelsTx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_imudataLabelsTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_IMU_DATA_LABELS_TX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(imu_labels), (uint8_t *)imu_labels}},

    /* Characteristic Declaration */
    [IDX_CHAR_versionTx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_versionTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_VERSION_TX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(VERSION), (uint8_t *)VERSION}},
    
    [IDX_CHAR_inferenceTx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_inferenceTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_INFERENCE_TX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    /* Client Characteristic Configuration Descriptor */
    [IDX_CHAR_CFG_inferenceTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_client_config_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      sizeof(uint16_t), sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_numClassesRx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_numClassesRx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_NUM_CLASSES, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_numSamplesRx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_numSamplesRx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_NUM_SAMPLES, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_captureDelayRx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_captureDelayRx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_CAPTURE_DELAY, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_threshholdRx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_threshholdRx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_THRESHOLD, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_disableMagnetometerRx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_disableMagnetometerRx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_DISABLE_MAGNETOMETER, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_stateRx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_stateRx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_STATE_RX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_stateTx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_stateTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_STATE_TX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_CFG_stateTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_client_config_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      sizeof(uint16_t), sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_fileTransferTypeRx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_fileTransferTypeRx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_FILE_TYPE_RX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_hasModelTx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_hasModelTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_HAS_MODEL_TX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_CFG_hasModelTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_client_config_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      sizeof(uint16_t), sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_metaRx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_metaRx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_META_RX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_metaTx]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_metaTx]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_META_TX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},

    [IDX_CHAR_fileBlock]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_fileBlock]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_FILE_BLOCK, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_fileLength]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_fileLength]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_FILE_LENGTH, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_fileMaximumLength]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_fileMaximumLength]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_FILE_MAXIMUM_LENGTH, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(maximum_value), (uint8_t *)maximum_value}},
    
    [IDX_CHAR_fileChecksum]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_fileChecksum]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_FILE_CHECKSUM, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_command]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_command]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_COMMAND, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_transferStatus]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_transferStatus]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_TRANSFER_STATUS, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_CFG_transferStatus]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_client_config_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      sizeof(uint16_t), sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_errorMessage]      =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_errorMessage]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_ERROR_MESSAGE, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_CFG_errorMessage]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_client_config_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      sizeof(uint16_t), sizeof(char_value), (uint8_t *)char_value}},
    
    // audioData(voiceData)를 전송할 characteristic 생성
    [IDX_CHAR_voiceData]     =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_voiceData] =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_VOICE_DATA_TX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_CFG_voiceData]  =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_client_config_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      sizeof(uint8_t)*5, sizeof(char_value), (uint8_t *)char_value}},
    
    // recording을 원하는지 전달 받을 characteristic 생성
    [IDX_CHAR_recording]     =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_recording] =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_RECORDING_RX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},

    [IDX_CHAR_whatProject]     =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_whatProject] =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_WHAT_PROJECT_RX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},

    [IDX_CHAR_recordingSpeech]     =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_recordingSpeech] =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_RECORDING_SPEECH_RX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
    
    [IDX_CHAR_numLabel]     =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&character_declaration_uuid, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      CHAR_DECLARATION_SIZE, CHAR_DECLARATION_SIZE, (uint8_t *)&char_prop_read_write_notify}},

    [IDX_CHAR_VAL_numLabel] =
    {{ESP_GATT_AUTO_RSP}, {ESP_UUID_LEN_16, (uint8_t *)&GATTS_CHAR_UUID_NUM_LABEL_RX, ESP_GATT_PERM_READ | ESP_GATT_PERM_WRITE,
      GATTS_DEMO_CHAR_VAL_LEN_MAX, sizeof(char_value), (uint8_t *)char_value}},
};

void transfer_imu_data(void *args)
{
    // init device descriptor and device
    icm42670_t dev = { 0 };
    ESP_ERROR_CHECK(
        icm42670_init_desc(&dev, I2C_ADDR, PORT, EXAMPLE_I2C_MASTER_SDA, EXAMPLE_I2C_MASTER_SCL));
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

    // read temperature sensor value once
    float temperature;
    ESP_ERROR_CHECK(icm42670_read_temperature(&dev, &temperature));
    ESP_LOGI("imu", "Temperature reading: %f", temperature);

    int16_t raw_reading;
    uint8_t data_register;

    /* select which acceleration or gyro value should be read: */
    // data_register = ICM42670_REG_ACCEL_DATA_X1;
    // data_register = ICM42670_REG_ACCEL_DATA_Y1;
    // data_register = ICM42670_REG_ACCEL_DATA_Z1;
    data_register = ICM42670_REG_GYRO_DATA_X1;
    // data_register = ICM42670_REG_GYRO_DATA_Y1;
    // data_register = ICM42670_REG_GYRO_DATA_Z1;

    // now poll selected accelerometer or gyro raw value directly from registers
    while (state == 4)
    {
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
        esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_imuDataTx],
                                    sizeof(buffer), buffer, false);
        if(ret) {
          ESP_LOGI("imu", "errorrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        }
        ESP_LOGI("imu", "Acc %f, %f, %f | Gyro %f, %f, %f", buffer[0], buffer[1], buffer[2], buffer[3], buffer[4], buffer[5]);

        vTaskDelay(pdMS_TO_TICKS(50));
    }
    vTaskDelete(NULL);
}

//extern void inference();

// state를 변경하고 변경된 state 값에 따라 새로운 task 생성
void setState(uint8_t changeState) {
  /*  
      

      args: changeState(uint8_t): 변경할 state 값
      return:
  */
  state = changeState;
  if(state == 4) {
    //imu data만 보냄
    xTaskCreatePinnedToCore(transfer_imu_data, "transfer_imu_data", 1024 * 3, NULL, 5, NULL, 0);
  }
  if(state == 3) {
    //imu 데이터로 추론하여 추론 결과를 보냄
    xTaskCreatePinnedToCore(inference, "inference", 1024 * 8, NULL, 5, NULL, 0);
  }
}

// model 세팅을 마무리하고 hasModel을 BLE로 알리고 state값을 갱신
void completeModelUpload() {
  ESP_LOGI(GATTS_TABLE_TAG, "void completeModelUpload called!");
  setup();
  setState(3);
  const uint32_t true_state[1] = {1};
  esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_hasModelTx],
                                        sizeof(true_state), true_state, false);
}

bool _writeNVS(uint8_t* data, uint32_t len)
{
    ESP_LOGI("writeNVS", "_writeNVS() called!");
    esp_err_t err;
    nvs_handle_t wHandle;
    
    if (len - sizeof(uint32_t) == 0){
        ESP_LOGI("writeNVS", "Nothing to write");
        return false;
    }
    err = nvs_open("storage", NVS_READWRITE, &wHandle);
    if (err != ESP_OK){
        ESP_LOGI("writeNVS", "failed to open nvs");
        return false;
    }

    err = nvs_set_blob(wHandle, "model", data, len);
    if (err != ESP_OK){
        ESP_LOGI("writeNVS", "Failed to write blob [%d]", err);
        return false;
    }

    err = nvs_set_blob(wHandle, "Numlabel", &num_label, 1);
    if (err != ESP_OK){
        ESP_LOGI("writeNVS", "Failed to write blob [%d]", err);
        return false;
    }

    err = nvs_commit(wHandle);
    if (err != ESP_OK){
        ESP_LOGI("writeNVS", "Failed to commit blob [%d]", err);
        return false;
    }

    nvs_close(wHandle);
    
    return true;
}

// BLE를 통해 전송받은 파일로 새로운 모델 지정
void onBLEFileReceived(uint8_t *file_data, int8_t file_length)
{
  ESP_LOGI(GATTS_TABLE_TAG, "void onBLEFileReceived called!");
  switch (fileTransferType)
  {
    case 1:
      // Queue up the model swap
      newModelFileData = file_data;
      newModelFileLength = file_length;
      ESP_LOGI(GATTS_TABLE_TAG, "fileLength: %d, %ld", file_length, file_length_value);

      if (_writeNVS(newModelFileData, file_length_value)) {
        ESP_LOGI("writeNVS", "Write model to NVS");
      }
      else {
        ESP_LOGI("writeNVS", "Fail to write a model to NVS");
      }
      break;
    default:
      ESP_LOGE(GATTS_TABLE_TAG, "onBLEFileReceived Error");
      setState(7);
      break;
  }
  completeModelUpload();
}

// BLE 파일 전송도중 생긴 에러를 알림
void notifyError(const char* error_message) {
  ESP_LOGE(GATTS_TABLE_TAG, "void notifyError called! error: %s", error_message);

  const int32_t error_status_code[1] = {1};

  esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_transferStatus],
                                      sizeof(error_status_code), error_status_code, false);
  if(ret) {
    ESP_LOGE(GATTS_TABLE_TAG, "State No send!!!!!!!!!");
  }

  uint8_t error_message_buffer[128];
  bool at_string_end = false;
  for (int i = 0; i < 128; ++i) {
    const bool at_last_byte = (i == (128 - 1));
    if (!at_string_end && !at_last_byte) {
      const char current_char = error_message[i];
      if (current_char == 0) {
        at_string_end = true;
      } else {
        error_message_buffer[i] = current_char;
      }
    }

    if (at_string_end || at_last_byte) {
      error_message_buffer[i] = 0;
    }
  }
  ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_errorMessage],
                                      sizeof(error_message_buffer), error_message_buffer, false);
  if(ret) {
    ESP_LOGE(GATTS_TABLE_TAG, "Error Message No send!!!!!!!!!");
  }
}

// BLE 파일 전송이 성공했음을 알림
void notifySuccess() {
  ESP_LOGI(GATTS_TABLE_TAG,"void notifySuccess called!");
  const int32_t success_status_code[1] = {0};
  esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_transferStatus],
                                      sizeof(success_status_code), success_status_code, false);
  if(ret) {
    ESP_LOGE(GATTS_TABLE_TAG, "No send!!!!!!!!!");
  }                                      
}

// BLE 파일이 전송 중임을 알림
void notifyInProgress() {
  ESP_LOGI(GATTS_TABLE_TAG,"void notifyInProgress called!");
  const int32_t in_progress_status_code[1] = {2};
  esp_err_t ret = esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_transferStatus],
                                    sizeof(in_progress_status_code), in_progress_status_code, false);
  if(ret) {
    ESP_LOGE(GATTS_TABLE_TAG, "No send!!!!!!!!!");
  }                                  
}

// 파일 전송(정확히는 받는 것)을 시작
void startFileTransfer() {
  ESP_LOGI(GATTS_TABLE_TAG,"void startFileTransfer called!");
  if (in_progress_file_buffer != NULL) {
    notifyError("File transfer command received while previous transfer is still in progress");
    return;
  }
  ESP_LOGI(GATTS_TABLE_TAG,"void startFileTransfer Step 1");
  const int32_t in_progress_status_code[1] = {2};
  esp_ble_gatts_send_indicate(3, 0, heart_rate_handle_table[IDX_CHAR_VAL_transferStatus],
                                    sizeof(in_progress_status_code), in_progress_status_code, false);

  if (file_length_value > 70 * 1024) {
    notifyError("File too large: Maximum is ");
    return;
  }
  ESP_LOGI(GATTS_TABLE_TAG,"void startFileTransfer Step 2");

  int in_progress_file_buffer_index;
  if (finished_file_buffer_index == 0) {
    in_progress_file_buffer_index = 1;
  } else {
    in_progress_file_buffer_index = 0;
  }
  
  in_progress_file_buffer = &file_buffers[in_progress_file_buffer_index][0];
  ESP_LOGI(GATTS_TABLE_TAG,"void startFileTransfer Step 3 : (%p) ", in_progress_file_buffer);
  in_progress_bytes_received = 0;
  ESP_LOGI(GATTS_TABLE_TAG,"void startFileTransfer Step 4");
  in_progress_bytes_expected = file_length_value;
  ESP_LOGI(GATTS_TABLE_TAG,"void startFileTransfer Step 5");

  notifyInProgress();
}

// 파일 전송 받는 것을 멈춤, 취소
void cancelFileTransfer() {
  ESP_LOGI(GATTS_TABLE_TAG,"void cancelFileTransfer called!");
  if (in_progress_file_buffer != NULL) {
    notifyError("File transfer cancelled");
    in_progress_file_buffer = NULL;
  }
}

// 바이트단위로 crc
int32_t crc32_for_byte(uint32_t r) {
  ESP_LOGI(GATTS_TABLE_TAG, "int32_t crc32_for_byte called!");
  for (int j = 0; j < 8; ++j) {
    r = (r & 1? 0: (uint32_t)0xedb88320L) ^ r >> 1;
  }
  return r ^ (uint32_t)0xff000000L;
}

//crc
uint32_t crc32(const uint8_t* data, size_t data_length) {
  ESP_LOGI(GATTS_TABLE_TAG, "uint32_t crc32 called!");
  static uint32_t table[256];
  static bool is_table_initialized = false;
  if (!is_table_initialized) {
    for(size_t i = 0; i < 256; ++i) {
      table[i] = crc32_for_byte(i);
    }
    is_table_initialized = true;
  }
  uint32_t crc = 0;
  for (size_t i = 0; i < data_length; ++i) {
    const uint8_t crc_low_byte = (uint8_t)crc;
    const uint8_t data_byte = data[i];
    const uint8_t table_index = crc_low_byte ^ data_byte;
    crc = table[table_index] ^ (crc >> 8);
  }
  return crc;
}

// 전송받은 파일의 checksum을 계산하여 오류제어
void onFileTransferComplete() {
  ESP_LOGI(GATTS_TABLE_TAG, "void onFileTransferComplete() called!");
  uint32_t computed_checksum = crc32(in_progress_file_buffer, in_progress_bytes_expected);
  ESP_LOGI(GATTS_TABLE_TAG, "in_progress_checksum: (%" PRIu32 "),     computed_checksum: (%" PRIu32 ")", in_progress_checksum, computed_checksum);
  for(int i=0;i<30;i++) {
    ESP_LOGI(GATTS_TABLE_TAG, "Buffer: %02x", file_buffers[0][i]);
  }
  if (in_progress_checksum != computed_checksum) {
    notifyError("File transfer failed: Expected checksum 0x");
    in_progress_file_buffer = NULL;
    return;
  }

  if (finished_file_buffer_index == 0) {
    finished_file_buffer_index = 1;
  } else {
    finished_file_buffer_index = 0;
  }
  finished_file_buffer = &file_buffers[finished_file_buffer_index][0];
  finished_file_buffer_byte_count = in_progress_bytes_expected;

  in_progress_file_buffer = NULL;
  in_progress_bytes_received = 0;
  in_progress_bytes_expected = 0;

  notifySuccess();

  onBLEFileReceived(finished_file_buffer, finished_file_buffer_byte_count);
}

// 전송받은 블럭단위의 파일을 in_progress_file_buffer에 합치며 저장
void onFileBlockWritten() {
  ESP_LOGI(GATTS_TABLE_TAG,"onFileBlockWritten Handler called!");

  if (in_progress_file_buffer == NULL) {
    ESP_LOGE(GATTS_TABLE_TAG,"File block sent while no valid command is active");
    notifyError("File block sent while no valid command is active");
    return;
  }
  
  if (file_block_length > file_block_byte_count) {
    ESP_LOGE(GATTS_TABLE_TAG,"Too many bytes in block: Expected (%" PRId32 "),  but received (%" PRIu16 ")", file_block_byte_count, file_block_length);
    notifyError("Too many bytes in block: Expected ");
    in_progress_file_buffer = NULL;
    return;
  }
  
  const int32_t bytes_received_after_block = in_progress_bytes_received + file_block_length;
  if ((bytes_received_after_block > in_progress_bytes_expected) ||
    (bytes_received_after_block > 70 * 1024)) {
    ESP_LOGE(GATTS_TABLE_TAG,"Too many bytes: Expected (%" PRId32 "),  but received (%" PRId32 ")", in_progress_bytes_expected, bytes_received_after_block);
    notifyError("Too many bytes: Expected ");
    in_progress_file_buffer = NULL;
    return;
  }

  //uint8_t* file_block_buffer = in_progress_file_buffer + in_progress_bytes_received;
  ESP_LOGI("TEst","dd(%p), %d", in_progress_file_buffer, file_block_length);
  
  memcpy(&(in_progress_file_buffer[in_progress_bytes_received]), file_block_value, file_block_length);
  

  if (bytes_received_after_block == in_progress_bytes_expected) {
    onFileTransferComplete();
  } else {
    ESP_LOGI(GATTS_TABLE_TAG,"bytes_received_after_block Value: (%" PRId32 ")", bytes_received_after_block);
    in_progress_bytes_received = bytes_received_after_block;
  }
}

// 전송받은 command 값을 통해 파일 전송을 시작하거나 멈추는 것을 결정
void onCommandWritten(uint8_t command_value) {
  ESP_LOGI(GATTS_TABLE_TAG,"void onCommandWritten Handler called!, Command Value: %d",command_value);
  if ((command_value != 1) && (command_value != 2)) {
    ESP_LOGE(GATTS_TABLE_TAG,"Bad command value: Expected 1 or 2 but received %d",command_value);
    notifyError("Bad command value: Expected 1 or 2 but received ");
    return;
  }
  if (command_value == 1) {
    startFileTransfer();
  } else if (command_value == 2) {
    cancelFileTransfer();
  }
}

static void gap_event_handler(esp_gap_ble_cb_event_t event, esp_ble_gap_cb_param_t *param)
{
    switch (event) {
    #ifdef CONFIG_SET_RAW_ADV_DATA
        case ESP_GAP_BLE_ADV_DATA_RAW_SET_COMPLETE_EVT:
            adv_config_done &= (~ADV_CONFIG_FLAG);
            if (adv_config_done == 0){
                esp_ble_gap_start_advertising(&adv_params);
            }
            break;
        case ESP_GAP_BLE_SCAN_RSP_DATA_RAW_SET_COMPLETE_EVT:
            adv_config_done &= (~SCAN_RSP_CONFIG_FLAG);
            if (adv_config_done == 0){
                esp_ble_gap_start_advertising(&adv_params);
            }
            break;
    #else
        case ESP_GAP_BLE_ADV_DATA_SET_COMPLETE_EVT:
            adv_config_done &= (~ADV_CONFIG_FLAG);
            if (adv_config_done == 0){
                esp_ble_gap_start_advertising(&adv_params);
            }
            break;
        case ESP_GAP_BLE_SCAN_RSP_DATA_SET_COMPLETE_EVT:
            adv_config_done &= (~SCAN_RSP_CONFIG_FLAG);
            if (adv_config_done == 0){
                esp_ble_gap_start_advertising(&adv_params);
            }
            break;
    #endif
        case ESP_GAP_BLE_ADV_START_COMPLETE_EVT:
            /* advertising start complete event to indicate advertising start successfully or failed */
            if (param->adv_start_cmpl.status != ESP_BT_STATUS_SUCCESS) {
                ESP_LOGE(GATTS_TABLE_TAG, "advertising start failed");
            }else{
                ESP_LOGI(GATTS_TABLE_TAG, "advertising start successfully");
            }
            break;
        case ESP_GAP_BLE_ADV_STOP_COMPLETE_EVT:
            if (param->adv_stop_cmpl.status != ESP_BT_STATUS_SUCCESS) {
                ESP_LOGE(GATTS_TABLE_TAG, "Advertising stop failed");
            }
            else {
                ESP_LOGI(GATTS_TABLE_TAG, "Stop adv successfully\n");
            }
            break;
        case ESP_GAP_BLE_UPDATE_CONN_PARAMS_EVT:
            ESP_LOGI(GATTS_TABLE_TAG, "update connection params status = %d, min_int = %d, max_int = %d,conn_int = %d,latency = %d, timeout = %d",
                  param->update_conn_params.status,
                  param->update_conn_params.min_int,
                  param->update_conn_params.max_int,
                  param->update_conn_params.conn_int,
                  param->update_conn_params.latency,
                  param->update_conn_params.timeout);
            break;
        default:
            break;
    }
}

static void gatts_profile_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param)
{
    switch (event) {
        case ESP_GATTS_REG_EVT:{
            esp_err_t set_dev_name_ret = esp_ble_gap_set_device_name(SAMPLE_DEVICE_NAME);
            if (set_dev_name_ret){
                ESP_LOGE(GATTS_TABLE_TAG, "set device name failed, error code = %x", set_dev_name_ret);
            }
    #ifdef CONFIG_SET_RAW_ADV_DATA
            esp_err_t raw_adv_ret = esp_ble_gap_config_adv_data_raw(raw_adv_data, sizeof(raw_adv_data));
            if (raw_adv_ret){
                ESP_LOGE(GATTS_TABLE_TAG, "config raw adv data failed, error code = %x ", raw_adv_ret);
            }
            adv_config_done |= ADV_CONFIG_FLAG;
            esp_err_t raw_scan_ret = esp_ble_gap_config_scan_rsp_data_raw(raw_scan_rsp_data, sizeof(raw_scan_rsp_data));
            if (raw_scan_ret){
                ESP_LOGE(GATTS_TABLE_TAG, "config raw scan rsp data failed, error code = %x", raw_scan_ret);
            }
            adv_config_done |= SCAN_RSP_CONFIG_FLAG;
    #else
            //config adv data
            esp_err_t ret = esp_ble_gap_config_adv_data(&adv_data);
            if (ret){
                ESP_LOGE(GATTS_TABLE_TAG, "config adv data failed, error code = %x", ret);
            }
            adv_config_done |= ADV_CONFIG_FLAG;
            //config scan response data
            ret = esp_ble_gap_config_adv_data(&scan_rsp_data);
            if (ret){
                ESP_LOGE(GATTS_TABLE_TAG, "config scan response data failed, error code = %x", ret);
            }
            adv_config_done |= SCAN_RSP_CONFIG_FLAG;
    #endif
            esp_err_t create_attr_ret = esp_ble_gatts_create_attr_tab(gatt_db, gatts_if, HRS_IDX_NB, SVC_INST_ID);
            if (create_attr_ret){
                ESP_LOGE(GATTS_TABLE_TAG, "create attr table failed, error code = %x", create_attr_ret);
            }
        }
       	    break;
        case ESP_GATTS_READ_EVT:
       	    break;
        case ESP_GATTS_WRITE_EVT:
            if (!param->write.is_prep){
                if (heart_rate_handle_table[IDX_CHAR_VAL_stateRx] == param->write.handle) {
                  ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_WRITE_EVT,STATE handle = %d, value:", param->write.handle);
                  esp_log_buffer_hex(GATTS_TABLE_TAG, param->write.value, param->write.len);
                  setState(*param->write.value);
                }
                if (heart_rate_handle_table[IDX_CHAR_VAL_fileBlock] == param->write.handle) {
                  /* fileBlock Handler, 
                     file block을 전송받고 이를 통해 file_block_length, file_block_value값을 최신화 한뒤
                     onFileBlockWritten 함수를 통해 파일 합치기
                  */
                  ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_WRITE_EVT,STATE handle = %d, fileBlock", param->write.handle);
                  file_block_length = param->write.len;
                  ESP_LOGI(GATTS_TABLE_TAG, "fileBlock Length: (%" PRIu16 ") ", param->write.len);
                  file_block_value = param->write.value;
                  onFileBlockWritten();
                }
                if (heart_rate_handle_table[IDX_CHAR_VAL_command] == param->write.handle) {
                  // command Handler, 전달받은 command를 인자로값으로 하여 onCommandWritten 함수 호출
                  ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_WRITE_EVT,STATE handle = %d, Command", param->write.handle);
                  onCommandWritten(*param->write.value);
                }
                if (heart_rate_handle_table[IDX_CHAR_VAL_fileLength] == param->write.handle) {
                  // fileLength Handler, 전달 받은 값(파일의 총 길이)을 형변환을 통해 file_length_value에 저장
                  ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_WRITE_EVT,STATE handle = %d, fileLength, value:", param->write.handle);
                  esp_log_buffer_hex(GATTS_TABLE_TAG, param->write.value, param->write.len);
                  uint32_t temp = 0;
                  temp |= param->write.value[0];
                  temp |= (uint32_t)param->write.value[1] << 8;
                  temp |= (uint32_t)param->write.value[2] << 16;
                  temp |= (uint32_t)param->write.value[3] << 24;
                  file_length_value = (int32_t)temp;
                  ESP_LOGI(GATTS_TABLE_TAG, "file Length: (%" PRId32 ") ", file_length_value);
                }
                if (heart_rate_handle_table[IDX_CHAR_VAL_fileChecksum] == param->write.handle) {
                  // fileChecksum Handler, 전달받은 값(file checksum)을 형변환을 통해 in_progress_checksum에 저장
                  ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_WRITE_EVT,STATE handle = %d, fileChecksum, value:", param->write.handle);
                  esp_log_buffer_hex(GATTS_TABLE_TAG, param->write.value, param->write.len);
                  in_progress_checksum |= param->write.value[0];
                  in_progress_checksum |= (uint32_t)param->write.value[1] << 8;
                  in_progress_checksum |= (uint32_t)param->write.value[2] << 16;
                  in_progress_checksum |= (uint32_t)param->write.value[3] << 24;
                  ESP_LOGI(GATTS_TABLE_TAG, "Checksum: (%" PRIu32 ") ", in_progress_checksum);
                }
                if (heart_rate_handle_table[IDX_CHAR_CFG_imuDataTx] == param->write.handle) {
                  esp_ble_gatts_send_indicate(gatts_if, param->write.conn_id, param->write.handle,
                                            sizeof(buffer), buffer, false);
                }
                if (heart_rate_handle_table[IDX_CHAR_CFG_transferStatus] == param->write.handle) {
                  // transferStatus notify init
                  const int32_t in_progress_status_code[1] = {2};
                  esp_ble_gatts_send_indicate(gatts_if, param->write.conn_id, param->write.handle,
                                              sizeof(in_progress_status_code), in_progress_status_code, false);
                }
                if (heart_rate_handle_table[IDX_CHAR_VAL_whatProject] == param->write.handle) {
                  what_project = *param->write.value;
                }
                if (heart_rate_handle_table[IDX_CHAR_VAL_recordingSpeech] == param->write.handle) {
                  recording_speech = *param->write.value;
                }
                if (heart_rate_handle_table[IDX_CHAR_VAL_numLabel] == param->write.handle) {
                  num_label = *param->write.value;
                }
                if ((heart_rate_handle_table[IDX_CHAR_CFG_errorMessage] == param->write.handle || 
                heart_rate_handle_table[IDX_CHAR_CFG_stateTx] == param->write.handle ||
                heart_rate_handle_table[IDX_CHAR_CFG_hasModelTx] == param->write.handle || 
                heart_rate_handle_table[IDX_CHAR_CFG_inferenceTx] == param->write.handle)){
                    esp_ble_gatts_send_indicate(gatts_if, param->write.conn_id, param->write.handle,
                                            sizeof(char_value), char_value, false);
                }
                if (heart_rate_handle_table[IDX_CHAR_CFG_voiceData] == param->write.handle) {
                    // audioData에 대한 notifications를 처리해주는 부분
                    esp_ble_gatts_send_indicate(gatts_if, param->write.conn_id, param->write.handle,
                                              sizeof(char_value), char_value, false);
                }
                if (heart_rate_handle_table[IDX_CHAR_VAL_recording] == param->write.handle) {
                    if(*param->write.value == 1) {
                        // recording을 원하면(recording 값이 1일때) 1초짜리 audioData를 캡쳐하여 전송하는 task 실행
                        ESP_LOGI(GATTS_TABLE_TAG, "testsetse1");
                        xTaskCreatePinnedToCore(CaptureSamples, "CaptureSamples", 1024 * 8, NULL, 5, NULL, 0);
                        ESP_LOGI(GATTS_TABLE_TAG, "testsetse2");
                    }
                }
                if (param->write.need_rsp){
                    esp_ble_gatts_send_response(gatts_if, param->write.conn_id, param->write.trans_id, ESP_GATT_OK, NULL);
                }
            }
      	    break;
        case ESP_GATTS_EXEC_WRITE_EVT:
            // the length of gattc prepare write data must be less than GATTS_DEMO_CHAR_VAL_LEN_MAX.
            ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_EXEC_WRITE_EVT");
            break;
        case ESP_GATTS_MTU_EVT:
            ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_MTU_EVT, MTU %d", param->mtu.mtu);
            break;
        case ESP_GATTS_CONF_EVT:
            // ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_CONF_EVT, status = %d, attr_handle %d, length %d, id %d", param->conf.status, param->conf.handle, param->conf.len, param->conf.conn_id);
            break;
        case ESP_GATTS_START_EVT:
            ESP_LOGI(GATTS_TABLE_TAG, "SERVICE_START_EVT, status %d, service_handle %d", param->start.status, param->start.service_handle);
            i2s_init();     // audio sensor 연결 초기화(세팅)
            break;
        case ESP_GATTS_CONNECT_EVT:
            ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_CONNECT_EVT, conn_id = %d", param->connect.conn_id);
            esp_log_buffer_hex(GATTS_TABLE_TAG, param->connect.remote_bda, 6);
            esp_ble_conn_update_params_t conn_params = {0};
            memcpy(conn_params.bda, param->connect.remote_bda, sizeof(esp_bd_addr_t));
            /* For the iOS system, please refer to Apple official documents about the BLE connection parameters restrictions. */
            conn_params.latency = 0;
            conn_params.max_int = 0x20;    // max_int = 0x20*1.25ms = 40ms
            conn_params.min_int = 0x10;    // min_int = 0x10*1.25ms = 20ms
            conn_params.timeout = 400;    // timeout = 400*10ms = 4000ms
            //start sent the update connection parameters to the peer device.
            esp_ble_gap_update_conn_params(&conn_params);
            setState(1);      // 연결상태 Update (Connect: 1)
            break;
        case ESP_GATTS_DISCONNECT_EVT:
            ESP_LOGI(GATTS_TABLE_TAG, "ESP_GATTS_DISCONNECT_EVT, reason = 0x%x", param->disconnect.reason);
            esp_ble_gap_start_advertising(&adv_params);
            setState(0);      // 연결상태 Update (Disconnect: 0)
            break;
        case ESP_GATTS_CREAT_ATTR_TAB_EVT:{
            if (param->add_attr_tab.status != ESP_GATT_OK){
                ESP_LOGE(GATTS_TABLE_TAG, "create attribute table failed, error code=0x%x", param->add_attr_tab.status);
            }
            else if (param->add_attr_tab.num_handle != HRS_IDX_NB){
                ESP_LOGE(GATTS_TABLE_TAG, "create attribute table abnormally, num_handle (%d) \
                        doesn't equal to HRS_IDX_NB(%d)", param->add_attr_tab.num_handle, HRS_IDX_NB);
            }
            else {
                ESP_LOGI(GATTS_TABLE_TAG, "create attribute table successfully, the number handle = %d\n",param->add_attr_tab.num_handle);
                memcpy(heart_rate_handle_table, param->add_attr_tab.handles, sizeof(heart_rate_handle_table));
                esp_ble_gatts_start_service(heart_rate_handle_table[IDX_SVC]);
            }
            break;
        }
        case ESP_GATTS_STOP_EVT:
        case ESP_GATTS_OPEN_EVT:
        case ESP_GATTS_CANCEL_OPEN_EVT:
        case ESP_GATTS_CLOSE_EVT:
        case ESP_GATTS_LISTEN_EVT:
        case ESP_GATTS_CONGEST_EVT:
        case ESP_GATTS_UNREG_EVT:
        case ESP_GATTS_DELETE_EVT:
        default:
            break;
    }
    // ESP_LOGI(GATTS_TABLE_TAG, "Event %d", event);
}


static void gatts_event_handler(esp_gatts_cb_event_t event, esp_gatt_if_t gatts_if, esp_ble_gatts_cb_param_t *param)
{

    /* If event is register event, store the gatts_if for each profile */
    if (event == ESP_GATTS_REG_EVT) {
        if (param->reg.status == ESP_GATT_OK) {
            heart_rate_profile_tab[PROFILE_APP_IDX].gatts_if = gatts_if;
        } else {
            ESP_LOGE(GATTS_TABLE_TAG, "reg app failed, app_id %04x, status %d",
                    param->reg.app_id,
                    param->reg.status);
            return;
        }
    }
    do {
        int idx;
        for (idx = 0; idx < PROFILE_NUM; idx++) {
            /* ESP_GATT_IF_NONE, not specify a certain gatt_if, need to call every profile cb function */
            if (gatts_if == ESP_GATT_IF_NONE || gatts_if == heart_rate_profile_tab[idx].gatts_if) {
                if (heart_rate_profile_tab[idx].gatts_cb) {
                    heart_rate_profile_tab[idx].gatts_cb(event, gatts_if, param);
                }
            }
        }
    } while (0);
}

bool _readNVS(void){
    esp_err_t err;
    size_t required_size = 0;
    nvs_handle_t rHandle;

    err = nvs_open("storage", NVS_READWRITE, &rHandle);
    if (err != ESP_OK){
        ESP_LOGI("load model NVS", "NVS Open Failed");
        //_writeUSB("NVS Fail", 9);
        return false;
    }

    // Read size of blob (binary large object)
    err = nvs_get_blob(rHandle, "model", NULL, &required_size);
    if (err != ESP_OK){
        ESP_LOGI("load model NVS", "NVS BLOB error or not found");
        //_writeUSB("NVS Fail", 9);
        return false;
    }
    ESP_LOGI("load model NVS", "Read %u bytes from NVS", required_size);

    // size check
    if (required_size == 0){
        ESP_LOGI("load model NVS", "No model");
        //_writeUSB("No model", 9);
        return false;
    }
    err = nvs_get_blob(rHandle, "model", newModelFileData, &required_size);
    ESP_LOGI("load model NVS", "Model get complete!");

    required_size = 1;
    err = nvs_get_blob(rHandle, "Numlabel", &num_label, &required_size);
    ESP_LOGI("load model NVS", "Numlabel get complete!");
    //length check
    // memcpy(&(file_length_value), newModelFileData, sizeof(uint32_t));
    // ESP_LOGI("load model NVS", "read %u bytes & size %ld", required_size, file_length_value);
    // _bufTest("NVS", ctrlApp_var.memBuf);
    if(*newModelFileData == NULL) {
      ESP_LOGI("test", "NULL");
    }
    else {
      ESP_LOGI("test", "NOT NULL");
    }
    nvs_close(rHandle);

    return true;
}

void blink_red() {
  example_ledc_init(46,1);
  example_ledc_init(45,0);
  for(int i=0;i<5;i++) {
    ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, 0, LEDC_DUTY));
    ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, 0));
    vTaskDelay(pdMS_TO_TICKS(500));
    ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, 0, 0));
    ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, 0));
    vTaskDelay(pdMS_TO_TICKS(500));
  }
}

void blink_blue() {
  example_ledc_init(45,0);
  example_ledc_init(46,1);
  ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, 1, LEDC_DUTY));
  ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, 1));
  for(int i=0;i<5;i++) {
    ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, 1, LEDC_DUTY));
    ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, 1));
    vTaskDelay(pdMS_TO_TICKS(500));
    ESP_ERROR_CHECK(ledc_set_duty(LEDC_MODE, 1, 0));
    ESP_ERROR_CHECK(ledc_update_duty(LEDC_MODE, 1));
    vTaskDelay(pdMS_TO_TICKS(500));
  }
}

// A button press에 대한 핸들러 함수
static void handler_A()
{
    ESP_LOGI("HDR", "A Pressed");
    blink_red();
    state = 0;
    what_project = 0;
    // flash에서 모델 불러오기
    newModelFileData = &file_buffers[0][0];
    if (_readNVS()){
        ESP_LOGI("HDR", "Read model from NVS");
    }
    else {
      ESP_LOGI("HDR", "Fail to read a model from NVS");
    }
    setup();
    xTaskCreatePinnedToCore(challenge, "challenge", 1024 * 8, NULL, 5, NULL, 0);
}

// B button press에 대한 핸들러 함수
static void handler_B()
{
    ESP_LOGI("HDR", "B Pressed");
    blink_blue();
    state = 0;
    what_project = 1;
    // flash에서 모델 불러오기
    newModelFileData = &file_buffers[0][0];
    if (_readNVS()){
        ESP_LOGI("HDR", "Read model from NVS");
    }
    else {
      ESP_LOGI("HDR", "Fail to read a model from NVS");
    }
    setup();
    xTaskCreatePinnedToCore(challenge, "challenge", 1024 * 8, NULL, 5, NULL, 0);
}

static void handler_X()
{
  ESP_LOGI("HDR", "X Pressed");
  recording_speech = 1;
}

void app_main(void)
{
    esp_err_t ret;

    /* Initialize NVS. */
    ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK( ret );

    //UART Init//
    uart_config_t uart_config = {
        .baud_rate = ECHO_UART_BAUD_RATE,
        .data_bits = UART_DATA_8_BITS,
        .parity    = UART_PARITY_DISABLE,
        .stop_bits = UART_STOP_BITS_1,
        .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
        .source_clk = UART_SCLK_DEFAULT,
    };
    int intr_alloc_flags = 0;
    ESP_ERROR_CHECK(uart_driver_install(ECHO_UART_PORT_NUM, 128 * 2, 0, 0, NULL, intr_alloc_flags));
    ESP_ERROR_CHECK(uart_param_config(ECHO_UART_PORT_NUM, &uart_config));
    ESP_ERROR_CHECK(uart_set_pin(ECHO_UART_PORT_NUM, ECHO_TEST_TXD, ECHO_TEST_RXD, ECHO_TEST_RTS, ECHO_TEST_CTS));

    //Bluetooth Init
    ESP_ERROR_CHECK(esp_bt_controller_mem_release(ESP_BT_MODE_CLASSIC_BT));

    esp_bt_controller_config_t bt_cfg = BT_CONTROLLER_INIT_CONFIG_DEFAULT();
    ret = esp_bt_controller_init(&bt_cfg);
    if (ret) {
        ESP_LOGE(GATTS_TABLE_TAG, "%s enable controller failed: %s", __func__, esp_err_to_name(ret));
        return;
    }

    ret = esp_bt_controller_enable(ESP_BT_MODE_BLE);
    if (ret) {
        ESP_LOGE(GATTS_TABLE_TAG, "%s enable controller failed: %s", __func__, esp_err_to_name(ret));
        return;
    }

    ret = esp_bluedroid_init();
    if (ret) {
        ESP_LOGE(GATTS_TABLE_TAG, "%s init bluetooth failed: %s", __func__, esp_err_to_name(ret));
        return;
    }

    ret = esp_bluedroid_enable();
    if (ret) {
        ESP_LOGE(GATTS_TABLE_TAG, "%s enable bluetooth failed: %s", __func__, esp_err_to_name(ret));
        return;
    }

    ret = esp_ble_gatts_register_callback(gatts_event_handler);
    if (ret){
        ESP_LOGE(GATTS_TABLE_TAG, "gatts register error, error code = %x", ret);
        return;
    }

    ret = esp_ble_gap_register_callback(gap_event_handler);
    if (ret){
        ESP_LOGE(GATTS_TABLE_TAG, "gap register error, error code = %x", ret);
        return;
    }

    ret = esp_ble_gatts_app_register(ESP_APP_ID);
    if (ret){
        ESP_LOGE(GATTS_TABLE_TAG, "gatts app register error, error code = %x", ret);
        return;
    }

    esp_err_t local_mtu_ret = esp_ble_gatt_set_local_mtu(500);
    if (local_mtu_ret){
        ESP_LOGE(GATTS_TABLE_TAG, "set local  MTU failed, error code = %x", local_mtu_ret);
    }
    
    ESP_ERROR_CHECK(i2cdev_init());

    esp_event_loop_create_default();
    initButtonApp(); //버튼 사용을 위한 초기화(연결)

    // buttonA long press 감지시 handler_A 이벤트 등록
    esp_event_handler_register(BUTTON_EVENTS, BUTTON_EVENT_A_LONG_PRESS, handler_A, 0);
    // buttonB long press 감지시 handler_B 이벤트 등록
    esp_event_handler_register(BUTTON_EVENTS, BUTTON_EVENT_B_LONG_PRESS, handler_B, 0);
    // buttonX long press 감지시 handler_X 이벤트 등록
    esp_event_handler_register(BUTTON_EVENTS, BUTTON_EVENT_X_PRESSED, handler_X, 0);
}
