// relay/src/middleware/upload.ts
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { MediaFile } from "../types";
import * as fs from "fs";
import * as path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// In-memory storage for uploaded files (replace with S3/MinIO for production)
const fileStorage = new Map<string, MediaFile>();

export async function handleFileUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Simple base64 file upload handler for JSON payloads
  try {
    if (req.body.files && Array.isArray(req.body.files)) {
      const files: MediaFile[] = [];
      
      for (const fileData of req.body.files) {
        if (fileData.base64 && fileData.name) {
          const buffer = Buffer.from(fileData.base64, "base64");
          const id = randomUUID();
          const filePath = path.join(UPLOAD_DIR, `${id}-${fileData.name}`);
          
          fs.writeFileSync(filePath, buffer);
          
          const mediaFile: MediaFile = {
            id,
            originalName: fileData.name,
            mimeType: fileData.type || "application/octet-stream",
            size: buffer.length,
            buffer,
            url: filePath,
          };
          
          files.push(mediaFile);
          fileStorage.set(id, mediaFile);
        }
      }
      
      (req as any).uploadedFiles = files;
    }
    
    next();
  } catch (error) {
    res.status(400).json({ error: "Failed to process file upload" });
  }
}

// Get file by ID
export function getUploadedFile(id: string): MediaFile | undefined {
  return fileStorage.get(id);
}

// Get file by path
export function getFilePath(id: string): string | undefined {
  const file = fileStorage.get(id);
  return file?.url;
}
