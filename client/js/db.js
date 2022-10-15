import Api from './api.js';

const DB_NAME = 'operator';
const DB_VERSION = 1;
const DB_STORE_NAME = 'ttps';

let Database = {
    db: null,
    connect: async () => {
        return new Promise((resolve, reject) => {
            if (Database.db) resolve();

            let openRequest = indexedDB.open(DB_NAME, DB_VERSION);

            openRequest.onerror = function (evt) {
                console.error("[CONNECT] error: ", evt.target.errorCode);
                reject(evt);
            };
            openRequest.onupgradeneeded = function (evt) {
                Database.db = this.result;
                let store = Database.db.createObjectStore(DB_STORE_NAME, {keyPath: 'key'});
                console.log("[CONNECT] added object store ", store);
                resolve(evt);
            };
            openRequest.onsuccess = function (evt) {
                Database.db = this.result;
                console.log("[CONNECT] done ", this.result);
                resolve(evt);
            };
        });
    },
    sync: async () => {
        await Database.connect()
        if (!Database.db) {
            return new Promise((resolve, reject) => reject('Database not found'));
        }
        await Database.db.transaction(DB_STORE_NAME, 'readwrite').objectStore(DB_STORE_NAME).clear();

        await Api.ttp.manifest(true).then(manifest => {
            Object.values(manifest).forEach(ttp => {
                ttp.key=`/manifest/${ttp.id}`
                Database.set(ttp);
            });
            console.log('-- MANIFEST SYNCED --')
        }).catch( e => console.log('Syncing manifest to server failed.', e) )

        await Api.dcf.list().then(dcfs => {
            Object.entries(dcfs).forEach(([k,v]) => {
                let dcf = { key: `/dcf/${k}`, code: v }
                Database.set(dcf);
            })
            console.log('-- DCFS SYNCED --')
        }).catch( e => console.log('Syncing dcfs to server failed.', e) )
    },
    get: async (key) => {
        return new Promise((resolve, reject) => {
            if (!Database.db) reject('Database not found');
            let txn = Database.db.transaction(DB_STORE_NAME, 'readonly').objectStore(DB_STORE_NAME)
            txn = txn.get(key);
            txn.onsuccess = (r) => {
                if (r.target.result === undefined) {
                    reject(`[GET] key ${key} not found`);
                } else {
                    resolve(r.target.result);
                }
            }
            txn.onerror = (e) => reject(`Failed to lookup ${key}. ${e}`);
        });
    },
    getKeys: async (prefix) => {
        return new Promise((resolve, reject) => {
            if (!Database.db) reject('Database not found');
            let txn = Database.db.transaction(DB_STORE_NAME, 'readonly').objectStore(DB_STORE_NAME);
            txn = txn.getAllKeys(IDBKeyRange.bound(prefix, prefix + '\uffff', false, false));
            txn.onsuccess = (e) => {
                resolve(e.target.result);
            }
            txn.onerror = (e) => reject(`Failed to get keys. ${e}`);
        });
    },
    getObjects: async (prefix) => {
        return new Promise((resolve, reject) => {
            if (!Database.db) reject('Database not found');
            let txn = Database.db.transaction(DB_STORE_NAME, 'readonly').objectStore(DB_STORE_NAME);
            txn = txn.openCursor(IDBKeyRange.bound(prefix, prefix + '\uffff', false, false));
            let objs = [];
            txn.onsuccess = (e) => {
                const cursor = e.target.result;
                if (cursor) {
                    objs.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(objs);
                }
            }
            txn.onerror = (e) => reject(`Failed to get objects. ${e}`);
        })
    },
    set: async (value) => {
        return new Promise((resolve, reject) => {
            if (!Database.db) reject('Database not found');
            let txn = Database.db.transaction(DB_STORE_NAME, 'readwrite').objectStore(DB_STORE_NAME)
            txn = txn.put(value);
            txn.onsuccess = (r) => resolve(r.target.result);
            txn.onerror = (e) => reject(`Failed to set object ${value}. ${e}`);
        });
    },
    delete: async (key) => {
        return new Promise((resolve, reject) => {
            if (!Database.db) reject('Database not found');
            let txn = Database.db.transaction(DB_STORE_NAME, 'readwrite').objectStore(DB_STORE_NAME)
            txn = txn.delete(key);
            txn.onsuccess = () => resolve();
            txn.onerror = (e) => reject(e);
        });
    },
}

export default Database;
