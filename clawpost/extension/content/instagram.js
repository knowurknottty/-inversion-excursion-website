// content/instagram.js - Simplified for Chrome compatibility
console.log('[ClawPost] Instagram content script loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.platform === 'instagram' && request.text) {
    console.log('[ClawPost] Instagram post requested:', request.text);
    sendResponse({success: true, message: 'Instagram posting not yet implemented'});
  }
  return true;
});