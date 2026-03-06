// relay/src/platforms/substack.ts
import { Job } from "../types";

interface SubstackConfig {
  publicationId: string;
  cookie: string;
}

export async function publishToSubstack(
  job: Job
): Promise<{ success: boolean; error?: string; postUrl?: string; postId?: string }> {
  try {
    const config: SubstackConfig = {
      publicationId: process.env.SUBSTACK_PUBLICATION_ID || job.metadata?.folderId || "",
      cookie: process.env.SUBSTACK_COOKIE || "",
    };

    if (!config.publicationId || !config.cookie) {
      return {
        success: false,
        error: "Substack not configured. Set SUBSTACK_PUBLICATION_ID and SUBSTACK_COOKIE.",
      };
    }

    // Substack doesn't have an official API for posting
    // We use their internal API endpoints (undocumented, may break)
    // Alternative: Use their import API or email-to-post feature

    const isNewsletter = job.metadata?.isNewsletter ?? true;
    const publishNow = job.metadata?.publishNow ?? false;

    // Create draft via Substack's API
    const response = await fetch("https://substack.com/api/v1/drafts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": config.cookie,
      },
      body: JSON.stringify({
        publication_id: config.publicationId,
        title: job.metadata?.subject || "New Post",
        body: job.text,
        draft_publication_ids: [config.publicationId],
        type: isNewsletter ? "newsletter" : "thread",
        // If media files, we need to upload them first
        cover_image: job.mediaFiles?.[0]?.url || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Substack API error: ${error}`);
    }

    const data = await response.json();

    // If publishNow, publish the draft
    if (publishNow && data.id) {
      const publishResponse = await fetch(`https://substack.com/api/v1/drafts/${data.id}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": config.cookie,
        },
        body: JSON.stringify({
          publication_id: config.publicationId,
        }),
      });

      if (!publishResponse.ok) {
        console.warn("[substack] Draft created but publish failed");
      }
    }

    return {
      success: true,
      postId: data.id,
      postUrl: `https://substack.com/home/post/${data.id}`,
    };
  } catch (error: any) {
    console.error("[substack] Publish failed:", error);
    return { success: false, error: error.message };
  }
}

// Alternative: Email-to-post method
// Many Substack publications support posting via email
export async function publishViaEmail(
  job: Job,
  postEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // This would use the Gmail/ProtonMail integration to send to the post email
    // Format: your-post@substack.com
    return {
      success: false,
      error: "Email-to-post method requires email integration. Use publishToSubstack instead.",
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
