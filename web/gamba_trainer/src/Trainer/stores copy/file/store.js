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

import { derived, readable, writable } from "svelte/store";
import { dirty } from "../utils/persistStore";

export const fileDirty = derived(dirty, ($dirty) => $dirty);

export const fileHandle = writable(null);

//derived 를 통해 다른 store에 기초되는 값을 가지는 store를 만들 수 있다.
//hasFile의 경우 writable 인 fileHandle에 기초하고 있다.
export const hasFile = derived(fileHandle, ($fileHandle) => {
  //$ 를 통해 매개 변수 형태로 가져와서 출력 가능하다.
  // !!를 통해 bool 값으로 강제 변환된다.
  //즉 hasFile은 fileHandle을 bool형태로 리턴하는 함수
  console.log(!!$fileHandle) //This has to be deleted

  return !!$fileHandle;
});

export const fileVersion = readable(4);
