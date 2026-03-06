// relay/src/routes/jobs.ts
import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import { hub } from "../ws/hub";
import { Job, CreateJobRequest } from "../types";
import { handleFileUpload, getUploadedFile } from "../middleware/upload";

// Platform integrations
import { uploadToDrive } from "../platforms/google-drive";
import { sendGmail, saveDraft } from "../platforms/gmail";
import { sendProtonMail } from "../platforms/protonmail";
import { publishToSubstack } from "../platforms/substack";

export const jobsRouter = Router();

// In-memory store — swap for Redis on your stack if desired
const jobs = new Map<string, Job>();
const idempotencyIndex = new Map<string, string>();

// Auth middleware
jobsRouter.use((req: Request, res: Response, next) => {
  const key = req.headers["clawpost-api-key"];
  if (key !== process.env.CLAWPOST_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

// Handle file uploads
jobsRouter.use(handleFileUpload);

// POST /api/jobs — create a new post job
jobsRouter.post("/", async (req: Request, res: Response) => {
  const body = req.body as CreateJobRequest;
  const uploadedFiles = (req as any).uploadedFiles || [];

  if (!body.platform) {
    return res.status(400).json({ error: "platform is required" });
  }

  // For non-email platforms, text is required
  const emailPlatforms = ["gmail", "protonmail"];
  if (!emailPlatforms.includes(body.platform) && !body.text) {
    return res.status(400).json({ error: "text is required for this platform" });
  }

  // Idempotency check
  if (body.idempotencyKey && idempotencyIndex.has(body.idempotencyKey)) {
    const existingId = idempotencyIndex.get(body.idempotencyKey)!;
    return res.status(200).json(jobs.get(existingId));
  }

  const job: Job = {
    id: randomUUID(),
    platform: body.platform,
    text: body.text || "",
    mediaFiles: uploadedFiles,
    mediaUrls: body.mediaUrls,
    idempotencyKey: body.idempotencyKey,
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    metadata: body.metadata,
  };

  jobs.set(job.id, job);
  if (body.idempotencyKey) idempotencyIndex.set(body.idempotencyKey, job.id);

  // Platform-specific handling
  const apiPlatforms = ["gmail", "protonmail", "googledrive", "substack"];
  
  if (apiPlatforms.includes(body.platform)) {
    // Handle API-based platforms directly
    job.status = "dispatched";
    
    let result;
    switch (body.platform) {
      case "gmail":
        if (body.metadata?.draft) {
          result = await saveDraft(job);
        } else {
          result = await sendGmail(job);
        }
        break;
      case "protonmail":
        result = await sendProtonMail(job);
        break;
      case "googledrive":
        result = await uploadToDrive(job);
        break;
      case "substack":
        result = await publishToSubstack(job);
        break;
      default:
        result = { success: false, error: "Unknown platform" };
    }

    job.status = result.success ? "posted" : "failed";
    job.failureReason = result.error;
    job.updatedAt = Date.now();

    return res.status(201).json(job);
  }

  // Browser automation platforms (Twitter, LinkedIn, IG, TikTok, etc.)
  // Register result callback before dispatching
  hub.onResult(job.id, (success, reason) => {
    const j = jobs.get(job.id);
    if (!j) return;
    j.status = success ? "posted" : "failed";
    j.failureReason = reason;
    j.updatedAt = Date.now();
  });

  const dispatched = hub.dispatch(job);
  job.status = dispatched ? "dispatched" : "queued";

  return res.status(201).json(job);
});

// GET /api/jobs/:id — poll job status
jobsRouter.get("/:id", (req: Request, res: Response) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  return res.json(job);
});

// POST /api/jobs/:id/progress — update upload progress (from extension)
jobsRouter.post("/:id/progress", (req: Request, res: Response) => {
  const job = jobs.get(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });
  
  const { progress } = req.body;
  if (typeof progress === "number") {
    job.progress = progress;
    job.status = "uploading";
  }
  
  return res.json(job);
});

// GET /api/jobs/health/check
jobsRouter.get("/health/check", (_req: Request, res: Response) => {
  res.json({ 
    ok: true, 
    extensionsOnline: hub.connectedCount,
    platforms: {
      twitter: "browser",
      linkedin: "browser",
      instagram: "browser",
      tiktok: "browser",
      gmail: process.env.GOOGLE_ACCESS_TOKEN ? "api" : "not_configured",
      googledrive: process.env.GOOGLE_ACCESS_TOKEN ? "api" : "not_configured",
      protonmail: process.env.PROTONMAIL_USERNAME ? "smtp" : "not_configured",
      substack: process.env.SUBSTACK_COOKIE ? "api" : "not_configured",
    }
  });
});

// GET /auth/google — OAuth redirect
jobsRouter.get("/auth/google", (_req: Request, res: Response) => {
  const { getAuthUrl } = require("../platforms/google-drive");
  res.redirect(getAuthUrl());
});

// GET /auth/google/callback — OAuth callback
jobsRouter.get("/auth/google/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send("Authorization failed");
  }
  
  try {
    const { handleAuthCallback } = require("../platforms/google-drive");
    await handleAuthCallback(code);
    res.send("Authorization successful! You can close this tab.");
  } catch (error: any) {
    res.status(500).send(`Authorization failed: ${error.message}`);
  }
});
