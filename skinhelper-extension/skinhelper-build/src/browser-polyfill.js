// SkinHelper Browser Compatibility Shim
// Must be loaded before popup.js and content.js
// Uses var so it's available globally in all script contexts

var browserAPI = (function() {
  if (typeof browser !== 'undefined' && browser.storage) {
    // Firefox / Safari — already promise-based
    return browser;
  }
  if (typeof chrome !== 'undefined' && chrome.storage) {
    // Chrome / Brave / Edge — wrap callbacks in promises
    return {
      storage: {
        local: {
          get: function(keys) {
            return new Promise(function(resolve, reject) {
              chrome.storage.local.get(keys, function(result) {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve(result);
              });
            });
          },
          set: function(items) {
            return new Promise(function(resolve, reject) {
              chrome.storage.local.set(items, function() {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve();
              });
            });
          }
        },
        onChanged: chrome.storage.onChanged
      },
      runtime: chrome.runtime
    };
  }
  // Fallback — should never reach here
  return {};
})();
