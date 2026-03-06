// relay/src/types.ts

export type Platform = 
  | "twitter" 
  | "linkedin" 
  | "bluesky" 
  | "facebook"
  | "instagram"
  | "tiktok"
  | "substack"
  | "gmail"
  | "protonmail";

export type JobStatus = "queued" | "dispatched" | "posted" | "failed" | "uploading";

export interface MediaFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  url?: string; // URL after upload to storage
}

export interface Job {
  id: string;
  platform: Platform;
  text: string;
  mediaFiles?: MediaFile[];
  mediaUrls?: string[]; // External URLs
  idempotencyKey?: string;
  status: JobStatus;
  failureReason?: string;
  progress?: number; // 0-100 for uploads
  createdAt: number;
  updatedAt: number;
  metadata?: {
    subject?: string; // For email platforms
    to?: string[];    // For email platforms
    cc?: string[];
    bcc?: string[];
    draft?: boolean;
    scheduledAt?: number;
    folderId?: string; // For Google Drive
    fileName?: string;
    isNewsletter?: boolean; // For Substack
    publishNow?: boolean;
  };
}

export interface CreateJobRequest {
  platform: Platform;
  text: string;
  mediaUrls?: string[];
  idempotencyKey?: string;
  metadata?: Job["metadata"];
}

export interface ExtensionMessage {
  type: "JOB" | "ACK" | "RESULT" | "PROGRESS";
  job?: Job;
  jobId?: string;
  success?: boolean;
  failureReason?: string;
  progress?: number;
}

// Platform-specific auth tokens
export interface PlatformAuth {
  google?: {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };
  protonmail?: {
    username: string;
    password: string; // Bridge password or app-specific
  };
  substack?: {
    cookie: string;
    publicationId: string;
  };
}
