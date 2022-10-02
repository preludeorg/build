import Api from "/client/js/api.js";
import Page from "/client/js/page.js";
import Server from "/client/js/plugins/server.js";

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