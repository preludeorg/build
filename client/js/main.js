import Page from "/client/js/page.js";

window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/client/serviceworker.js').then(() => {
           console.log('ServiceWorker registered');
        });
    }
}

$(document).ready(function () {
    let host = localStorage.getItem('PRELUDE_SERVER') || 'http://localhost:3000';
    let account = localStorage.getItem('PRELUDE_ACCOUNT_ID') || 'prelude';
    let token = localStorage.getItem('PRELUDE_ACCOUNT_TOKEN');

    Page.build(host, account, token);
    Page.listen();
});