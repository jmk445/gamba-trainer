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

class DeserializeError extends Error {
  constructor(message) {
    super(message);
    this.name = "DeserializeError";
  }
}

class LocalStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = "LocalStorageError";
  }
}

const errorCallbacks = [];
const allStores = {};

const deepCompate = (a, b) => {
  if (typeof a === "object") {
    return JSON.stringify(a) === JSON.stringify(b);
  } else {
    return a == b;
  }
};

let indexedDBDisabled = !window.indexedDB;

export default function persistStore(key, val, parseFn, onError) {
  const originalVal = JSON.parse(JSON.stringify(val));
  let indexedDBDisabledForKey = false;

  console.log("saved! motion");
  // if (allStores[key]) {
  //   throw new Error(`Persistent store with key ${key} already exists`);
  // }

  let store = writable(val); // Assuming writable is some sort of writable Svelte store or similar
  let request = indexedDB.open("MotionDatabase", 1);

  request.onupgradeneeded = function(event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains("DataStore")) {
      db.createObjectStore("DataStore");
    }
  };

  request.onerror = function (event) {
    onError && onError(event);
  };

  request.onsuccess = function (event) {
    let db = event.target.result;

    if (db.objectStoreNames.contains("DataStore")) {
      let transaction = db.transaction(["DataStore"], "readwrite");
      let objectStore = transaction.objectStore("DataStore");
      let getRequest = objectStore.get(key);

      getRequest.onsuccess = function (event) {
        if (event.target.result !== undefined) {
          let data = event.target.result;
          if (parseFn) {
            data = parseFn(data);
          }
          store.set(data);
        }
      };

      store.subscribe((val) => {
        if (key !== "persistStore.dirty" && !deepCompate(val, originalVal)) {
          dirty.set(true);
        }
  
        if (indexedDBDisabled || indexedDBDisabledForKey) {
          return;
        }
  
        let transaction = db.transaction(["DataStore"], "readwrite");
        let objectStore = transaction.objectStore("DataStore");
        let putRequest = objectStore.put(val, key);
    
        putRequest.onerror = function (event) {
          const error = new Error("Failed to store data");
          onError && onError(error);
          errorCallbacks.forEach((cb) => cb(error));
        };
      });
    } else {
      console.error("Object Store does not exist.");
    }
  };

  store.deserialize = (data) => {
    if (parseFn) {
      data = parseFn(data);
    }
    store.set(data);
  };

  store.reset = () => {
    store.set(originalVal);
  };

  store.disableIndexedDB = (toggle = true) => {
    indexedDBDisabledForKey = toggle;
    if (indexedDB) {
      let db = request.result;
      let transaction = db.transaction(["DataStore"], "readwrite");
      let objectStore = transaction.objectStore("DataStore");
      objectStore.delete(key);
    }
  };

  allStores[key] = store;

  return store;
}

export const dirty = persistStore("persistStore.dirty", false);
persistStore.clearDirty = function () {
  dirty.set(false);
};

persistStore.disable = function () {
  indexedDBDisabled = true;
};

persistStore.onError = (cb) => errorCallbacks.push(cb);

persistStore.reset = function () {
  Object.values(allStores).forEach((store) => store.reset());
  dirty.set(false);
};

persistStore.serialize = function () {
  return Object.keys(allStores).reduce((data, key) => {
    data[key] = get(allStores[key]);
    return data;
  }, {});
};

persistStore.deserialize = function (data) {
  try {
    Object.keys(allStores).forEach((key) => {
      if (data[key] !== undefined) {
        allStores[key].deserialize(data[key]);
      } else {
        console.warn(`Missing data for key ${key} when deserializing`);
      }
    });
  } catch (e) {
    persistStore.onError(new DeserializeError("Failed to deserialize"));
  }
  dirty.set(false);
};
