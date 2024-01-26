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
const IMU_DATA_LABELS_RX_UUID   = 0xFF02;
const VERSION_RX_UUID           = 0xFF03;
const INFERENCE_RX_UUID         = 0xFF04;

const NUM_CLASSES_UUID          = 0xFF05;
const NUM_SAMPLES_UUID          = 0xFF06;
const CAPTURE_DELAY_UUID        = 0xFF07;
const THRESHOLD_UUID            = 0xFF08;
const DISABLE_MAGNETOMETER_UUID = 0xFF09;

const STATE_TX_UUID             = 0xFF0A;
const STATE_RX_UUID             = 0xFF0B;
const FILE_TYPE_TX_UUID         = 0xFF0C;
const HAS_MODEL_RX_UUID         = 0xFF0D;

const META_TX_UUID              = 0xFF0E;
const META_RX_UUID              = 0xFF0F;

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
let numClassesTxChar,
  numSamplesTxChar,
  captureDelayTxChar,
  thresholdTxChar,
  disableMagnetometerTx,
  stateTxChar,
  stateRxChar,
  inferenceRxChar,
  imuDataRxChar,
  metaRxChar,
  metaTxChar,
  fileTransferTypeTxChar,
  hasModelRxChar,
  dataLabelsRxChar,
  versionRxChar;

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

function handleInferenceChange(event) {
  log("InferenceChange Occured")
  const values = new Uint8Array(event.target.value.buffer);
  eventHandler.dispatchEvent("inference", {
    index: values[0],
    score: values[1],
    velocity: values[2],
  });
}

async function updateHasModel(){
  const reader = await hasModelRxChar.readValue();
  const v = await reader.getUint8();
  hasModel = v;
  eventHandler.dispatchEvent('has-model', hasModel);
}

function handleHasModelChange(event){
  const value = event.target.value;
  const v = new Uint8Array(value.buffer)[0];
  hasModel = v;
  eventHandler.dispatchEvent('has-model', hasModel);
}

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

  device = 
  await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  });

  log("Connecting to device ...");

  device.addEventListener("gattserverdisconnected", onDisconnected);

  const server = await device.gatt.connect();

  log("Getting primary service ...");
  service = await server.getPrimaryService(SERVICE_UUID);
  bleFileTransfer.setupService(service);
}

function handleStateChange(e){
  const reader = e.target.value;
  const byte = new Uint8Array(reader.buffer)[0];
  const state = Object.keys(STATES).find(k=>STATES[k]===byte);
  if(state === STATES.ERROR_STATE){
    eventHandler.dispatchEvent('error',new Error('Arduion is in error state'));
  }
  console.log('state cahnge')
  eventHandler.dispatchEvent('state-change', state);
}

bleFileTransfer.addEventListener("progress", (p) => {
  eventHandler.dispatchEvent("file-transfer-progress", p);
});

bleFileTransfer.addEventListener("completed", (p) => {
  eventHandler.dispatchEvent("file-transfer-completed", p);
});

bleFileTransfer.addEventListener("error", (p) => {
  eventHandler.dispatchEvent("file-transfer-error", p);
});

const bleManagerApi = {
  async connect() {
  
    await connect();
    console.log('SETUP CONNECT!');
    numClassesTxChar        = await service.getCharacteristic(NUM_CLASSES_UUID);
    numSamplesTxChar        = await service.getCharacteristic(NUM_SAMPLES_UUID);
    captureDelayTxChar      = await service.getCharacteristic(CAPTURE_DELAY_UUID);
    thresholdTxChar         = await service.getCharacteristic(THRESHOLD_UUID);
    stateTxChar             = await service.getCharacteristic(STATE_TX_UUID);
    inferenceRxChar         = await service.getCharacteristic(INFERENCE_RX_UUID);
    imuDataRxChar           = await service.getCharacteristic(IMU_DATA_RX_UUID);
    metaRxChar              = await service.getCharacteristic(META_RX_UUID);
    metaTxChar              = await service.getCharacteristic(META_TX_UUID);
    stateRxChar             = await service.getCharacteristic(STATE_RX_UUID);
    fileTransferTypeTxChar  = await service.getCharacteristic(FILE_TYPE_TX_UUID);
    disableMagnetometerTx   = await service.getCharacteristic(DISABLE_MAGNETOMETER_UUID);
    hasModelRxChar          = await service.getCharacteristic(HAS_MODEL_RX_UUID);
    versionRxChar           = await service.getCharacteristic(VERSION_RX_UUID);
    dataLabelsRxChar        = await service.getCharacteristic(IMU_DATA_LABELS_RX_UUID);    
    console.log("Complete getCharacteristic!");
    await inferenceRxChar.startNotifications();
    inferenceRxChar.addEventListener(
      "characteristicvaluechanged",
      handleInferenceChange
    );
    console.log("Start Notification: inference");

    await imuDataRxChar.startNotifications();
    imuDataRxChar.addEventListener(
      "characteristicvaluechanged",
      handleIMUDataChange
    );
    console.log("Start Notification: imuData");

    await hasModelRxChar.startNotifications();
    hasModelRxChar.addEventListener("characteristicvaluechanged", handleHasModelChange)
    updateHasModel();
    console.log("Start Notification: hasModel");

    await stateRxChar.startNotifications();
    stateRxChar.addEventListener("characteristicvaluechanged", handleStateChange);
    console.log("Start Notification: state");

    //isConnected = true;
  },

  async disconnect() {
    await bleManagerApi.setState('IDLE_DISCONNECTED');
    console.log("disconnected");
    await device.gatt.disconnect()
  },

  async transferFile(fileBuffer, fileType){
    console.log("transferFile Call");
    if(FILE_TYPES[fileType] === undefined){
      throw new Error(`Unknown file type: ${fileType}, valid options are: ${Object.keys(FILE_TYPES).join(', ')}`)
    }
    if (!isConnected) {
      throw new Error("modelBleTransfer not connected");
    }

    // Set state to file transfer
    const stateArray = Uint8Array.of(STATES.FILE_TRANSFER);
    await stateTxChar.writeValue(stateArray);
    

    const fileTypeArray = Uint8Array.of(FILE_TYPES[fileType]);
    await fileTransferTypeTxChar.writeValue(fileTypeArray);

    // transfer file
    return bleFileTransfer.transferFile(fileBuffer);
  },

  async transferModel(
    modelBuffer,
    numClasses,
    threshold,
    numSamples,
    captureDelay,
    useMagnetometer
  ) {
    if (!isConnected) {
      throw new Error("modelBleTransfer not connected");
    }

    console.log("transferModel Call");

    // Write settings
    const numClassesArray = Uint8Array.of(numClasses);
    await numClassesTxChar.writeValue(numClassesArray);

    const numSamplesArray = Int32Array.of(numSamples);
    await numSamplesTxChar.writeValue(numSamplesArray);

    const thresholdArray = Float32Array.of(threshold);
    await thresholdTxChar.writeValue(thresholdArray);

    const captureDelayArray = Int32Array.of(captureDelay);
    await captureDelayTxChar.writeValue(captureDelayArray);

    const disableMagnetometerArray = Uint8Array.of(!useMagnetometer);
    await disableMagnetometerTx.writeValue(disableMagnetometerArray);

    // transfer file
    return bleManagerApi.transferFile(modelBuffer, 'MODEL_FILE')
  },

  async setDisableMagnetometer(value){
    console.log("Disable Mag");
    const disableMagnetometerArray = Uint8Array.of(value);
    await disableMagnetometerTx.writeValue(disableMagnetometerArray);
  },

  async setState(state) {
    console.log("setState Call");
    if (STATES[state] === undefined) {
      throw new Error(
        `Invalid state ${state}. Available states are ${Object.keys(
          STATES
        ).join(", ")}`
      );
    }
    const stateTxChar = await service.getCharacteristic(STATE_TX_UUID);
    const stateArray = Uint8Array.of(STATES[state]);
    console.log("State Change: ", stateArray);
    await stateTxChar.writeValue(stateArray);
  },

  async writeMetaRaw(bytes) {
    console.log("write meta");
    if (bytes.length > 64) {
      throw new Error("Meta length has a 64 byte limit");
    }
    await metaTxChar.writeValue(bytes);
  },

  async readMetaRaw() {
    console.log("read meta");
    const reader = await metaRxChar.readValue();
    const bytes = new Uint8Array(reader.buffer);
    return bytes;
  },

  async writeMetaString(message) {
    console.log("write meta string");
    const bytes = new Uint8Array(64);
    message.split("").forEach((c, i) => {
      bytes[i] = c.charCodeAt(0);
    });
    return this.writeMetaRaw(bytes);
  },

  async readMetaString() {
    console.log("read meta string");
    const bytes = await this.readMetaRaw();
    let utf8Decoder = new TextDecoder();
    let message = utf8Decoder.decode(bytes);
    return message;
  },

  async readDataProviderLabels(){
    console.log("read data provider labels");
    const reader = await dataLabelsRxChar.readValue();
    const bytes = new Uint8Array(reader.buffer);
    let utf8Decoder = new TextDecoder();
    let labels = utf8Decoder.decode(bytes);
    // fix typo bug in Arduino sketch (v005)
    labels = labels.replace('max.zl','mag.z')
    return labels;
  },

  async readVersion(){
    console.log("read version");
    const reader = await versionRxChar.readValue();
    const bytes = new Uint8Array(reader.buffer);
    return bytes[0];
  },

  async getState() {
    console.log("get state");
    const reader = await stateRxChar.readValue();
    const byte = new Uint8Array(reader.buffer)[0];
    return Object.keys(STATES).find((k) => STATES[k] === byte);
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
