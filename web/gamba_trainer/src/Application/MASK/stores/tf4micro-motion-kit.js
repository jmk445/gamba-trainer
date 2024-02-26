class EventHandler {
  constructor(...eventNames) {
    this.eventListeners = {};
    this.propagation = [];
    eventNames.forEach((eventName) => {
      this.addEventName(eventName);
    });
  }

  _checkEvent(eventName) {
    if (!this.eventListeners[eventName]) {
      throw new Error(
        `No event named ${eventName}. Availible events are ${Object.keys(
          this.eventListeners
        ).join(', ')}`
      );
    }
  }

  addEventListener(eventName, callback) {
    this._checkEvent(eventName);
    this.eventListeners[eventName].push(callback);
    return () => {
      this.removeEventListener(eventName, callback);
    }
  }

  removeEventListener(eventName, callback) {
    this._checkEvent(eventName);
    this.eventListeners[eventName] = this.eventListeners[eventName].filter(
      (cb) => cb !== callback
    );
  }

  once(eventName, callback) {
    const unsub = this.addEventListener(eventName, (...args) => {
      callback(...args);
      unsub();
    });
  }

  dispatchEvent(eventName, data) {
    this._checkEvent(eventName);
    this.eventListeners[eventName].forEach((cb) => cb(data));
    this.propagation.forEach(listener => listener.dispatchEvent(eventName, data));
  }

  addEventName(name) {
    this.eventListeners[name] = this.eventListeners[name] || [];
  }

  propagateTo(eventHandler) {
    this.propagation.push(eventHandler);
    Object.keys(this.eventListeners).forEach((name) => eventHandler.addEventName(name));
  }
}



let fileBlockCharacteristic = null;
let fileLengthCharacteristic = null;
let fileMaximumLengthCharacteristic = null;
let fileChecksumCharacteristic = null;
let commandCharacteristic = null;
let transferStatusCharacteristic = null;
let errorMessageCharacteristic = null;

const eventHandler$2 = new EventHandler('error', 'progress', 'begin', 'completed');

let isFileTransferInProgress = false;
const FILE_BLOCK_UUID = 0x00F1;
const FILE_LENGTH_UUID = 0x00F2;
const FILE_MAXIMUM_LENGTH_UUID = 0x00F3;
const FILE_CHECKSUM_UUID = 0x00F4;
const COMMAND_UUID = 0x00F5;
const TRANSFER_STATUS_UUID = 0x00F6;
const ERROR_MESSAGE_UUID = 0x00F7;

// Display logging information in the interface, you'll want to customize this
// for your page.
const msg = (...args) => {
  console.log(
    "%c -> bleFileTransfer.js " + args.join(", "),
    "background: DarkOliveGreen; color: #F0F2F6; display: block;"
  );
};

// ------------------------------------------------------------------------------
// This section contains functions you may want to customize for your own page.

// You'll want to replace these two functions with your own logic, to take what
// actions your application needs when a file transfer succeeds, or errors out.
async function onTransferSuccess() {
  isFileTransferInProgress = false;
  let checksumValue = await fileChecksumCharacteristic.readValue();
  let checksumArray = new Uint32Array(checksumValue.buffer);
  let checksum = checksumArray[0];
  msg("File transfer succeeded: Checksum 0x" + checksum.toString(16));
  eventHandler$2.dispatchEvent('completed');
}

// Called when something has gone wrong with a file transfer.
function onTransferError() {
  isFileTransferInProgress = false;
  msg("File transfer error");
  eventHandler$2.dispatchEvent('error', new Error('File transfer failed'));
}

// Called when an error message is received from the device. This describes what
// went wrong with the transfer in a user-readable form.
function onErrorMessageChanged(event) {
  let value = new Uint8Array(event.target.value.buffer);
  let utf8Decoder = new TextDecoder();
  let errorMessage = utf8Decoder.decode(value);
  console.log("Error message = " + errorMessage);
}

// ------------------------------------------------------------------------------
// This section has the public APIs for the transfer process, which you
// shouldn't need to modify but will have to call.

async function setupService(service) {

  msg("Getting characteristics ...");
  fileBlockCharacteristic = await service.getCharacteristic(FILE_BLOCK_UUID);
  fileLengthCharacteristic = await service.getCharacteristic(FILE_LENGTH_UUID);
  fileMaximumLengthCharacteristic = await service.getCharacteristic(
    FILE_MAXIMUM_LENGTH_UUID
  );
  fileChecksumCharacteristic = await service.getCharacteristic(
    FILE_CHECKSUM_UUID
  );
  commandCharacteristic = await service.getCharacteristic(COMMAND_UUID);
  transferStatusCharacteristic = await service.getCharacteristic(
    TRANSFER_STATUS_UUID
  );
  await transferStatusCharacteristic.startNotifications();
  transferStatusCharacteristic.addEventListener(
    "characteristicvaluechanged",
    onTransferStatusChanged
  );
  errorMessageCharacteristic = await service.getCharacteristic(
    ERROR_MESSAGE_UUID
  );
  await errorMessageCharacteristic.startNotifications();
  errorMessageCharacteristic.addEventListener(
    "characteristicvaluechanged",
    onErrorMessageChanged
  );

  isFileTransferInProgress = false;
  msg("Connected to device");
}

async function transferFile$1(fileContents) {
  let maximumLengthValue = await fileMaximumLengthCharacteristic.readValue();
  let maximumLengthArray = new Uint32Array(maximumLengthValue.buffer);
  let maximumLength = maximumLengthArray[0];
  if (fileContents.byteLength > maximumLength) {
    msg(
      "File length is too long: " +
      fileContents.byteLength +
      " bytes but maximum is " +
      maximumLength
    );
    return;
  }

  if (isFileTransferInProgress) {
    msg("Another file transfer is already in progress");
    return;
  }

  msg("Transfering file");
  console.log(fileContents);
  let fileLengthArray = Int32Array.of(fileContents.byteLength);
  await fileLengthCharacteristic.writeValue(fileLengthArray);
  let fileChecksum = crc32(fileContents);
  let fileChecksumArray = Uint32Array.of(fileChecksum);
  await fileChecksumCharacteristic.writeValue(fileChecksumArray);

  let commandArray = Int32Array.of(1);
  await commandCharacteristic.writeValue(commandArray);
  console.log("transfer info complete!");

  return sendFileBlock(fileContents, 0);

}

async function cancelTransfer() {
  let commandArray = Int32Array.of(2);
  await commandCharacteristic.writeValue(commandArray);
}

// ------------------------------------------------------------------------------
// The rest of these functions are internal implementation details, and shouldn't
// be called by users of this module.

function onTransferInProgress() {
  isFileTransferInProgress = true;
}

function onTransferStatusChanged(event) {
  let value = new Uint32Array(event.target.value.buffer);
  let statusCode = value[0];
  if (statusCode === 0) {
    onTransferSuccess();
  } else if (statusCode === 1) {
    onTransferError();
  } else if (statusCode === 2) {
    onTransferInProgress();
  }
}

function prepareDummyFileContents(fileLength) {
  let result = new ArrayBuffer(fileLength);
  let bytes = new Uint8Array(result);
  const contentString = "The quick brown fox jumped over the lazy dog. ";
  for (var i = 0; i < bytes.length; ++i) {
    var contentIndex = i % contentString.length;
    bytes[i] = contentString.charCodeAt(contentIndex);
  }
  return result;
}

// See http://home.thep.lu.se/~bjorn/crc/ for more information on simple CRC32 calculations.
function crc32ForByte(r) {
  for (let j = 0; j < 8; ++j) {
    r = (r & 1 ? 0 : 0xedb88320) ^ (r >>> 1);
  }
  return r ^ 0xff000000;
}

function crc32(dataIterable) {
  const tableSize = 256;
  if (!window.crc32Table) {
    const crc32Table = new Uint32Array(tableSize);
    for (let i = 0; i < tableSize; ++i) {
      crc32Table[i] = crc32ForByte(i);
    }
    window.crc32Table = crc32Table;
  }
  let dataBytes = new Uint8Array(dataIterable);
  let crc = 0;
  for (let i = 0; i < dataBytes.byteLength; ++i) {
    const crcLowByte = crc & 0x000000ff;
    const dataByte = dataBytes[i];
    const tableIndex = crcLowByte ^ dataByte;
    // The last >>> is to convert this into an unsigned 32-bit integer.
    crc = (window.crc32Table[tableIndex] ^ (crc >>> 8)) >>> 0;
  }
  return crc;
}

async function sendFileBlock(fileContents, bytesAlreadySent) {
  console.log("sendFileBlock called!");
  let bytesRemaining = fileContents.byteLength - bytesAlreadySent;

  const maxBlockLength = 128;
  const blockLength = Math.min(bytesRemaining, maxBlockLength);
  var blockView = new Uint8Array(fileContents, bytesAlreadySent, blockLength);
  // console.log(blockView);
  isFileTransferInProgress = transferStatusCharacteristic.readValue();
  return fileBlockCharacteristic
    .writeValue(blockView)
    .then((_) => {
      console.log("write Complete", isFileTransferInProgress);
      bytesRemaining -= blockLength;
      // isFileTransferInProgress = transferStatusCharacteristic.readValue();
      if (bytesRemaining > 0 && isFileTransferInProgress) {
        msg("File block written - " + bytesRemaining + " bytes remaining");
        bytesAlreadySent += blockLength;
        eventHandler$2.dispatchEvent('progress', bytesAlreadySent / fileContents.byteLength);
        return sendFileBlock(fileContents, bytesAlreadySent);
      }
    })
    .catch((error) => {
      console.log(error);
      msg(
        "File block write error with " +
        bytesRemaining +
        " bytes remaining, see console"
      );
    });
}

var bleFileTransfer = {
  setupService,
  transferFile: transferFile$1,
  cancelTransfer,
  addEventListener(...args) { eventHandler$2.addEventListener(...args); },
  removeEventListener(...args) { eventHandler$2.removeEventListener(...args); },
  dummTransfer() {
    msg("Trying to write dummy file ...");
    let fileContents = prepareDummyFileContents(30 * 1024);
    transferFile$1(fileContents);
  },
};



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

const SERVICE_UUID = 0x00FF;

const IMU_DATA_RX_UUID = 0xFF01;
const INFERENCE_RX_UUID = 0xFF04;

const NUM_CLASSES_UUID = 0xFF05;
const NUM_SAMPLES_UUID = 0xFF06;
const CAPTURE_DELAY_UUID = 0xFF07;
const THRESHOLD_UUID = 0xFF08;
const DISABLE_MAGNETOMETER_UUID = 0xFF09;

const STATE_TX_UUID = 0xFF0A;
const STATE_RX_UUID = 0xFF0B;
const FILE_TYPE_TX_UUID = 0xFF0C;
const HAS_MODEL_RX_UUID = 0xFF0D;

const META_TX_UUID = 0xFF0E;
const META_RX_UUID = 0xFF0F;

const WHAT_PROJECT_TX_UUID = 0xFF12;
const NUM_LABEL_TX_UUID = 0xFF14;

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
  whatProjectTxChar,
  numLabelTxChar;

// Keep track of connection
let isConnected$2 = false;
let hasModel = false;

const eventHandler$1 = new EventHandler(
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
  const values = new Uint8Array(event.target.value.buffer);
  eventHandler$1.dispatchEvent("inference", {
    index: values[0],
    score: values[1],
    velocity: values[2],
  });
}

async function updateHasModel() {
  const reader = await hasModelRxChar.readValue();
  const v = await reader.getUint8();
  hasModel = v;
  eventHandler$1.dispatchEvent('has-model', hasModel);
}

function handleHasModelChange(event) {
  const value = event.target.value;
  const v = new Uint8Array(value.buffer)[0];
  console.log(v);
  hasModel = v;
  eventHandler$1.dispatchEvent('has-model', hasModel);
}

function handleIMUDataChange(event) {
  const data = new Float32Array(event.target.value.buffer);
  eventHandler$1.dispatchEvent("imudata", data);
}

function onDisconnected(event) {
  eventHandler$1.dispatchEvent("disconnect");
  isConnected$2 = false;
}

async function connect$1() {
  log("Requesting device ...");

  device = await navigator.bluetooth.requestDevice({
    filters: [{ services: [SERVICE_UUID] }],
  });

  log("Connecting to device ...");

  device.addEventListener("gattserverdisconnected", onDisconnected);

  const server = await device.gatt.connect();

  log("Getting primary service ...");
  service = await server.getPrimaryService(SERVICE_UUID);

  bleFileTransfer.setupService(service);
}

function handleStateChange(e) {
  const reader = e.target.value;
  const byte = new Uint8Array(reader.buffer)[0];
  const state = Object.keys(STATES).find(k => STATES[k] === byte);
  if (state === STATES.ERROR_STATE) {
    eventHandler$1.dispatchEvent('error', new Error('Arduion is in error state'));
  }
  console.log('state cahnge', state);
  eventHandler$1.dispatchEvent('state-change', state);
}

bleFileTransfer.addEventListener("progress", (p) => {
  eventHandler$1.dispatchEvent("file-transfer-progress", p);
});

bleFileTransfer.addEventListener("completed", (p) => {
  eventHandler$1.dispatchEvent("file-transfer-completed", p);
});

bleFileTransfer.addEventListener("error", (p) => {
  eventHandler$1.dispatchEvent("file-transfer-error", p);
});

const bleManagerApi = {
  async connect() {

    await connect$1();
    console.log('SETUP CONNECT!');
    numClassesTxChar = await service.getCharacteristic(NUM_CLASSES_UUID);
    numSamplesTxChar = await service.getCharacteristic(NUM_SAMPLES_UUID);
    captureDelayTxChar = await service.getCharacteristic(CAPTURE_DELAY_UUID);
    thresholdTxChar = await service.getCharacteristic(THRESHOLD_UUID);
    stateTxChar = await service.getCharacteristic(STATE_TX_UUID);
    inferenceRxChar = await service.getCharacteristic(INFERENCE_RX_UUID);
    imuDataRxChar = await service.getCharacteristic(IMU_DATA_RX_UUID);
    metaRxChar = await service.getCharacteristic(META_RX_UUID);
    metaTxChar = await service.getCharacteristic(META_TX_UUID);
    stateRxChar = await service.getCharacteristic(STATE_RX_UUID);
    fileTransferTypeTxChar = await service.getCharacteristic(FILE_TYPE_TX_UUID);
    disableMagnetometerTx = await service.getCharacteristic(DISABLE_MAGNETOMETER_UUID);
    hasModelRxChar = await service.getCharacteristic(HAS_MODEL_RX_UUID);
    whatProjectTxChar = await service.getCharacteristic(WHAT_PROJECT_TX_UUID);
    numLabelTxChar = await service.getCharacteristic(NUM_LABEL_TX_UUID);

    await inferenceRxChar.startNotifications();
    inferenceRxChar.addEventListener(
      "characteristicvaluechanged",
      handleInferenceChange
    );

    await imuDataRxChar.startNotifications();
    imuDataRxChar.addEventListener(
      "characteristicvaluechanged",
      handleIMUDataChange
    );

    await hasModelRxChar.startNotifications();
    hasModelRxChar.addEventListener("characteristicvaluechanged", handleHasModelChange);
    updateHasModel();

    await stateRxChar.startNotifications();
    stateRxChar.addEventListener("characteristicvaluechanged", handleStateChange);

    isConnected$2 = true;
  },

  async numLabel(num) {
    console.log("numLabel: ", num);
    const tempArray = Uint8Array.of(num);
    await numLabelTxChar.writeValue(tempArray);
  },

  async disconnect() {
    await bleManagerApi.setState('IDLE_DISCONNECTED');
    await device.gatt.disconnect();
  },

  async transferFile(fileBuffer, fileType) {
    if (FILE_TYPES[fileType] === undefined) {
      throw new Error(`Unknown file type: ${fileType}, valid options are: ${Object.keys(FILE_TYPES).join(', ')}`)
    }
    if (!isConnected$2) {
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
    if (!isConnected$2) {
      throw new Error("modelBleTransfer not connected");
    }

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

  async setDisableMagnetometer(value) {
    const disableMagnetometerArray = Uint8Array.of(value);
    await disableMagnetometerTx.writeValue(disableMagnetometerArray);
  },

  async setState(state) {
    if (STATES[state] === undefined) {
      throw new Error(
        `Invalid state ${state}. Available states are ${Object.keys(
          STATES
        ).join(", ")}`
      );
    }
    const stateTxChar = await service.getCharacteristic(STATE_TX_UUID);
    const stateArray = Uint8Array.of(STATES[state]);
    console.log("State: ", stateArray);
    await stateTxChar.writeValue(stateArray);
  },

  async writeMetaRaw(bytes) {
    if (bytes.length > 64) {
      throw new Error("Meta length has a 64 byte limit");
    }
    await metaTxChar.writeValue(bytes);
  },

  async readMetaRaw() {
    const reader = await metaRxChar.readValue();
    const bytes = new Uint8Array(reader.buffer);
    return bytes;
  },

  async writeMetaString(message) {
    const bytes = new Uint8Array(64);
    message.split("").forEach((c, i) => {
      bytes[i] = c.charCodeAt(0);
    });
    return this.writeMetaRaw(bytes);
  },

  async readMetaString() {
    const bytes = await this.readMetaRaw();
    let utf8Decoder = new TextDecoder();
    let message = utf8Decoder.decode(bytes);
    return message;
  },

  async getState() {
    const reader = await stateRxChar.readValue();
    const byte = new Uint8Array(reader.buffer)[0];
    return Object.keys(STATES).find((k) => STATES[k] === byte);
  },

  addEventListener(...args) {
    return eventHandler$1.addEventListener(...args);
  },

  removeEventListener(...args) {
    return eventHandler$1.removeEventListener(...args);
  },

  once(...args) {
    return eventHandler$1.once(...args);
  },

  propagateEventsTo(_eventHandler) {
    eventHandler$1.propagateTo(_eventHandler);
  },
};


const eventHandler = new EventHandler(
  "inference",
  "connect",
  "disconnect",
  "imudata"
);

// let all events from bleManager propagate
bleManagerApi.propagateEventsTo(eventHandler);

// Simple validation
function validate(val, name, type) {
  if (typeof val !== type) {
    throw new Error(
      `Argument ${name} is required and needs to be a ${type}. Received ${val}`
    );
  }
}

function loadFile() {
  const fileInput = document.getElementById('fileInput');
  
  return new Promise((resolve, reject) => {
    const file = fileInput.files[0]; // 첫 번째 파일 가져오기

    if (!file) {
        reject(new Error("No file selected"));
        return;
    }

    const reader = new FileReader();

    reader.onload = function(event) {
        resolve(event.target.result);
    };

    reader.onerror = function(event) {
        reject(new Error("Error reading file"));
    };

    reader.readAsArrayBuffer(file); // 파일을 ArrayBuffer로 읽기
  });
}

function loadFile$1() {
  const dbName = 'yourDB';
  const storeName = 'models';
  const version = 1;
  //db에서 tflite파일을 load한다.
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);

    request.onsuccess = function (event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, 'readonly');
      const objectStore = transaction.objectStore(storeName);

      const getRequest = objectStore.get('tfliteModel');

      getRequest.onsuccess = function (event) {
        const result = event.target.result;
        const ArrayBuffer = result.data;
        if (result) {
          resolve(result);
        } else {
          reject("Record not found in IndexedDB.");
        }
      };

      getRequest.onerror = function (error) {
        reject("Error reading data from IndexedDB: " + error);
      };

      transaction.oncomplete = function () {
        db.close();
      };
    };

    request.onerror = function (error) {
      reject("Error opening database: " + error);
    };
  });
}

function getState() {
  return bleManagerApi.getState();
}

function writeMetaString(msg) {
  return bleManagerApi.writeMetaString(msg);
}

function readMetaString() {
  return bleManagerApi.readMetaString();
}

let _isConnected = false;
async function connect() {
  await bleManagerApi.connect();
  _isConnected = true;
  eventHandler.dispatchEvent("connect");
}

function isConnected$1() {
  return _isConnected;
}

async function disconnect() {
  return bleManagerApi.disconnect().then(() => {
    _isConnected = false;
    eventHandler.dispatchEvent("disconnect");
  });
}

async function setState(state) {
  await bleManagerApi.setState(state);
}

async function transferFile({ file, fileType }) {
  if (typeof file !== "string" && !(file instanceof ArrayBuffer)) {
    throw new Error(
      "file need to be either a string or an instance of ArrayBuffer"
    );
  }

  try {
    const fileBuffer =
      file instanceof ArrayBuffer ? file : await loadFile$1(file);
    if (!_isConnected) {
      console.log('not connecteds');
      await bleManagerApi.connect();
    }

    try {
      await bleManagerApi.transferFile(fileBuffer, fileType);
    } catch (e) {
      console.trace(e);
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Failed loading model at ${file}, check the url`);
  }
}

function setDisableMagnetometer(value) {
  return bleManagerApi.setDisableMagnetometer(value);
}

async function transferModel({
  numClasses,
  threshold,
  numSamples,
  captureDelay,
  useMagnetometer = true,
}) {
  // if (typeof model !== "string" && !(model instanceof ArrayBuffer)) {
  //   throw new Error(
  //     "model need to be either a string or an instance of ArrayBuffer"
  //   );
  // }

  validate(numClasses, "numClasses", "number");
  validate(threshold, "threshold", "number");
  validate(numSamples, "numSamples", "number");
  validate(captureDelay, "captureDelay", "number");

  try {
    console.log("validation succeeded");
    const modelBuffer = await loadFile$1();
    console.log("file load succeeded");
    if (!_isConnected) {
      await bleManagerApi.connect();
    }
    try {
      await bleManagerApi.transferModel(
        modelBuffer,
        numClasses,
        threshold,
        numSamples,
        captureDelay,
        useMagnetometer
      );
    } catch (e) {
      console.trace(e);
    }
  } catch (e) {
    console.error(e);
    throw new Error(`Failed loading model at, check the url`);
  }
}

function addEventListener(eventName, callback) {
  return eventHandler.addEventListener(eventName, callback);
}

function removeEventListener(eventName, callback) {
  return eventHandler.removeEventListener(eventName, callback);
}

//외부에서 접근하기 위한 api를 제공하는 것으로 추정
var api = /*#__PURE__*/Object.freeze({
  __proto__: null,
  getState: getState,
  writeMetaString: writeMetaString,
  readMetaString: readMetaString,
  connect: connect,
  isConnected: isConnected$1,
  disconnect: disconnect,
  setState: setState,
  transferFile: transferFile,
  setDisableMagnetometer: setDisableMagnetometer,
  transferModel: transferModel,
  addEventListener: addEventListener,
  removeEventListener: removeEventListener
});

const defaultConfig = {
  autoTransfer: true,
};
let buttonEl;
let experimentConfig;


let isConnected = false;
async function handleDisconnect() {
  isConnected = false;
  //buttonEl.innerText = "Connect";
  experimentConfig.onDisconnect && experimentConfig.onDisconnect();
}

async function handleConnect() {
  isConnected = true;
  //buttonEl.innerText = "Disconnect";
  console.log("connect!", experimentConfig);
  experimentConfig.onConnect && experimentConfig.onConnect();
}

function handleInference(data) {
  if (experimentConfig.onInference) {
    experimentConfig.onInference(data);
  } else {
    console.log(
      "Got gesture! You should probably supply a onInference function",
      data
    );
  }
}

function handleFileTransferProgress(p) {
  experimentConfig.onTransferProgress && experimentConfig.onTransferProgress(p);
}

function handleFileTransferCompleted(p) {
  experimentConfig.onTransferCompleted &&
    experimentConfig.onTransferCompleted(p);
}

export async function handleClickConnect(config) {
  
  //integerInput.value = 5;
  
  console.log("handleclickconnect enter succeeded");

  experimentConfig = { ...defaultConfig, ...config };

  if (!isConnected) {
    removeEventListener("disconnect", handleDisconnect);
    removeEventListener("connect", handleConnect);
    removeEventListener("inference", handleInference);
    removeEventListener(
      "file-transfer-progress",
      handleFileTransferProgress
    );
    removeEventListener(
      "file-transfer-completed",
      handleFileTransferCompleted
    );

    addEventListener("disconnect", handleDisconnect);
    addEventListener("connect", handleConnect);
    addEventListener("inference", handleInference);
    addEventListener("file-transfer-progress", handleFileTransferProgress);
    addEventListener(
      "file-transfer-completed",
      handleFileTransferCompleted
    );
    
    await connect();
    bleManagerApi.numLabel(5);
    if (experimentConfig.autoTransfer) {
      await transferModel(experimentConfig);
    }
  } else {

    await disconnect();
  }
}

// export async function createConnectButton(containerEl, config) {
//   console.log("entered");
//   if (typeof containerEl === "string") {
//     let _containerEl = document.querySelector(containerEl);
//     if (!_containerEl) {
//       throw new Error(`Failed finding a element with selector ${containerEl}`);
//     }
//     containerEl = _containerEl;
//   }

//   experimentConfig = { ...defaultConfig, ...config };

//   buttonEl = document.createElement("button");
//   buttonEl.classList.add("tinyml-experiment-imu-ble-interface-button");
//   buttonEl.id = "connect-button";
//   buttonEl.innerText = "Connect";
//   buttonEl.disabled = true;

//   buttonEl.addEventListener(
//     "click",
//     () => handleClickConnect(),
//     false
//   );

//   containerEl.appendChild(buttonEl);
//   return buttonEl;
// }

let button;
let settings;

function updateConnected() {
  if (isConnected$1()) {
    button.removeAttribute('disabled');
  } else {
    button.setAttribute('disabled', true);
  }
}

window.tinyMlExperimentBleInterface = {
  api,
  createConnectButton,  
};
