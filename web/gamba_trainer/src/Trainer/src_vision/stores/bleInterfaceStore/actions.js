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

import { writable, get } from "svelte/store";
import * as bleApi from "vision-tf4micro-motion-kit/api";

const sketchState = writable("unknown");

export async function connect() {
  await bleApi.connect();
  if (get(sketchState) !== "unknown") {
    try {
      await bleApi.setState(get(sketchState));
    } catch (e) {
      console.warn(e);
    }
  }
}

export function disconnect() {
  return bleApi.disconnect();
}

export function transferModel() {
  throw new Error("Not implemented");
}

async function setState(state) {
  if (get(sketchState) !== state) {
    sketchState.set(state);
    if (bleApi.isConnected()) {
      await bleApi.setState(state);
    }
  }
}

export function setImuDataMode() {
  return setState("AUDIO_DATA_PROVIDER");
}
