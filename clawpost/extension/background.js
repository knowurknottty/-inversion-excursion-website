"use strict";
// extension/background.ts
// Service worker — maintains WS connection to relay, dispatches jobs
let ws = null;
let relayUrl = "";
let wsSecret = "";
let extensionId = "";
async function loadConfig() {
    const cfg = await chrome.storage.local.get([
        "relayUrl", "wsSecret", "extensionId"
    ]);
    relayUrl = cfg.relayUrl || "";
    wsSecret = cfg.wsSecret || "";
    extensionId = cfg.extensionId || crypto.randomUUID();
    await chrome.storage.local.set({ extensionId });
}
function connect() {
    if (!relayUrl || !wsSecret)
        return;
    const url = `${relayUrl.replace("http", "ws")}/ws/extension?extensionId=${extensionId}&secret=${wsSecret}`;
    ws = new WebSocket(url);
    ws.onopen = () => console.log("[bg] Connected to relay");
    ws.onclose = () => {
        console.log("[bg] Disconnected — reconnecting in 5s");
        setTimeout(connect, 5000);
    };
    ws.onmessage = async (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.type === "JOB" && msg.job) {
                await executeJob(msg.job);
            }
        }
        catch (e) {
            console.error("[bg] Message parse error", e);
        }
    };
}
async function executeJob(job) {
    const platformTabUrls = {
        twitter: "https://x.com",
        linkedin: "https://www.linkedin.com",
        bluesky: "https://bsky.app",
        instagram: "https://www.instagram.com",
        tiktok: "https://www.tiktok.com",
        facebook: "https://www.facebook.com",
    };
    const tabUrl = platformTabUrls[job.platform];
    if (!tabUrl) {
        sendResult(job.id, false, `Unsupported platform: ${job.platform}`);
        return;
    }
    // Check if we need to download media files first
    if (job.mediaFiles && job.mediaFiles.length > 0) {
        // Download files from relay to local storage
        for (let i = 0; i < job.mediaFiles.length; i++) {
            const file = job.mediaFiles[i];
            if (file.url && !file.localPath) {
                try {
                    const response = await fetch(`${relayUrl}/api/files/${file.id}`, {
                        headers: { "clawpost-api-key": "extension" }
                    });
                    if (response.ok) {
                        const blob = await response.blob();
                        // Store blob for content script to use
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        await new Promise((resolve) => { reader.onloadend = resolve; });
                        file.dataUrl = reader.result;
                    }
                }
                catch (e) {
                    console.error("[bg] Failed to download file:", e);
                }
            }
        }
    }
    // Find existing tab or open new one
    let [tab] = await chrome.tabs.query({ url: `${tabUrl}/*` });
    if (!tab) {
        tab = await chrome.tabs.create({ url: tabUrl, active: false });
        // Wait for tab to load
        await new Promise((resolve) => {
            chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                if (tabId === tab.id && info.status === "complete") {
                    chrome.tabs.onUpdated.removeListener(listener);
                    resolve();
                }
            });
        });
    }
    // Inject content script with job payload
    const contentScript = `content/${job.platform === "facebook" ? "twitter" : job.platform}.js`;
    try {
        // Inject the content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [contentScript],
        });
        // Pass job data to content script via storage
        await chrome.storage.session.set({ currentJob: job });
        // Wait a bit for the content script to complete
        await new Promise(r => setTimeout(r, 5000));
        // Check for errors
        const result = await chrome.storage.session.get("jobError");
        if (result.jobError) {
            sendResult(job.id, false, result.jobError);
            await chrome.storage.session.remove("jobError");
        }
        else {
            sendResult(job.id, true);
        }
    }
    catch (e) {
        sendResult(job.id, false, e.message);
    }
}
function sendResult(jobId, success, reason) {
    ws?.send(JSON.stringify({ type: "RESULT", jobId, success, failureReason: reason }));
}
// Boot
loadConfig().then(connect);
// Reload config when storage changes (user re-pairs)
chrome.storage.onChanged.addListener((changes) => {
    if (changes.relayUrl || changes.wsSecret) {
        loadConfig().then(() => {
            ws?.close();
            connect();
        });
    }
});
