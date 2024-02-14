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
import { labels, labelsCount, recordings, armedLabelIndex, captureState } from "./store";
import * as captureSettings from "../captureSettings/store";

import IMUCapturer from "@motion/util/IMUCapturer";
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

    //이전 label에서 새로운 label을 추가하여 새로운 배열을 반환.
    return [...$labels, labelName];
  });

  // labelsCount.update(($labelsCount) => {
  //   return ($labelsCount + 1);
  // })
  recordings.update(($recordings) => [...$recordings, []]);
}

// export function getLabelCnt(){
//   console.log(labels.getCnt());
//   return labels.getCnt();  
// }

export function clearAllLabel() {
  console.log("clear All labels");
  recordings.update(() => []);
  labels.update(() => []);

}

//label을 삭제할 때 실행되는 함수, recordings들도 같이 삭제됨.

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

//label 안에서 특정 recording을 삭제하려고 할때 실행되는 함수
export function removeRecording(labelIndex, recordingIndex) {
  console.log("removed recordings")
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

let imuCapturer = null;
export async function beginRecording() {
  if (imuCapturer) {
    throw new Error("Already capturing");
  }
  if (!get(isConnected)) {
    await connect();
  }
  console.log("beginned recordings")
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

  imuCapturer = new IMUCapturer({
    numSamples: get(captureSettings.captureSamples),
    captureDelay: get(captureSettings.captureDelay),
    sensitivity: get(captureSettings.captureThreshold),
    onCaptureComplete: (data) => {
      addRecording(labelIndex, data);
      captureState.set("waiting");
    },
    onCaptureBegin: () => {
      captureState.set("recording");
    },
    onReadyToCapture: () => {
      captureState.set("armed");
    },
    thresholdFilter: [1, 1, 1, 1, 1, 1, 0, 0, 0],
    useMagnetometer: get(captureSettings.useMagnetometer),
  });
  captureState.set("armed");
  imuCapturer.start();
}

export async function endRecording() {
  if (imuCapturer) {
    console.log("end recording");

    await imuCapturer.stop();
    imuCapturer = null;

    captureState.set("idle");
  }
}
