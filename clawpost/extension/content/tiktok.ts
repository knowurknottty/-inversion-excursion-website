// extension/content/tiktok.ts
// Injected into tiktok.com — uploads videos

(async () => {
  const job = (await chrome.storage.session.get("currentJob")).currentJob;
  if (!job || job.platform !== "tiktok") return;

  async function waitFor(selector: string, timeout = 10000): Promise<Element> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await new Promise((r) => setTimeout(r, 200));
    }
    throw new Error(`Timeout waiting for ${selector}`);
  }

  async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  try {
    // Navigate to upload page
    if (!window.location.href.includes("/upload")) {
      window.location.href = "https://www.tiktok.com/upload";
      return; // Page will reload, content script will re-run
    }

    await sleep(3000);

    // Wait for upload button or drag-drop area
    const uploadArea = await waitFor(
      '[data-e2e="upload-video"], .upload-btn, input[type="file"]'
    );

    // TikTok requires video files - can't post text-only
    if (!job.mediaFiles || job.mediaFiles.length === 0) {
      throw new Error("TikTok requires a video file");
    }

    // File upload automation is difficult due to security restrictions
    // We'll guide the user
    alert(`ClawPost: Please select the video file: ${job.mediaFiles[0].originalName}`);

    // Auto-fill caption
    await sleep(1000);
    const captionInput = await waitFor(
      '[data-e2e="upload-caption-input"], textarea[placeholder*="caption"], div[contenteditable="true"]'
    ) as HTMLElement;

    if (captionInput) {
      captionInput.focus();
      await sleep(100);
      document.execCommand("insertText", false, job.text);
    }

    console.log("[clawpost] TikTok upload prepared - manual confirmation needed");
    
  } catch (e: any) {
    console.error("[clawpost] TikTok upload failed:", e.message);
    await chrome.storage.session.set({ jobError: e.message });
  }
})();
