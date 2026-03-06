// content/twitter.js - Simplified for Chrome compatibility
console.log('[ClawPost] Twitter content script loaded');

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.platform === 'twitter' && request.text) {
    postTweet(request.text);
    sendResponse({success: true});
  }
  return true;
});

function postTweet(text) {
  // Find compose box
  const compose = document.querySelector('[data-testid="tweetTextarea_0"]');
  if (!compose) {
    console.error('[ClawPost] Compose box not found');
    return;
  }
  
  // Focus and enter text
  compose.focus();
  document.execCommand('insertText', false, text);
  
  // Click post button after delay
  setTimeout(() => {
    const postBtn = document.querySelector('[data-testid="tweetButton"], [data-testid="tweetButtonInline"]');
    if (postBtn) {
      postBtn.click();
      console.log('[ClawPost] Tweet posted');
    } else {
      console.error('[ClawPost] Post button not found');
    }
  }, 1000);
}