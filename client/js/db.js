const DB_NAME = 'operator';
const DB_VERSION = 1;
const DB_STORE_NAME = 'dcfs';

let Database = {
    db: null,
    connect: () => {
        console.log("[CONNECT] starting");
        if (Database.db) return Database.db;

        let openRequest = indexedDB.open(DB_NAME, DB_VERSION);

        openRequest.onerror = function (evt) {
            console.error("[CONNECT] error: ", evt.target.errorCode);
        };

        openRequest.onupgradeneeded = function (evt) {
            Database.db = this.result;
            let store = Database.db.createObjectStore(DB_STORE_NAME, {keyPath: 'name'});
            console.log("[CONNECT] added object store ", store);
        };

        openRequest.onsuccess = function (evt) {
            // Equal to: db = req.result;
            Database.db = this.result;
            console.log("[CONNECT] done ", this.result);
        };
    },
    getObjectStore: (storeName, mode) => {
        let transaction = Database.db.transaction(storeName, mode);
        transaction.onerror = function (evt) {
            console.log('[GET_OBJECT_STORE] transaction error')
        }
        return transaction.objectStore(storeName);
    },
    doSomeThings: () => {
        let store = Database.getObjectStore(DB_STORE_NAME, 'readwrite');
        let dcf = {name: 'test-dcf', code: 'echo hi'}
        let addRequest = store.add(dcf)
        addRequest.onsuccess = function (evt) {
            console.log('[DO_SOME_THINGS] add ', evt.target.result);
        }
        addRequest.onerror = function (evt) {
            console.log('[DO_SOME_THINGS] error ', evt.target.errorCode)
        }
        store.get('test-dcf').onsuccess = function (evt) {
            console.log('[DO_SOME_THINGS] get ', evt.target.result);
        }
    }
}

// export default Database;
