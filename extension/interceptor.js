// interceptor.js - Runs in MAIN world to monkey-patch fetch
(function() {
  const originalFetch = window.fetch;
  
  // Platform Detection
  const platform = window.location.hostname.includes('kling') ? 'kling' : 
                   window.location.hostname.includes('wavespeed') ? 'wavespeed' : 'unknown';

  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    let requestBody = null;
    
    // Capture Request Body before sending
    if (init && init.body && typeof init.body === 'string') {
        try {
            requestBody = JSON.parse(init.body);
        } catch (e) {
            // Not a JSON body
        }
    }

    // Call the original fetch
    const response = await originalFetch.apply(this, arguments);
    const clone = response.clone();
    
    // Process response async so it doesn't block the site
    clone.text().then(text => {
        try {
            const bodyObj = JSON.parse(text);
            
            // Only send if it looks like an API call we care about
            if (url && (url.includes('/api/') || url.includes('/task/') || url.includes('/video/'))) {
                window.postMessage({
                    type: 'VTRACKER_FETCH_INTERCEPT',
                    platform,
                    url,
                    requestBody,
                    responseBody: bodyObj
                }, '*');
            }
        } catch (e) {
             // Not JSON, ignore
        }
    }).catch(e => {
        // Ignorar erros de leitura do clone
    });

    return response;
  };
})();
