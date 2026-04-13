// content.js - Runs in ISOLATED world
window.addEventListener('message', (event) => {
    // We only accept messages from ourselves
    if (event.source !== window) return;

    if (event.data.type && event.data.type === 'VTRACKER_FETCH_INTERCEPT') {
        // Pass it to the background script
        chrome.runtime.sendMessage(event.data);
    }
});
