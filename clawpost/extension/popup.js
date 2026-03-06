// extension/popup.js
const relayInput = document.getElementById('relayUrl');
const secretInput = document.getElementById('wsSecret');
const saveBtn = document.getElementById('save');
const statusDiv = document.getElementById('status');
const statusDot = document.getElementById('statusDot');
const connectionText = document.getElementById('connectionText');

async function updateConnectionStatus() {
  const { relayUrl, connected } = await chrome.storage.local.get(['relayUrl', 'connected']);
  if (relayUrl) relayInput.value = relayUrl;
  
  if (connected) {
    statusDot.classList.add('connected');
    connectionText.textContent = 'Connected to relay';
    connectionText.style.color = '#7ee8a2';
  } else {
    statusDot.classList.remove('connected');
    connectionText.textContent = 'Disconnected';
    connectionText.style.color = '#666';
  }
}

updateConnectionStatus();

saveBtn.addEventListener('click', async () => {
  const relayUrl = relayInput.value.trim();
  const wsSecret = secretInput.value.trim();
  if (!relayUrl || !wsSecret) {
    statusDiv.innerHTML = '<span class="err">Enter both Relay URL and secret.</span>';
    return;
  }
  await chrome.storage.local.set({ relayUrl, wsSecret });
  statusDiv.innerHTML = '<span class="ok">✓ Saved! Connecting…</span>';
  try {
    await chrome.runtime.sendMessage({ type: 'CONNECT_WS' });
    statusDiv.innerHTML = '<span class="ok">✓ Connected to relay!</span>';
    updateConnectionStatus();
  } catch (e) {
    statusDiv.innerHTML = '<span class="err">Failed to connect: ' + e.message + '</span>';
  }
});

// Check status periodically
setInterval(updateConnectionStatus, 2000);
