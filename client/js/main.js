import Api from "api.js";
import Database from "db.js";
import Page from "page.js";
import Server from "plugins/server.js";


function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

window.onload = () => {
    if ('serviceWorker' in navigator) {
        console.log('about to register service worker')
        navigator.serviceWorker.register('../serviceworker.js', {type: 'module'})
            .then(async (sw) => {
                console.log('ServiceWorker registered. Scope:', sw.scope);
                const permission = await window.Notification.requestPermission();
                console.log('asked permission:', Notification.permission);


                navigator.serviceWorker.ready.then((sw) => {
                    if (!('PushManager' in window)) {
                        console.log('No Push API Support!');
                        return;
                    }
                    sw.pushManager.getSubscription()
                        .then(async (subscription) => {
                            if (subscription) {
                                console.log('already subscribed to push server')
                                return subscription;
                            }
                            console.log('about to subscribe to push server')
                            let vapidPublic = await (await fetch('./vapidPublicKey', {})).text()
                            return sw.pushManager.subscribe({
                                userVisibleOnly: true,
                                applicationServerKey: urlBase64ToUint8Array(vapidPublic)
                            })
                        })
                        .then(subscription => {
                            console.log('about to subscribe to push messages from op-server')
                            console.log(JSON.stringify({subscription: subscription}))
                            Api.subscribeToPush(subscription)
                        })
                        .catch(err => console.log(err));
                })

            })
    } else {
        console.log('no service worker')
    }
}


const callback = async function() {
    await Database.sync().catch(e => console.log('Database sync failed.', e));
    Page.build();
    Page.listen();
};

$(document).ready(function () {
    console.log('HI')
    Page.addPlugin(new Server());
    Api.login(callback);
});