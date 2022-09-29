import Api from "js/api.js";
import Page from "js/page.js";
import Server from "js/plugins/server.js";

window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/client/serviceworker.js').then(() => {
           console.log('ServiceWorker registered');
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