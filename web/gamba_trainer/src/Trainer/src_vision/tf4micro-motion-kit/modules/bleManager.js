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

import { get } from "svelte/store";
import EventHandler from "./EventHandler.js";
import { captureState } from "../../stores/capture/store";

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

const VISION_DATA_RX_UUID         = 0xFF19;
const REQUEST_DATA_TX_UUID        = 0xFF11;

const TYPE_SIGNAL_TX_UUID         = 0xFF12;
const BEGIN_RECORDING_RX_UUID     = 0xFF13;

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
let visionDataRxChar,
  requestDataTxChar,
  typeSignalTxChar,
  beginRecordingRxChar;

// Keep track of connection
let isConnected = false;

const eventHandler = new EventHandler(
  "visiondata",
  "disconnect",
  "connect"
);

/********************************************************************
 * Methods
 *******************************************************************/
async function handleVisionDataChange(event) {
  let data = new Int8Array(event.target.value.buffer);
  console.log(data);
  eventHandler.dispatchEvent("visiondata", data);
}

async function handleBeginRecording(event) {
  const recording = new Uint8Array(event.target.value.buffer);
  console.log(recording[0], get(captureState));
  if(recording[0] == 1 && (get(captureState) != "recording")) {
    console.log(window.location.pathname);
    if(window.location.pathname.includes("capture"))
    {
      //beginRecording();
      console.log("test","test");
      document.getElementsByClassName("rec-button")[0].click();
    }
    else if(window.location.pathname.includes("test"))
    {
      document.getElementById("test_button").click();
    }
  }
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
    visionDataRxChar           = await service.getCharacteristic(VISION_DATA_RX_UUID);
    requestDataTxChar         = await service.getCharacteristic(REQUEST_DATA_TX_UUID);
    typeSignalTxChar          = await service.getCharacteristic(TYPE_SIGNAL_TX_UUID);
    beginRecordingRxChar      = await service.getCharacteristic(BEGIN_RECORDING_RX_UUID);
    
    console.log("Complete getCharacteristic!");

    await visionDataRxChar.startNotifications();
    visionDataRxChar.addEventListener(
      "characteristicvaluechanged",
      handleVisionDataChange
    );
    console.log("Start Notification: visionData");

    await beginRecordingRxChar.startNotifications();
    beginRecordingRxChar.addEventListener(
      "characteristicvaluechanged",
      handleBeginRecording
    );
    console.log("Start Notification: beginRecording");
    
    // type signal 전송(2: trainer vision)
    await typeSignalTxChar.writeValue(Uint8Array.of(2));
    
    isConnected = true;
  },

  async disconnect() {
    await bleManagerApi.setState('IDLE_DISCONNECTED');
    await device.gatt.disconnect()
  },

  async requestVisionData() {
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
