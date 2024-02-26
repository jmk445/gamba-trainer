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
import AUDIOCapturer from "@speech/util/AUDIOCapturer";
import { connect, setImuDataMode } from "../bleInterfaceStore/actions";
import { isConnected } from "../bleInterfaceStore/store";
import { trainedModel } from "../train/store";
import { testPredictions } from "./store";
import { processAudioBuffer, int16ToFloat32 } from "../train/actions";

import * as captureSettings from "../captureSettings/store";

let audioCapturer;

export async function beginTesting2()
{
  console.log("test");
  console.log(get(trainedModel));
}
export async function beginTesting() {
  // make sure we have a model to test
  if (!get(trainedModel)) {
    throw new Error("No trained model available");
  }

  if (audioCapturer) {
    throw new Error("Testing already in progress");
  }
  // make sure we're connected
  if (!get(isConnected)) {
    await connect();
  }

  //await setImuDataMode();

  audioCapturer = new AUDIOCapturer({
    onCaptureComplete: async (data) => {
      const preparedData = [];
      data.forEach((recording) => {
        const float32Array = int16ToFloat32(recording);
        preparedData.push(...float32Array);
      });
      const specData = await processAudioBuffer(preparedData);

      const predictionsTensor = get(trainedModel).predict(tf.tensor([specData]).squeeze().expandDims(-1).expandDims(0));
      const [predictions] = predictionsTensor.arraySync();
      testPredictions.set(predictions);
      endTesting();
    },
  });

  audioCapturer.start();
}

export async function endTesting() {
  if (audioCapturer) {
    audioCapturer.stop();
    audioCapturer = null;
  }
}
