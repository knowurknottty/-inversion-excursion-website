// content/tiktok.js - Simplified for Chrome compatibility
console.log('[ClawPost] TikTok content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.platform === 'tiktok' && request.text) {
    console.log('[ClawPost] TikTok post requested:', request.text);
    sendResponse({success: true, message: 'TikTok posting not yet implemented'});
  }
  return true;
});