// SkinHelper Background Service Worker
const _rt = typeof browser !== 'undefined' ? browser.runtime : chrome.runtime;
_rt.onInstalled.addListener(() => console.log('[SkinHelper] Installed'));
