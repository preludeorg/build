import Page from "./modules/page.js";

window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/client/serviceworker.js').then(() => {
           console.log('ServiceWorker registered');
        });
    }
}

$(document).ready(function () {
    const page = new Page();
    page.build();
    //Screen.listen();
    //const keychain = Local.keychain.read();
    //Screen.build(keychain.servers.localhost);
});
