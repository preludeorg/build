import Page from "/client/js/page.js";

window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/client/serviceworker.js').then(() => {
           console.log('ServiceWorker registered');
        });
    }
}

$(document).ready(function () {
    Page.build({host:'http://localhost:3000/blah', token:'gogo'});
    Page.listen();
});