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

import { get } from "svelte/store";
import * as tf from "@tensorflow/tfjs";
import IMAGECapturer from "@vision/util/IMAGECapturer";
import { connect, setImuDataMode } from "../bleInterfaceStore/actions";
import { isConnected } from "../bleInterfaceStore/store";
import { trainedModel } from "../train/store";
import { testPredictions } from "./store";
import { createSpectrogram } from "../train/actions";

import * as captureSettings from "../captureSettings/store";

function int16ToFloat32(int16Array) {
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = (int16Array[i] + 128) / 255.0;
  }

  return float32Array;
}

let imageCapturer;
export async function beginTesting() {
  // make sure we have a model to test
  if (!get(trainedModel)) {
    throw new Error("No trained model available");
  }

  if (imageCapturer) {
    throw new Error("Testing already in progress");
  }
  // make sure we're connected
  if (!get(isConnected)) {
    await connect();
  }

  await setImuDataMode();

  imageCapturer = new IMAGECapturer({
    onCaptureComplete: async (data) => {
      const preparedData = [];
      data.forEach((recording) => {
        const float32Array = int16ToFloat32(recording);
        preparedData.push(...float32Array);
      });
      const input = tf.tensor(preparedData, [96, 96, 3]);

      const predictionsTensor = get(trainedModel).predict(input.expandDims(0));
      const [predictions] = predictionsTensor.arraySync();
      testPredictions.set(predictions);
      endTesting();
    },
  });

  imageCapturer.start();
}

export async function endTesting() {
  if (imageCapturer) {
    imageCapturer.stop();
    imageCapturer = null;
  }
}
