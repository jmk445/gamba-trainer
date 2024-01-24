/*
 * SPDX-FileCopyrightText: 2021 Espressif Systems (Shanghai) CO LTD
 *
 * SPDX-License-Identifier: Unlicense OR CC0-1.0
 */


#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef __cplusplus
extern "C" {
#endif
void CaptureSamples();
#ifdef __cplusplus
}
#endif

#ifdef __cplusplus
extern "C" {
#endif
void CaptureSamples2();
#ifdef __cplusplus
}
#endif

#ifdef __cplusplus
extern "C" {
#endif
void i2s_init(void);
#ifdef __cplusplus
}
#endif

#ifdef __cplusplus
extern "C" {
#endif
void setup();
#ifdef __cplusplus
}
#endif

#ifdef __cplusplus
extern "C" {
#endif
void inference();
#ifdef __cplusplus
}
#endif

#ifdef __cplusplus
extern "C" {
#endif
void challenge();
#ifdef __cplusplus
}
#endif

/* Attributes State Machine */
enum
{
    IDX_SVC,

    IDX_CHAR_imuDataTx,
    IDX_CHAR_VAL_imuDataTx,
    IDX_CHAR_CFG_imuDataTx,

    IDX_CHAR_imudataLabelsTx,
    IDX_CHAR_VAL_imudataLabelsTx,

    IDX_CHAR_versionTx,
    IDX_CHAR_VAL_versionTx,

    IDX_CHAR_inferenceTx,
    IDX_CHAR_VAL_inferenceTx,
    IDX_CHAR_CFG_inferenceTx,

    IDX_CHAR_numClassesRx,
    IDX_CHAR_VAL_numClassesRx,

    IDX_CHAR_numSamplesRx,
    IDX_CHAR_VAL_numSamplesRx,

    IDX_CHAR_captureDelayRx,
    IDX_CHAR_VAL_captureDelayRx,

    IDX_CHAR_threshholdRx,
    IDX_CHAR_VAL_threshholdRx,

    IDX_CHAR_disableMagnetometerRx,
    IDX_CHAR_VAL_disableMagnetometerRx,

    IDX_CHAR_stateRx,
    IDX_CHAR_VAL_stateRx,

    IDX_CHAR_stateTx,
    IDX_CHAR_VAL_stateTx,
    IDX_CHAR_CFG_stateTx,

    IDX_CHAR_fileTransferTypeRx,
    IDX_CHAR_VAL_fileTransferTypeRx,

    IDX_CHAR_hasModelTx,
    IDX_CHAR_VAL_hasModelTx,
    IDX_CHAR_CFG_hasModelTx,

    IDX_CHAR_metaRx,
    IDX_CHAR_VAL_metaRx,

    IDX_CHAR_metaTx,
    IDX_CHAR_VAL_metaTx,

    IDX_CHAR_fileBlock,
    IDX_CHAR_VAL_fileBlock,

    IDX_CHAR_fileLength,
    IDX_CHAR_VAL_fileLength,

    IDX_CHAR_fileMaximumLength,
    IDX_CHAR_VAL_fileMaximumLength,

    IDX_CHAR_fileChecksum,
    IDX_CHAR_VAL_fileChecksum,

    IDX_CHAR_command,
    IDX_CHAR_VAL_command,

    IDX_CHAR_transferStatus,
    IDX_CHAR_VAL_transferStatus,
    IDX_CHAR_CFG_transferStatus,

    IDX_CHAR_errorMessage,
    IDX_CHAR_VAL_errorMessage,
    IDX_CHAR_CFG_errorMessage,
    
    IDX_CHAR_voiceData,
    IDX_CHAR_VAL_voiceData,
    IDX_CHAR_CFG_voiceData,

    IDX_CHAR_recording,
    IDX_CHAR_VAL_recording,

    IDX_CHAR_whatProject,
    IDX_CHAR_VAL_whatProject,

    IDX_CHAR_recordingSpeech,
    IDX_CHAR_VAL_recordingSpeech,

    IDX_CHAR_numLabel,
    IDX_CHAR_VAL_numLabel,

    HRS_IDX_NB,
};

// UART Config
#define ECHO_TEST_TXD (38)
#define ECHO_TEST_RXD (39)
#define ECHO_TEST_RTS (UART_PIN_NO_CHANGE)
#define ECHO_TEST_CTS (UART_PIN_NO_CHANGE)

#define ECHO_UART_PORT_NUM      (2)
#define ECHO_UART_BAUD_RATE     (115200)
#define ECHO_TASK_STACK_SIZE    (2048)