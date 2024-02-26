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

import AUDIOCapturer from "@speech/util/AUDIOCapturer";
import { connect, setImuDataMode } from "../bleInterfaceStore/actions";
import { isConnected } from "../bleInterfaceStore/store";

export function addLabel(label) {
  labels.update(($labels) => {
    if ($labels.includes(label)) {
      throw new Error(`${label} already exists`);
    }
    return [...$labels, label];
  });
  recordings.update(($recordings) => [...$recordings, []]);
}
export function clearAllLabel() {
  console.log("clear All labels");
  recordings.update(() => []);
  labels.update(() => []);

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

let audioCapturer = null;
export async function beginRecording() {
  if (audioCapturer) {
    throw new Error("Already capturing");
  }
  if (!get(isConnected)) {
    await connect();
  }

  // await setImuDataMode();

  const labelIndex = get(armedLabelIndex);
  // any change to armed index must abort recording
  const unsubLabelIndex = armedLabelIndex.subscribe(handleArmedIndexChange);
  async function handleArmedIndexChange(value) {
    if (value !== labelIndex) {
      await endRecording();
      unsubLabelIndex();
    }
  }

  audioCapturer = new AUDIOCapturer({
    // numSamples: get(captureSettings.captureSamples),
    // captureDelay: get(captureSettings.captureDelay),
    // sensitivity: get(captureSettings.captureThreshold),
    onCaptureComplete: (data) => {
      addRecording(labelIndex, data);
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
  audioCapturer.start();
}

export async function endRecording() {
  if (audioCapturer) {
    console.log("end recording");

    await audioCapturer.stop();
    audioCapturer = null;

    captureState.set("idle");
  }
}
