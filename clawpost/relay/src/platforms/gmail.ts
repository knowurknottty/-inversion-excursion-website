// relay/src/platforms/gmail.ts
import { google } from "googleapis";
import { Job } from "../types";
import * as fs from "fs";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:4747/auth/google/callback"
);

if (process.env.GOOGLE_ACCESS_TOKEN) {
  oauth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

function createEmailPayload(
  to: string[],
  cc: string[],
  bcc: string[],
  subject: string,
  body: string,
  attachments?: { filename: string; mimeType: string; path: string }[]
): string {
  const boundary = `clawpost_${Date.now()}`;
  
  let email = [
    `To: ${to.join(", ")}`,
    cc.length ? `Cc: ${cc.join(", ")}` : "",
    bcc.length ? `Bcc: ${bcc.join(", ")}` : "",
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    "",
    body,
    "",
  ].filter(Boolean).join("\r\n");

  // Add attachments
  if (attachments && attachments.length > 0) {
    for (const attachment of attachments) {
      const fileData = fs.readFileSync(attachment.path);
      const base64Data = fileData.toString("base64");
      
      email += [
        `--${boundary}`,
        `Content-Type: ${attachment.mimeType}`,
        `Content-Disposition: attachment; filename="${attachment.filename}"`,
        `Content-Transfer-Encoding: base64`,
        "",
        base64Data.match(/.{1,76}/g)?.join("\r\n") || base64Data,
        "",
      ].join("\r\n");
    }
  }

  email += `--${boundary}--`;
  
  // Base64url encode
  return Buffer.from(email)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function sendGmail(
  job: Job
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const to = job.metadata?.to || [];
    const cc = job.metadata?.cc || [];
    const bcc = job.metadata?.bcc || [];
    const subject = job.metadata?.subject || "ClawPost Message";
    
    if (to.length === 0 && cc.length === 0 && bcc.length === 0) {
      return { success: false, error: "No recipients specified" };
    }

    const attachments = job.mediaFiles
      ?.filter(f => f.url)
      .map(f => ({
        filename: f.originalName,
        mimeType: f.mimeType,
        path: f.url!,
      }));

    const raw = createEmailPayload(to, cc, bcc, subject, job.text, attachments);

    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });

    return {
      success: true,
      messageId: response.data.id!,
    };
  } catch (error: any) {
    console.error("[gmail] Send failed:", error);
    return { success: false, error: error.message };
  }
}

export async function saveDraft(
  job: Job
): Promise<{ success: boolean; error?: string; draftId?: string }> {
  try {
    const to = job.metadata?.to || [];
    const cc = job.metadata?.cc || [];
    const bcc = job.metadata?.bcc || [];
    const subject = job.metadata?.subject || "ClawPost Draft";

    const attachments = job.mediaFiles
      ?.filter(f => f.url)
      .map(f => ({
        filename: f.originalName,
        mimeType: f.mimeType,
        path: f.url!,
      }));

    const raw = createEmailPayload(to, cc, bcc, subject, job.text, attachments);

    const response = await gmail.users.drafts.create({
      userId: "me",
      requestBody: { message: { raw } },
    });

    return {
      success: true,
      draftId: response.data.id!,
    };
  } catch (error: any) {
    console.error("[gmail] Draft save failed:", error);
    return { success: false, error: error.message };
  }
}
