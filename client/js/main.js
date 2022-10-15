import Api from "api.js";
import Database from "db.js";
import Page from "page.js";
import Server from "plugins/server.js";

window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../serviceworker.js', {type: 'module'})
            .then(sw => console.log('ServiceWorker registered. Scope:', sw.scope));
    }
}

const callback = async function() {
    await Database.sync().catch(e => console.log('Database sync failed.', e));
    Page.build();
    Page.listen();
};

$(document).ready(function () {
    Page.addPlugin(new Server());
    Api.login(callback);
});