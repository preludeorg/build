window.onload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/static/serviceworker.js');
    }
}