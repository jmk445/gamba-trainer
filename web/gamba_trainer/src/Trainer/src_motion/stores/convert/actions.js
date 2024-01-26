import {trainedModel} from "../train/store"

export async function saveTflite(blob) {

    const openRequest = indexedDB.open('yourDB', 1);

    openRequest.onupgradeneeded = function (event) {
        const db = event.target.result;

        // 객체 저장소 생성
        if (!db.objectStoreNames.contains('models')) {
            db.createObjectStore('models');
        }
    };

    openRequest.onsuccess = function (event) {
        const db = event.target.result;

        saveModelToIndexedDB(db, blob);

    };
}


function saveModelToIndexedDB(db, blob) {

    const reader = new FileReader();
    reader.onload = function (event) {
        const transaction = db.transaction(['models'], 'readwrite');
        const store = transaction.objectStore('models');
        const arrayBuffer = event.target.result;
        
        // ArrayBuffer를 IndexedDB에 저장
        const request = store.put(arrayBuffer, 'tfliteModel');

        request.onsuccess = function () {
            console.log('Model saved to IndexedDB');
        };

        request.onerror = function (event) {
            console.error('Error saving model to IndexedDB', event.target.error);
            transaction.abort();
        };
    };

    reader.readAsArrayBuffer(blob);

}




