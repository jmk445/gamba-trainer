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
import { labels, recordings, armedLabelIndex, captureState } from "./store";
import * as captureSettings from "../captureSettings/store";

import IMAGECapturer from "@vision/util/IMAGECapturer";
import { connect, setImuDataMode } from "../bleInterfaceStore/actions";
import { isConnected } from "../bleInterfaceStore/store";

export function addLabel(labelName) {
  labels.update(($labels) => {
    
    //label 개수 제한(10개)
    if ($labels.length > 10) {
      throw new Error(`label cnt should be under 10`);
    }
    //label 길이 제한(20자)
    if (labelName.length > 20) {
      throw new Error(`label length should be under 20`)
    }
    //label의 중복된 이름 제한
    if ($labels.includes(labelName)) {
      throw new Error(`${labelName} already exists`);
    }
    return [...$labels, labelName];
  });
  recordings.update(($recordings) => [...$recordings, []]);
}

export function removeLabel(index) {
  console.log("remove");
  recordings.update(($recordings) => {
    const c = [...$recordings];
    c.splice(index, 1);
    return c;
  });

  labels.update(($labels) => {
    const c = [...$labels];
    c.splice(index, 1);
    return c;
  });
}

export function removeRecording(labelIndex, recordingIndex) {
  recordings.update(($recordings) => {
    $recordings[labelIndex] = $recordings[labelIndex].filter(
      (_, index) => index !== recordingIndex
    );
    return [...$recordings];
  });
}

export function removeLabelByName(label) {
  const index = get(labels).indexOf(label);
  console.log(index);
  if (index > -1) {
    return removeLabel(index);
  }
}

export function clearRecordings() {
  get(labels).forEach((_, index) => {
    clearRecordingsForLabel(index);
  });
}

export function clearRecordingsForLabel(labelIndex) {
  recordings.update(($recordings) => {
    $recordings[labelIndex] = [];
    return $recordings;
  });
}

export function addRecording(labelIndex, data) {
  if (labelIndex !== get(armedLabelIndex)) {
    console.warn(
      "addRecording called for non armed label index. This is probably ok later on when loading, but shouldn't happen while recording"
    );
  }
  recordings.update(($recordings) => {
    $recordings[labelIndex] = [...$recordings[labelIndex], data];
    return [...$recordings];
  });
}

//=============================================================================
// Recording
//=============================================================================

let imageCapturer = null;
export async function beginRecording() {
  if (imageCapturer) {
    throw new Error("Already capturing");
  }
  if (!get(isConnected)) {
    await connect();
  }

  await setImuDataMode();

  const labelIndex = get(armedLabelIndex);
  // any change to armed index must abort recording
  const unsubLabelIndex = armedLabelIndex.subscribe(handleArmedIndexChange);
  async function handleArmedIndexChange(value) {
    if (value !== labelIndex) {
      await endRecording();
      unsubLabelIndex();
    }
  }

  imageCapturer = new IMAGECapturer({
    // numSamples: get(captureSettings.captureSamples),
    // captureDelay: get(captureSettings.captureDelay),
    // sensitivity: get(captureSettings.captureThreshold),
    onCaptureComplete: (data) => {
      const reshapedData = new Array(96).fill(null).map(() => new Array(96).fill(null).map(() => [0, 0, 0]));
      for(let i = 0; i < data.length; i++){
        for(let j = 0; j < data[0].length; j += 3){
          reshapedData[i][j/3][0] = data[i][j] + 128;
          reshapedData[i][j/3][1] = data[i][j+1] + 128;
          reshapedData[i][j/3][2] = data[i][j+2] + 128;
        }
      }


      addRecording(labelIndex, reshapedData);
      captureState.set("waiting");
      endRecording();
    },
    onCaptureBegin: () => {
      captureState.set("recording");
    },
    onReadyToCapture: () => {
      captureState.set("armed");
    },
    // thresholdFilter: [1, 1, 1, 1, 1, 1, 0, 0, 0],
    // useMagnetometer: get(captureSettings.useMagnetometer),
  });
  captureState.set("armed");
  imageCapturer.start();
}

export async function endRecording() {
  if (imageCapturer) {
    console.log("end recording");

    await imageCapturer.stop();
    imageCapturer = null;

    captureState.set("idle");
  }
}
