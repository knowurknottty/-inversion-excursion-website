// relay/src/platforms/protonmail.ts
// ProtonMail integration via SMTP Bridge or ProtonMail API

import { Job } from "../types";
import * as nodemailer from "nodemailer";
import * as fs from "fs";

// ProtonMail Bridge SMTP configuration
// User must have ProtonMail Bridge running locally or use ProtonMail's beta API

interface ProtonMailConfig {
  host: string;      // typically 127.0.0.1 for Bridge
  port: number;      // 1025 for SMTP (no TLS) or 1143 for IMAP
  username: string;
  password: string;  // Bridge-specific password, not account password
}

export async function sendProtonMail(
  job: Job,
  config?: ProtonMailConfig
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const smtpConfig: ProtonMailConfig = config || {
      host: process.env.PROTONMAIL_SMTP_HOST || "127.0.0.1",
      port: parseInt(process.env.PROTONMAIL_SMTP_PORT || "1025"),
      username: process.env.PROTONMAIL_USERNAME || "",
      password: process.env.PROTONMAIL_PASSWORD || "",
    };

    if (!smtpConfig.username || !smtpConfig.password) {
      return { 
        success: false, 
        error: "ProtonMail credentials not configured. Set PROTONMAIL_USERNAME and PROTONMAIL_PASSWORD."
      };
    }

    const to = job.metadata?.to || [];
    const cc = job.metadata?.cc || [];
    const bcc = job.metadata?.bcc || [];
    const subject = job.metadata?.subject || "ClawPost Message";

    if (to.length === 0 && cc.length === 0 && bcc.length === 0) {
      return { success: false, error: "No recipients specified" };
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: false, // ProtonMail Bridge uses STARTTLS or no TLS on localhost
      auth: {
        user: smtpConfig.username,
        pass: smtpConfig.password,
      },
      tls: {
        rejectUnauthorized: false, // For local Bridge
      },
    });

    const attachments = job.mediaFiles
      ?.filter(f => f.url)
      .map(f => ({
        filename: f.originalName,
        contentType: f.mimeType,
        path: f.url!,
      }));

    const info = await transporter.sendMail({
      from: smtpConfig.username,
      to: to.join(", "),
      cc: cc.length ? cc.join(", ") : undefined,
      bcc: bcc.length ? bcc.join(", ") : undefined,
      subject,
      text: job.text,
      attachments,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("[protonmail] Send failed:", error);
    return { 
      success: false, 
      error: error.message + " (Is ProtonMail Bridge running?)"
    };
  }
}

// Alternative: ProtonMail API (beta, requires API key)
// https://proton.me/support/proton-mail-api
export async function sendViaProtonAPI(
  job: Job
): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.PROTONMAIL_API_KEY;
    if (!apiKey) {
      return { success: false, error: "PROTONMAIL_API_KEY not set" };
    }

    // ProtonMail API implementation would go here
    // This requires their beta API access
    return { success: false, error: "ProtonMail API integration not yet implemented. Use SMTP Bridge mode." };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
