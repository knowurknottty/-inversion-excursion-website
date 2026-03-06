// relay/src/platforms/google-drive.ts
import { google, drive_v3 } from "googleapis";
import { Job, MediaFile } from "../types";
import * as fs from "fs";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:4747/auth/google/callback"
);

// Set credentials if available
if (process.env.GOOGLE_ACCESS_TOKEN) {
  oauth2Client.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
}

const drive = google.drive({ version: "v3", auth: oauth2Client });

export async function uploadToDrive(
  job: Job
): Promise<{ success: boolean; error?: string; fileId?: string; webViewLink?: string }> {
  try {
    if (!job.mediaFiles || job.mediaFiles.length === 0) {
      // Create a text document with the job text
      const fileMetadata: drive_v3.Schema$File = {
        name: job.metadata?.fileName || `ClawPost-${Date.now()}.txt`,
        mimeType: "text/plain",
        parents: job.metadata?.folderId ? [job.metadata.folderId] : undefined,
      };

      const media = {
        mimeType: "text/plain",
        body: job.text,
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink",
      });

      return {
        success: true,
        fileId: response.data.id!,
        webViewLink: response.data.webViewLink!,
      };
    }

    // Upload file(s)
    const uploadedFiles: string[] = [];
    
    for (const mediaFile of job.mediaFiles) {
      if (!mediaFile.url) continue;

      const fileMetadata: drive_v3.Schema$File = {
        name: mediaFile.originalName,
        parents: job.metadata?.folderId ? [job.metadata.folderId] : undefined,
      };

      const media = {
        mimeType: mediaFile.mimeType,
        body: fs.createReadStream(mediaFile.url),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink",
      });

      uploadedFiles.push(response.data.id!);
    }

    return {
      success: true,
      fileId: uploadedFiles[0],
      webViewLink: `https://drive.google.com/file/d/${uploadedFiles[0]}/view`,
    };
  } catch (error: any) {
    console.error("[google-drive] Upload failed:", error);
    return { success: false, error: error.message };
  }
}

export function getAuthUrl(): string {
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/gmail.send",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
  });
}

export async function handleAuthCallback(code: string): Promise<void> {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  
  // In production, store these securely
  console.log("[google] Access token:", tokens.access_token);
  console.log("[google] Refresh token:", tokens.refresh_token);
}
