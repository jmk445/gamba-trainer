
// fileTransfer
import EventHandler from "./EventHandler.js";


/********************************************************************
 * Colorized Logging
 *******************************************************************/

const log = (...args) => {
    console.log(
        "%c -> serialManager.js " + args.join(", "),
        "background: DarkOliveGreen; color: #F0F2F6; display: block;"
    );
};

/*******************************************************************
 * Service ids (Copy from bleManager)
 *******************************************************************/

const SERVICE_UUID = 0x00FF;

const IMU_DATA_RX_UUID = 0xFF01;
const IMU_DATA_LABELS_RX_UUID = 0xFF02;
const VERSION_RX_UUID = 0xFF03;
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
    const values = new Uint8Array(event.target.value.buffer);
    eventHandler.dispatchEvent("inference", {
        index: values[0],
        score: values[1],
        velocity: values[2],
    });
}

async function updateHasModel() {
    const reader = await hasModelRxChar.readValue();
    const v = await reader.getUint8();
    hasModel = v;
    eventHandler.dispatchEvent('has-model', hasModel);
}

function handleHasModelChange(event) {
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
    /*
    // Arduino Uno USB Vendor/Product IDs로 장치를 필터링한다.
    const filters = [
        { usbVendorId: 0x2341, usbProductId: 0x0043 },
        { usbVendorId: 0x2341, usbProductId: 0x0001 }
    ];

    // 사용자가 Arduino Uno device를 선택할 수 있게 프롬프트를 띄운다.
    const port = await navigator.serial.requestPort({ filters });

    const { usbProductId, usbVendorId } = port.getInfo();
    */
    device = await navigator.serial.requestPort();

    log("Connecting to device ...");
}

function handleStateChange(e) {
    const reader = e.target.value;
    const byte = new Uint8Array(reader.buffer)[0];
    const state = Object.keys(STATES).find(k => STATES[k] === byte);
    if (state === STATES.ERROR_STATE) {
        eventHandler.dispatchEvent('error', new Error('Arduion is in error state'));
    }
    console.log('state cahnge')
    eventHandler.dispatchEvent('state-change', state);
}

const serialManagerApi = {
    async connect() {
        await connect();
        console.log('SERIAL SETUP CONNECT');

        isConnected = true;
    },

    async disconnect() {
        await bleManagerApi.setState('IDLE_DISCONNECTED');
        console.log('Call disconnect')
    },

    async transferFile(fileBuffer, fileType) {
        console.log('Call transferFile')
    },

    async transferModel(
        modelBuffer,
        numClasses,
        threshold,
        numSamples,
        captureDelay,
        useMagnetometer
    ) {
        console.log('Call transferModel')
    },

    async setDisableMagnetometer(value) {
        const disableMagnetometerArray = Uint8Array.of(value);
        console.log('Call setDisableMagnetometer')
    },

    async setState(state) {
        if (STATES[state] === undefined) {
            throw new Error(
                `Invalid state ${state}. Available states are ${Object.keys(
                    STATES
                ).join(", ")}`
            );
        }
        //const stateTxChar = await service.getCharacteristic(STATE_TX_UUID);
        const stateArray = Uint8Array.of(STATES[state]);
        console.log("State Change: ", stateArray);
        //await stateTxChar.writeValue(stateArray);
    },

    async writeMetaRaw(bytes) {
        if (bytes.length > 64) {
            throw new Error("Meta length has a 64 byte limit");
        }
        //await metaTxChar.writeValue(bytes);
        console.log("Call writeMetaRaw");
    },

    async readMetaRaw() {
        //const reader = await metaRxChar.readValue();
        //const bytes = new Uint8Array(reader.buffer);
        //return bytes;
        console.log("Call readMetaRaw");
        return null;
    },

    async writeMetaString(message) {
        const bytes = new Uint8Array(64);
        message.split("").forEach((c, i) => {
            bytes[i] = c.charCodeAt(0);
        });
        //return this.writeMetaRaw(bytes);
        console.log("Call writeMetaString");
        return 0;
    },

    async readMetaString() {
        //const bytes = await this.readMetaRaw();
        //let utf8Decoder = new TextDecoder();
        //let message = utf8Decoder.decode(bytes);
        //return message;
        console.log("Call readMetaString");
        return 0;
    },

    async readDataProviderLabels() {
        /*
        const reader = await dataLabelsRxChar.readValue();
        const bytes = new Uint8Array(reader.buffer);
        let utf8Decoder = new TextDecoder();
        let labels = utf8Decoder.decode(bytes);
        // fix typo bug in Arduino sketch (v005)
        labels = labels.replace('max.zl', 'mag.z')
        return labels;*/
        
        console.log("Call readDataProviderLabels");
        return 0;
    },

    async readVersion() {
        //const reader = await versionRxChar.readValue();
        //const bytes = new Uint8Array(reader.buffer);
        //return bytes[0];
        
        console.log("Call readVersion");
        return 0;
    },

    async getState() {
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

    once(...args) {
        return eventHandler.once(...args);
    },

    propagateEventsTo(_eventHandler) {
        eventHandler.propagateTo(_eventHandler);
    },
}

export default serialManagerApi;