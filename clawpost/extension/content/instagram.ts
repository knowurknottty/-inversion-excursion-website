// extension/content/instagram.ts
// Injected into instagram.com — posts to feed or stories

(async () => {
  const job = (await chrome.storage.session.get("currentJob")).currentJob;
  if (!job || job.platform !== "instagram") return;

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

  async function clickNewPost() {
    // Look for "New post" button (the + icon or "Create" button)
    const newPostBtn = document.querySelector<HTMLElement>(
      '[aria-label="New post"], [aria-label="Create"], a[href="#"] svg[aria-label="New post"]'
    );
    
    if (newPostBtn) {
      newPostBtn.closest("a, button, div")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    } else {
      // Alternative: Navigate directly
      window.location.href = "https://www.instagram.com/create/select/";
    }
  }

  try {
    // Instagram has strict anti-automation, so we need to be careful
    // This is a basic implementation that may need updating
    
    await clickNewPost();
    await sleep(2000);

    // Wait for file input
    const fileInput = await waitFor('input[type="file"]') as HTMLInputElement;
    
    // For Instagram, we need to handle file upload via the file input
    // But Chrome extensions can't easily inject files due to security
    // We need to use a different approach - download and then upload
    
    if (job.mediaFiles && job.mediaFiles.length > 0) {
      // Notify user that manual upload is needed for IG
      // Or implement a more complex file handling system
      alert(`ClawPost: Please select the image manually. Looking for: ${job.mediaFiles[0].originalName}`);
      
      // Auto-fill caption
      await sleep(1000);
      const captionInput = document.querySelector<HTMLElement>(
        '[aria-label="Write a caption..."], textarea[placeholder*="caption"]'
      );
      
      if (captionInput) {
        captionInput.focus();
        await sleep(100);
        document.execCommand("insertText", false, job.text);
      }
    } else {
      // Just text - but Instagram requires media, so this will fail
      throw new Error("Instagram requires at least one image or video");
    }

    console.log("[clawpost] Instagram post prepared - manual confirmation needed");
    
  } catch (e: any) {
    console.error("[clawpost] Instagram post failed:", e.message);
    await chrome.storage.session.set({ jobError: e.message });
  }
})();
