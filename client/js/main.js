import Api from "/client/js/api.js";
import Page from "/client/js/page.js";

window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/client/serviceworker.js').then(() => {
           console.log('ServiceWorker registered');
        });
    }
}

$(document).ready(function () {
    Api.login();
    Page.build();
    Page.listen();
});