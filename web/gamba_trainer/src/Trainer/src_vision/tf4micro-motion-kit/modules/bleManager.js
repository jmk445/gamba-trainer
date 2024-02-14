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

const SERVICE_UUID                = 0x00FF;

const AUDIO_DATA_RX_UUID          = 0xFF10;
const REQUEST_DATA_TX_UUID        = 0xFF11;

/********************************************************************
 * States / Types - Matches Arduino ENUM
 *******************************************************************/

const STATES = {
  IDLE_DISCONNECTED: 0, // Arduino was just turned on
  IDLE_CONNECTED: 1, // BLE was connected
  AUDIO_DATA_PROVIDER: 2, // Send Audio data over BLE for Audio Trainer
  ERROR_STATE: 3, // Something went wrong
};

/********************************************************************
 * Service / characteristics
 *******************************************************************/

let service;
let device;

// Characteristics
let audioDataRxChar,
  requestDataTxChar

// Keep track of connection
let isConnected = false;

const eventHandler = new EventHandler(
  "audiodata",
  "disconnect",
  "connect"
);

/********************************************************************
 * Methods
 *******************************************************************/
async function uint8ArrayTo16BitIntArray(uint8Array) {
  const intArray = new Int16Array(uint8Array.length / 2);

  for (let i = 0; i < uint8Array.length; i += 2) {
    const byte1 = uint8Array[i];
    const byte2 = uint8Array[i + 1];

    // Combine two 8-bit bytes into one 16-bit signed integer
    intArray[i / 2] = (byte2 << 8) | byte1;
  }

  return intArray;
}

async function handleAudioDataChange(event) {
  const originalData = new Uint8Array(event.target.value.buffer);
  // const trans16intData = await uint8ArrayTo16BitIntArray(originalData);
  // let data = new Float32Array(trans16intData.length);
  // for(let i=0;i<trans16intData.length;i++) {
  //   data[i] = trans16intData[i] / 32768.0;
  // }

  eventHandler.dispatchEvent("visiondata", originalData);
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

const bleManagerApi = {
  async connect() {
  
    await connect();
    console.log('SETUP CONNECT!');
    audioDataRxChar           = await service.getCharacteristic(AUDIO_DATA_RX_UUID);
    requestDataTxChar        = await service.getCharacteristic(REQUEST_DATA_TX_UUID);
    console.log("Complete getCharacteristic!");

    await audioDataRxChar.startNotifications();
    audioDataRxChar.addEventListener(
      "characteristicvaluechanged",
      handleAudioDataChange
    );
    console.log("Start Notification: audioData");

    isConnected = true;
  },

  async disconnect() {
    await bleManagerApi.setState('IDLE_DISCONNECTED');
    await device.gatt.disconnect()
  },

  async requestAudioData() {
    let requestArray = Int16Array.of(1);
    requestDataTxChar.writeValue(requestArray);
  },

  async setState(state) {
    if (STATES[state] === undefined) {
      throw new Error(
        `Invalid state ${state}. Available states are ${Object.keys(
          STATES
        ).join(", ")}`
      );
    }
    // const stateTxChar = await service.getCharacteristic(STATE_TX_UUID);
    // const stateArray = Uint8Array.of(STATES[state]);
    // console.log("State Change: ", stateArray);
    // await stateTxChar.writeValue(stateArray);
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
