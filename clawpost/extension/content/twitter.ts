// extension/content/twitter.ts
// Injected into x.com — uses existing logged-in session

(async () => {
  const job = (await chrome.storage.session.get("currentJob")).currentJob;
  if (!job || job.platform !== "twitter") return;

  async function waitFor(selector: string, timeout = 8000): Promise<Element> {
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
    // Click the tweet compose area (home timeline or dedicated compose)
    let composer = document.querySelector<HTMLElement>(
      '[data-testid="tweetTextarea_0"]'
    );

    if (!composer) {
      // Navigate to home if not on compose page
      const composeBtn = document.querySelector<HTMLElement>(
        '[data-testid="SideNav_NewTweet_Button"], [href="/compose/tweet"]'
      );
      composeBtn?.click();
      await sleep(800);
      composer = await waitFor('[data-testid="tweetTextarea_0"]') as HTMLElement;
    }

    // Focus and type text
    composer.focus();
    await sleep(100);

    // Use execCommand for reliable text insertion
    document.execCommand("insertText", false, job.text);
    await sleep(500);

    // Handle media if present
    if (job.mediaUrls?.length) {
      // Media upload requires fetching the blob — skip for now, log
      console.log("[clawpost] Media upload not yet implemented");
    }

    // Click Tweet/Post button
    const postBtn = await waitFor('[data-testid="tweetButtonInline"], [data-testid="tweetButton"]') as HTMLElement;
    postBtn.click();
    await sleep(1000);

    console.log("[clawpost] Tweet posted successfully");
  } catch (e: any) {
    console.error("[clawpost] Twitter post failed:", e.message);
    // Signal failure back through storage
    await chrome.storage.session.set({ jobError: e.message });
  }
})();
