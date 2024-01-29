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
import { clearPersistantStorage } from "../aggregatedActions";
import { getModelJson, modelFromJson } from "../train/actions";
import { trainedModel } from "../train/store";
import persistStore from "../utils/persistStore";
import { fileHandle, hasFile, fileVersion } from "./store";


const isChromeOs = /(CrOS)/.test(navigator.userAgent);

//save할 때 json 파일을 생성함
async function writeJsonFile(fileHandle) {
  // Create a FileSystemWritableFileStream to write to.
  // 웹브라우저의 fileSystemAceess API를 활용해서 writable객체를 생성,활용해 로컬 스토리지에 저장할 수 있게끔한다. 
  // 사용하는 방법은 fileHandle객체(js) or writable(svelte)을 이용한 객체에 createWritable메소드를 사용하는 형태로 사용
  const writable = await fileHandle.createWritable();
  const data = persistStore.serialize();
  //기존 모델(trainedModel)이 있으면 persistStore인 data에 기존모델에서의 data를 추출해서 저장.
  if (get(trainedModel)) {
    data.model = await getModelJson();
  }

  data.version = get(fileVersion);
  //data를 기반으로 json파일 생성
  const contents = JSON.stringify({ version: fileVersion, ...data });
  
  //todo 
  // json 파일이랑 tflite 파일까지 저장할 수 있도록
  //await writable  

  //writable 을 이용해 contents 저장
  await writable.write(contents);
  await writable.close();
}

// todo 
// json 파일 뿐만 아니라 tflite 파일까지 같이 저장하게끔해야함. 
// 근데 json파일은 .json 확장자로 저장하는데 tflite 파일까지 같이 저장하려면 어떤 확장자로 저장하지?
// zip 파일
// 그리고 save 하는 시점이 어딘지에 따라서 tflite파일이 생성이 될 수도 안될 수도 있다는 것. 
// 아 capture상황에서는 fileHandle에 뭔가 쓰질 않나?
// ㄴㄴ save하는 기능에서 지금까지의 상황을 읽어와서 저장하기 때문에() setting만 해도 json 파일 생성됨.
// 그러면 

async function readFile(fileHandle) {
  const fileData = await fileHandle.getFile();

  const reader = new FileReader();
  const readJson = async (e) => {
    const text = e.target.result;
    const data = JSON.parse(text);
    // @TODO - send user to a previous version
    // if current no longer reads file
    // const version = data.version || "2";
    // if (version != fileVersion) {
    //   if (
    //     confirm(
    //       `File version mismatch. Loaded file version: ${version}. Go to the old website?`
    //     )
    //   ) {
    //     location.href = <other url>;
    //   }
    //   return;
    // }

    // we've gotten this far, time to clear storage
    clearPersistantStorage();

    persistStore.deserialize(data);
    trainedModel.set(null);
    if (data.model) {
      await modelFromJson(data.model);
    }
  };

  reader.onload = readJson;
  reader.readAsText(fileData);
}

export async function saveFile() {
  if (get(hasFile)) {
    //아 그거네 만약에 파일을 load 한 상태에서 start over를 했거나 settings로 다시 돌아가게 되면 filehandle이 변경되지 않을 거고 그 프로젝트에 덮어 쓰기를 해야한다.그래서 save as 를 거치지 않고 바로 write
    writeJsonFile(get(fileHandle));
  } else {    
    //기존 프로젝트가 로드 되지 않았을때. 
    return saveFileAs();
  }
}

export async function saveFileAs() {
  const $fileHandle = await window.showSaveFilePicker({
    types: [
      {
        description: "JSON File",
        accept: { "application/json": [".json"] },
      },
    ],
  });
  writeJsonFile($fileHandle);
  fileHandle.set($fileHandle);
}

export async function loadFile() {
  const [$fileHandle] = await window.showOpenFilePicker({
    multiple: false,
    types: isChromeOs
      ? undefined
      : [
          {
            description: "JSON File",
            accept: { "application/json": [".json"] },
          },
        ],
  });
  await readFile($fileHandle);
  fileHandle.set($fileHandle);
}
