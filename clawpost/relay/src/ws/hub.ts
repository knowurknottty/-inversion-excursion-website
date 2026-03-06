// relay/src/ws/hub.ts
import { WebSocketServer, WebSocket } from "ws";
import { Job, ExtensionMessage } from "../types";

interface ExtensionClient {
  ws: WebSocket;
  pairedAt: number;
}

class ExtensionHub {
  private clients = new Map<string, ExtensionClient>(); // extensionId → client
  private pendingJobs = new Map<string, Job>();          // jobId → job

  register(extensionId: string, ws: WebSocket) {
    this.clients.set(extensionId, { ws, pairedAt: Date.now() });
    console.log(`[hub] Extension paired: ${extensionId}`);

    ws.on("message", (raw) => {
      try {
        const msg: ExtensionMessage = JSON.parse(raw.toString());
        if (msg.type === "RESULT" && msg.jobId) {
          this.handleResult(msg);
        }
      } catch {}
    });

    ws.on("close", () => {
      this.clients.delete(extensionId);
      console.log(`[hub] Extension disconnected: ${extensionId}`);
    });

    // Flush any queued jobs to newly connected extension
    this.pendingJobs.forEach((job) => this.dispatch(job));
  }

  dispatch(job: Job): boolean {
    // Send to first available connected extension
    for (const [, client] of this.clients) {
      if (client.ws.readyState === WebSocket.OPEN) {
        const msg: ExtensionMessage = { type: "JOB", job };
        client.ws.send(JSON.stringify(msg));
        this.pendingJobs.delete(job.id);
        return true;
      }
    }
    // No extension online — queue it
    this.pendingJobs.set(job.id, job);
    return false;
  }

  private handleResult(msg: ExtensionMessage) {
    // Relay stores result — jobs route reads it via callbacks
    if (this.resultCallbacks.has(msg.jobId!)) {
      this.resultCallbacks.get(msg.jobId!)!(msg.success!, msg.failureReason);
      this.resultCallbacks.delete(msg.jobId!);
    }
  }

  private resultCallbacks = new Map<
    string,
    (success: boolean, reason?: string) => void
  >();

  onResult(jobId: string, cb: (success: boolean, reason?: string) => void) {
    this.resultCallbacks.set(jobId, cb);
  }

  get connectedCount() {
    return [...this.clients.values()].filter(
      (c) => c.ws.readyState === WebSocket.OPEN
    ).length;
  }
}

export const hub = new ExtensionHub();
