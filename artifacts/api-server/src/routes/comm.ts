import { Router, type Request, type Response } from "express";

interface ConnectedPeer {
  id: string;
  alias: string;
  res: Response;
  lastSeen: number;
}

const router = Router();
const activePeers = new Map<string, ConnectedPeer>();

function broadcastPresence() {
  const peerList = Array.from(activePeers.values()).map(p => ({
    id: p.id,
    alias: p.alias,
    online_at: new Date(p.lastSeen).toISOString(),
  }));

  const data = JSON.stringify({ type: "presence_sync", peers: peerList });
  for (const peer of activePeers.values()) {
    try {
      peer.res.write(`data: ${data}\n\n`);
    } catch (_) {
      // client may have disconnected
    }
  }
}

// Prune stale peers every 30 seconds
setInterval(() => {
  const now = Date.now();
  let changed = false;
  for (const [id, peer] of activePeers.entries()) {
    if (now - peer.lastSeen > 45000) {
      activePeers.delete(id);
      changed = true;
    }
  }
  if (changed) {
    broadcastPresence();
  }
}, 15000);

// SSE connection for real-time presence and signaling
router.get("/comm/stream", (req: Request, res: Response) => {
  const peerId = (req.query.peerId as string) || "";
  const alias = (req.query.alias as string) || "Anonymous";

  if (!peerId) {
    res.status(400).json({ error: "peerId is required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Register peer
  activePeers.set(peerId, {
    id: peerId,
    alias,
    res,
    lastSeen: Date.now(),
  });

  // Keep-alive heartbeat
  const keepAlive = setInterval(() => {
    try {
      res.write(": keepalive\n\n");
    } catch (_) {
      clearInterval(keepAlive);
    }
  }, 15000);

  // Broadcast presence to all peers
  broadcastPresence();

  req.on("close", () => {
    clearInterval(keepAlive);
    activePeers.delete(peerId);
    broadcastPresence();
  });
});

// Broadcast or direct signal (WebRTC, chat message, file chunk)
router.post("/comm/signal", (req: Request, res: Response) => {
  const { from, to, event, payload } = req.body as {
    from: string;
    to?: string;
    event: string;
    payload: any;
  };

  if (!from || !event) {
    res.status(400).json({ error: "from and event are required" });
    return;
  }

  // Update last seen
  const sender = activePeers.get(from);
  if (sender) {
    sender.lastSeen = Date.now();
  }

  const messageData = JSON.stringify({
    type: "broadcast",
    event,
    payload,
  });

  if (to && to !== "*") {
    // Direct signal to specific peer
    const targetPeer = activePeers.get(to);
    if (targetPeer) {
      try {
        targetPeer.res.write(`data: ${messageData}\n\n`);
      } catch (_) {
        activePeers.delete(to);
      }
    }
  } else {
    // Broadcast to all other peers
    for (const [id, peer] of activePeers.entries()) {
      if (id !== from) {
        try {
          peer.res.write(`data: ${messageData}\n\n`);
        } catch (_) {
          activePeers.delete(id);
        }
      }
    }
  }

  res.json({ ok: true });
});

// Presence heartbeat
router.post("/comm/heartbeat", (req: Request, res: Response) => {
  const { peerId, alias } = req.body as { peerId: string; alias?: string };
  if (peerId) {
    const peer = activePeers.get(peerId);
    if (peer) {
      peer.lastSeen = Date.now();
      if (alias) peer.alias = alias;
    }
  }
  res.json({ ok: true });
});

// Get currently online peers
router.get("/comm/peers", (_req: Request, res: Response) => {
  const peerList = Array.from(activePeers.values()).map(p => ({
    id: p.id,
    alias: p.alias,
    online_at: new Date(p.lastSeen).toISOString(),
  }));
  res.json({ peers: peerList });
});

export default router;
