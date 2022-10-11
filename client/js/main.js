import Api from "api.js";
import Page from "page.js";
import Server from "plugins/server.js";

window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/serviceworker.js').then((s) => {
           console.log('ServiceWorker registered', s.scope);
        });
    }
}

const callback = function() {
    Page.build();
    Page.listen();
};

$(document).ready(function () {
    Page.addPlugin(new Server());
    Api.login(callback);
});