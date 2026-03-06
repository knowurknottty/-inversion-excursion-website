"use strict";
// extension/popup.ts
document.addEventListener("DOMContentLoaded", async () => {
    const cfg = await chrome.storage.local.get(["relayUrl", "wsSecret", "extensionId"]);
    document.getElementById("relayUrl").value = cfg.relayUrl || "";
    document.getElementById("wsSecret").value = cfg.wsSecret || "";
    document.getElementById("save").addEventListener("click", async () => {
        const relayUrl = document.getElementById("relayUrl").value.trim();
        const wsSecret = document.getElementById("wsSecret").value.trim();
        const status = document.getElementById("status");
        if (!relayUrl || !wsSecret) {
            status.innerHTML = '<span class="err">Both fields required.</span>';
            return;
        }
        // Test connectivity before saving
        try {
            const res = await fetch(`${relayUrl}/api/jobs/health/check`, {
                headers: { "clawpost-api-key": "test" },
            });
            await chrome.storage.local.set({ relayUrl, wsSecret });
            status.innerHTML = `<span class="ok">✓ Paired. Extension ID: ${cfg.extensionId?.slice(0, 8)}...</span>`;
        }
        catch {
            status.innerHTML = `<span class="err">✗ Can't reach relay at ${relayUrl}</span>`;
        }
    });
});
