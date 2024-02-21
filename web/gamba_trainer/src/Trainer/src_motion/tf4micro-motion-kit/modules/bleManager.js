/* Copyright 2021 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

/**
 * File bleManager.js - handles communcation between webpage and Arduino
 * including transfering of models
 * @author Rikard Lindstrom
 */

import bleFileTransfer from "./bleFileTransfer.js";
import EventHandler from "./EventHandler.js";

/********************************************************************
 * Colorized Logging
 *******************************************************************/

const log = (...args) => {
  console.log(
    "%c -> bleManager.js " + args.join(", "),
    "background: DarkOliveGreen; color: #F0F2F6; display: block;"
  );
};

/********************************************************************
 * BLE UUIDS
 *******************************************************************/

const SERVICE_UUID              = 0x00FF;

const IMU_DATA_RX_UUID          = 0xFF01;

const TYPE_SIGNAL_TX_UUID       = 0xFF12;

/********************************************************************
 * States / Types - Matches Arduino ENUM
 *******************************************************************/

const STATES = {
  IDLE_DISCONNECTED: 0, // Arduino was just turned on
  IDLE_CONNECTED: 1, // BLE was connected
  FILE_TRANSFER: 2, // File transfer mode
  INFERENCE: 3, // Inference is happening and published
  IMU_DATA_PROVIDER: 4, // Send IMU data over BLE for IMU Trainer
  ERROR_STATE: 5, // Something went wrong
  CALIBRATION: 6,
  INFERENCE_AND_DATA_PROVIDER: 7
};

const FILE_TYPES = {
  MODEL_FILE: 0,
  TEST_FILE: 1
};

/********************************************************************
 * Service / characteristics
 *******************************************************************/

let service;
let device;

// Characteristics
let imuDataRxChar,
  typeSignalTxChar;

// Keep track of connection
let isConnected = false;
let hasModel = false;

const eventHandler = new EventHandler(
  "inference",
  "imudata",
  "disconnect",
  "connect",
  "file-transfer-progress",
  "file-transfer-completed",
  "file-transfer-error",
  "quick-inference",
  "state-change",
  "has-model"
);

/********************************************************************
 * Methods
 *******************************************************************/

function handleIMUDataChange(event) {
  const data = new Float32Array(event.target.value.buffer);
  eventHandler.dispatchEvent("imudata", data);
}

function onDisconnected(event) {
  eventHandler.dispatchEvent("disconnect");
  isConnected = false;
}

async function connect() {
  log("Requesting device ...");

  device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  });

  log("Connecting to device ...");

  device.addEventListener("gattserverdisconnected", onDisconnected);

  const server = await device.gatt.connect();

  log("Getting primary service ...");
  service = await server.getPrimaryService(SERVICE_UUID);
}



const bleManagerApi = {
  async connect() {
  
    await connect();
    console.log('SETUP CONNECT!');
    imuDataRxChar           = await service.getCharacteristic(IMU_DATA_RX_UUID);
    typeSignalTxChar        = await service.getCharacteristic(TYPE_SIGNAL_TX_UUID);
    console.log("Complete getCharacteristic!");
    
    await imuDataRxChar.startNotifications();
    imuDataRxChar.addEventListener(
      "characteristicvaluechanged",
      handleIMUDataChange
      );
      console.log("Start Notification: imuData");
      
    // type signal 전송
    await typeSignalTxChar.writeValue(Uint8Array.of(0));

    isConnected = true;
  },

  async disconnect() {
    // await bleManagerApi.setState('IDLE_DISCONNECTED');
    console.log("disconnected");
    await device.gatt.disconnect()
  },


  addEventListener(...args) {
    return eventHandler.addEventListener(...args);
  },

  removeEventListener(...args) {
    return eventHandler.removeEventListener(...args);
  },

  once(...args){
    return eventHandler.once(...args);
  },

  propagateEventsTo(_eventHandler) {
    eventHandler.propagateTo(_eventHandler);
  },
};

export default bleManagerApi;
