/* ======================================================================
Copyright 2021 Google LLC
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. 
========================================================================*/

/**
 * @autor Rikard Lindstrom <rlindstrom@google.com>
 */

import * as tf from "@tensorflow/tfjs";
import { get } from "svelte/store";

import * as datasetUtils from "@speech/util/datasetUtils";

import {
  modelArchitecture,
  trainBachSize,
  trainEarlyStopping,
  trainEarlyStoppingMaxEpochsWithoutImprovement,
  trainEarlyStoppingMinAccuracy,
  trainedModel,
  trainEpochs,
  trainingState,
  trainLogAccuracy,
  trainLogLoss,
  trainTestSplit,
  trainValidationSplit,
} from "./store";
import { labels, recordings } from "../capture/store";

const log = (...args) => {
  console.log(
    "%c -> train/actions.js " + args.join(", "),
    "background: DarkBlue; color: #F0F2F6; display: block;"
  );
};

function periodic_hann_window(window_length, dtype) {
  return 0.5 - 0.5 * tf.cos(2.0 * Math.PI * tf.range(tf.cast(window_length, 'float32')) / tf.cast(window_length, 'float32')); 
}

function periodicHannWindow(windowLength, dtype) {
  const range = tf.range(0, windowLength, 1, "float32");
  const pi = tf.scalar(Math.PI, "float32");
  const two = tf.scalar(2, "float32");
  const numerator = tf.mul(two, Math.PI);
  const denominator = tf.cast(range.size, "float32");

  const cosValues = tf.div(tf.mul(numerator, range), denominator).cos();
  const hannWindow = tf.sub(0.5, tf.mul(0.5, cosValues));

  return hannWindow;
}

function bilinearResize(image, height, width) {
  const img_height = image.length;
  const img_width = image[0].length;

  const resized = [];

  const x_ratio = parseFloat(img_width - 1) / (width - 1);
  const y_ratio = parseFloat(img_height - 1) / (height - 1);

  for(let i=0;i<height;i++) {
    resized[i] = [];
    for(let j=0;j<width;j++) {
      const x_l = Math.floor(x_ratio*j);
      const y_l = Math.floor(y_ratio*i);
      const x_h = Math.ceil(x_ratio*j);
      const y_h = Math.ceil(y_ratio*i);

      const x_weight = (x_ratio * j) - x_l;
      const y_weight = (y_ratio * i) - y_l;

      const a = image[y_l][x_l];
      const b = image[y_l][x_h];
      const c = image[y_h][x_l];
      const d = image[y_h][x_h];

      const pixel = a * (1 - x_weight) * (1 - y_weight)
                  + b * x_weight * (1 - y_weight)
                  + c * y_weight * (1 - x_weight)
                  + d * x_weight * y_weight;

      resized[i][j] = pixel;
    }
  }

  return resized;
}

// spectrogram으로 변환
export async function createSpectrogram(audioData) {
  const frameLength = 640; // 적절한 프레임 길이를 설정합니다.
  const frameStep = 320; // 적절한 프레임 스텝을 설정합니다.
  const audioTempTensor = tf.tensor1d(audioData);

  let spec = tf.signal.stft(audioTempTensor, frameLength, frameStep, 1024, periodicHannWindow);
  spec = tf.abs(spec);
  const spec_array = spec.arraySync();
  spec.print();
  //console.log(Math.max(...tf.util.flatten(spec_array)));

  const resized = bilinearResize(spec_array, 16, 16);
  //console.log(resized[0]);
  const newTensor = tf.tensor2d(resized,[16,16]);

  const resultSpec = newTensor.expandDims(-1);

  return resultSpec;
}

function int16ToFloat32(int16Array) {
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] / 32768.0;
  }

  return float32Array;
}

//X에 recordings들을 기록, Y에 label을 기록
export async function prepareDataSet() {
  const $labels = get(labels);
  const numLabels = $labels.length;
  const $recordings = get(recordings);

  const Y = [];
  const X = [];
  for (let [index, label] of $labels.entries()) {
    // one-hot
    const output = new Array(numLabels).fill(0);
    output[index] = 1;

    const recordings = $recordings[index];
    for (let recording of recordings) {
      const tensor = [];
      for (let a of recording) {
        const float32Array = int16ToFloat32(a);
        tensor.push(...float32Array);
        //tensor.push(...a);
      }
      const input = await createSpectrogram(tensor);
      X.push(input);
      Y.push(output);
    }
  }

  return [X, Y];
}

/**
 * Compiles model based on modelArchitecture
 * @returns model
 */
//모델 레이어 구성, 모델 세팅, 모델 컴파일
function setupModel(inputShape) {
  const architecture = get(modelArchitecture);
  const numLabels = get(labels).length;

  let model = tf[architecture.type]();
  architecture.layers.forEach((layer, index) => {
    const props = { ...layer.props };
    if (index === 0) {
      props.inputShape = inputShape;
      console.log(inputShape);
    } else if (index === architecture.layers.length - 1) {
      //last layer, units must be numLabels
      props.units = numLabels;
    }
    model.add(tf.layers[layer.type](props));
  });

  model.compile({
    optimizer: "rmsprop",
    loss: "meanSquaredError",
    metrics: ["accuracy", "mae"],
    validationSplit: get(trainValidationSplit),   //0.2
  });

  return model;
}

/**
 * Update log stores with latest data each epoch
 * @param {*} tfLogs logs object gotten from tensorflow callback
 */
function updateLogs(tfLogs) {
  trainLogAccuracy.update(($logs) => {
    $logs.train = [...$logs.train, tfLogs.acc];
    $logs.validation = [...$logs.validation, tfLogs.val_acc];
    return { ...$logs };
  });

  trainLogLoss.update(($logs) => {
    $logs.train = [...$logs.train, tfLogs.loss];
    $logs.validation = [...$logs.validation, tfLogs.val_loss];
    return { ...$logs };
  });
}

/**
 * Action to start training
 */
export async function beginTraining() {
  if (get(trainingState) !== "idle") {    //idle 일때만 트레이닝 가능
    throw new Error("Already training");
  }

  //=========================================================
  // Prepeare
  //=========================================================

  trainLogAccuracy.reset();
  trainLogLoss.reset();

  //=========================================================
  // Start training
  //=========================================================

  async function train(inputs, outputs) {
    trainedModel.set(null); //모델 초기화

    //모델 세팅
    let model = setupModel(inputs[0].shape);
    console.log("inputShape: " + inputs[0].shape);

    //=========================================================
    // Epoch Callback / Logs / Early Stopping
    //=========================================================

    const onEpochEnd = async (epoch, logs) => {
      log(`epoch: ${epoch}, accuracy: ${logs.acc}`);

      updateLogs(logs);

      // progress = epoch / ($epochs - 1);

      if (get(trainEarlyStopping)) {
        // Two conditions..
        // 1. Accuracy has to have reached min accuracy
        let maxAccuracy = 0;
        get(trainLogAccuracy).validation.forEach((v, i) => {
          maxAccuracy = Math.max(v, maxAccuracy);
        });
        log("maxAcc", maxAccuracy, get(trainEarlyStoppingMinAccuracy));
        if (maxAccuracy * 100 > get(trainEarlyStoppingMinAccuracy)) {
          let shouldStop = true;

          if (maxAccuracy === logs.val_acc) {
            // save snapshot of best model so far
            await model.save("localstorage://snapshot-model");
          }

          // 2. Accuracy has to have not increased for a set number of epochs
          let diffThreshold = 0.01; // max
          const historyCount = get(trainLogAccuracy).validation.length;
          if (
            historyCount >=
            get(trainEarlyStoppingMaxEpochsWithoutImprovement) + 1
          ) {
            const start =
              historyCount -
              get(trainEarlyStoppingMaxEpochsWithoutImprovement) -
              1;

            // we stop if we can find a higher accuracy than current
            for (let i = start; i < historyCount - 1; i++) {
              const acc = get(trainLogAccuracy).validation[i];
              if (logs.val_acc - acc > diffThreshold) {
                shouldStop = false;
                break;
              }
            }
          } else {
            shouldStop = false;
          }

          if (shouldStop) {
            trainingState.set("stop_queued");
          }
        }
      }
      if (get(trainingState) === "stop_queued") {
        model.stopTraining = true;
        trainingState.set("idle");
      }
    }; // /onEpochEnd

    // Split dataset in training / validation set
    const [x, val_x] = datasetUtils.splitArray(
      inputs,
      1 - get(trainValidationSplit)
    );
    const [y, val_y] = datasetUtils.splitArray(
      outputs,
      1 - get(trainValidationSplit)
    );

    // Remove any previous snapshot model, 이전 모델 먼저 삭제후
    try {
      await tf.io.removeModel("localstorage://snapshot-model");
    } catch {
      // should be ok, we probably didn't have a snap-shot
    }

    // start training, 모델 트레이닝 시작
    const info = await model.fit(tf.stack(x), tf.tensor(y), {
      validationData: [tf.stack(val_x), tf.tensor(val_y)],
      epochs: get(trainEpochs),
      batchSize: get(trainBachSize),
      callbacks: { onEpochEnd },
    });

    if (get(trainEarlyStopping)) {
      // load best model
      console.log("Early stopping enabled, loading best model");
      try {
        const snapShotModel = await tf.loadLayersModel(
          "localstorage://snapshot-model"
        );
        model = snapShotModel;
      } catch (e) {
        console.error(e);
      } finally {
        try {
          // cleanup
          await tf.io.removeModel("localstorage://snapshot-model");
        } catch {}
      }
    }

    log("Done training! Final accuracy");
    return [model, info];
  }

  const dataSet = await prepareDataSet();

  // split dataset in train / test
  const [train_X, train_Y, test_X, test_Y] =
    datasetUtils.shuffleAndSplitDataSet(dataSet, 1 - get(trainTestSplit));

  trainingState.set("training");

  const [_trainedModel, info] = await train(train_X, train_Y);

  trainingState.set("idle");

  trainedModel.set(_trainedModel);
}

export const stopTraining = function () {
  if (get(trainingState) !== "idle") {
    trainingState.set("stop_queued");
  }
};
//로컬 저장소에 기존 모델 잠시 저장후 data 추출후 모델 삭제, 이 데이터들로 json생성할것임
export async function getModelJson() {
  if (!get(trainedModel)) {
    return null;
  }

  const model = get(trainedModel);
  await model.save("localstorage://tmp-serialize-model");
  const data = {
    info: localStorage.getItem("tensorflowjs_models/tmp-serialize-model/info"),
    model_metadata: localStorage.getItem(
      "tensorflowjs_models/tmp-serialize-model/model_metadata"
    ),
    model_topology: localStorage.getItem(
      "tensorflowjs_models/tmp-serialize-model/model_topology"
    ),
    weight_data: localStorage.getItem(
      "tensorflowjs_models/tmp-serialize-model/weight_data"
    ),
    weight_specs: localStorage.getItem(
      "tensorflowjs_models/tmp-serialize-model/weight_specs"
    ),
  };
  await tf.io.removeModel("localstorage://tmp-serialize-model");
  return data;
}

//json파일로 부터 모델을 생성
export async function modelFromJson(json) {
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/info",
    json.info
  );
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/model_metadata",
    json.model_metadata
  );
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/model_topology",
    json.model_topology
  );
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/weight_data",
    json.weight_data
  );
  localStorage.setItem(
    "tensorflowjs_models/tmp-serialize-model/weight_specs",
    json.weight_specs
  );
  const model = await tf.loadLayersModel("localstorage://tmp-serialize-model");
  await tf.io.removeModel("localstorage://tmp-serialize-model");

  trainedModel.set(model);
}

export function removeTrainedModel() {
  trainedModel.set(null);
}
