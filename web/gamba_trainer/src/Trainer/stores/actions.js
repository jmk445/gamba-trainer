export function getTrainerADD() {    
    const dbName = "TrainerADD";
    const storeName = "DataStore";
    const version = 1;

    const request = indexedDB.open(dbName, version);

    return new Promise((resolve, reject) => {
        request.onsuccess = function (event) {
            const db = event.target.result;
            const transaction = db.transaction(storeName, "readonly");
            const objectStore = transaction.objectStore(storeName);

            const getRequest = objectStore.get("trainerADD!");

            getRequest.onsuccess = function (event) {
                const result = event.target.result;
                if (result) {                                                            
                    resolve(result);                                     
                } else {
                    console.log("Record not found in IndexedDB.");
                }
            };

            getRequest.onerror = function (error) {
                console.log("Error reading data from IndexedDB: " + error);
            };

            transaction.oncomplete = function () {
                db.close();
            };
        };

        request.onerror = function (error) {
            console.log("Error opening database: " + error);
        };
    });    

}