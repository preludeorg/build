const DB_NAME = 'operator';
const DB_VERSION = 1;
const DB_STORE_NAME = 'dcfs';

let Database = {
    db: null,
    connect: () => {
        if (Database.db) return Database.db;

        let openRequest = indexedDB.open(DB_NAME, DB_VERSION);
        openRequest.onerror = function (evt) {
            console.error("[CONNECT] error: ", evt.target.errorCode);
        };
        openRequest.onupgradeneeded = function (evt) {
            Database.db = this.result;
            let store = Database.db.createObjectStore(DB_STORE_NAME, {keyPath: 'key'});
            console.log("[CONNECT] added object store ", store);
        };
        openRequest.onsuccess = function (evt) {
            // Equal to: db = req.result;
            Database.db = this.result;
            console.log("[CONNECT] done ", this.result);
        };
    },
    get: async (key) => {
        return new Promise((resolve, reject) => {
            let txn = Database.db.transaction(DB_STORE_NAME, 'readonly').objectStore(DB_STORE_NAME)
            txn = txn.get(key);
            txn.onsuccess = (r) => {
                if (r.target.result === undefined) {
                    reject(`[GET] key ${key} not found`);
                } else {
                    resolve(r.target.result);
                }
            }
            txn.onerror = (e) => reject(e);
        });
    },
    getKeys: async (lowerBound, upperBound) => {
        return new Promise((resolve, reject) => {
            let txn = Database.db.transaction(DB_STORE_NAME, 'readonly').objectStore(DB_STORE_NAME);
            txn.getAllKeys(IDBKeyRange.bound(lowerBound, upperBound)).onsuccess = (e) => {
                resolve(e.target.result);
            }
        });
    },
    getObjects: async (lowerBound, upperBound) => {
        return new Promise((resolve, reject) => {
            let txn = Database.db.transaction(DB_STORE_NAME, 'readonly').objectStore(DB_STORE_NAME)
            let objs = [];
            txn.openCursor(IDBKeyRange.bound(lowerBound, upperBound)).onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    objs.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(objs);
                }
            }
        })
    },
    set: async (value) => {
        return new Promise((resolve, reject) => {
            let txn = Database.db.transaction(DB_STORE_NAME, 'readwrite').objectStore(DB_STORE_NAME)
            txn = txn.put(value);
            txn.onsuccess = (r) => resolve(r.target.result);
            txn.onerror = (e) => reject(e);
        });
    },
    delete: async (key) => {
        return new Promise((resolve, reject) => {
            let txn = Database.db.transaction(DB_STORE_NAME, 'readwrite').objectStore(DB_STORE_NAME)
            txn = txn.delete(key);
            txn.onsuccess = () => resolve();
            txn.onerror = (e) => reject(e);
        });
    },
}

// export default Database;
