// relay/src/index.ts
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import * as path from "path";
import { jobsRouter } from "./routes/jobs";
import { hub } from "./ws/hub";
import { getFilePath } from "./middleware/upload";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files
app.get("/api/files/:id", (req, res) => {
  const filePath = getFilePath(req.params.id);
  if (!filePath) {
    return res.status(404).json({ error: "File not found" });
  }
  res.sendFile(path.resolve(filePath));
});

// Jobs API
app.use("/api/jobs", jobsRouter);

const server = createServer(app);

// WebSocket server for Chrome extension connections
const wss = new WebSocketServer({ server, path: "/ws/extension" });

wss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const extensionId = url.searchParams.get("extensionId");
  const secret = url.searchParams.get("secret");

  if (secret !== process.env.CLAWPOST_WS_SECRET || !extensionId) {
    ws.close(4001, "Unauthorized");
    return;
  }

  hub.register(extensionId, ws);
});

const PORT = process.env.PORT || 4747;
server.listen(PORT, "127.0.0.1", () => {
  console.log(`[relay] ClawPost relay running on 127.0.0.1:${PORT}`);
  console.log(`[relay] Environment check:`);
  console.log(`  - GOOGLE_ACCESS_TOKEN: ${process.env.GOOGLE_ACCESS_TOKEN ? "✓" : "✗"}`);
  console.log(`  - PROTONMAIL_USERNAME: ${process.env.PROTONMAIL_USERNAME ? "✓" : "✗"}`);
  console.log(`  - SUBSTACK_COOKIE: ${process.env.SUBSTACK_COOKIE ? "✓" : "✗"}`);
});
