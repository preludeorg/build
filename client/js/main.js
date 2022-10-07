import Api from "api.js";
import Database from "db.js";
import Page from "page.js";
import Server from "plugins/server.js";

window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../serviceworker.js').then((sw) => {
           console.log('ServiceWorker registered. Scope:', sw.scope);
        });
    }
}

const callback = function() {
    Page.build();
    Page.listen();
};

$(document).ready(function () {
    Page.addPlugin(new Server());

    console.log("openDb ...");
    var req = indexedDB.open('prelude', 1);
    var db;
    req.onsuccess = function (evt) {
        // Equal to: db = req.result;
        db = this.result;
        console.log("openDb DONE ", req.result);

        var transaction = db.transaction('dcfs', 'readwrite');
        transaction.onsuccess = function (evt) {
            console.log('transaction success!')
        }
        var store = transaction.objectStore('dcfs');
        var dcf = {name: 'test-dcf', code: 'echo hi'}
        var add_req = store.add(dcf)
        add_req.onsuccess = function(evt) {
            console.log(evt.target.result == 'test-dcf');
        }

        store.get('test-dcf').onsuccess = function (evt) {
            console.log('[GET] test-dcf:', evt.target.result);
        }
    };
    req.onerror = function (evt) {
      console.error("openDb:", evt.target.errorCode);
    };
    req.onupgradeneeded = function(event) {
        var db = event.target.result;
        var store = db.createObjectStore('dcfs', {keyPath: 'name'});
        console.log("added object store")
    };
    Api.login(callback);
});