import http from 'http';
import { Request, Response } from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { RealtimeEvent, RealtimeEventType } from '../types';

let wss: WebSocketServer | null = null;
const sseClients = new Set<Response>();

export function initRealtimeServer(server: http.Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req) => {
    // Send immediate initial sync
    const initEvent: RealtimeEvent = {
      type: 'init',
      payload: {
        onlineCount: getOnlineUsersCount(),
        connectedAt: Date.now(),
        mode: 'websocket',
      },
      timestamp: Date.now(),
    };
    ws.send(JSON.stringify(initEvent));

    // Broadcast presence update
    broadcastRealtimeEvent('presence:update', {
      onlineCount: getOnlineUsersCount(),
    });

    // Heartbeat ping-pong
    (ws as any).isAlive = true;
    ws.on('pong', () => {
      (ws as any).isAlive = true;
    });

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
        }
      } catch (e) {}
    });

    ws.on('close', () => {
      broadcastRealtimeEvent('presence:update', {
        onlineCount: getOnlineUsersCount(),
      });
    });

    ws.on('error', (err) => {
      console.warn('WebSocket client error:', err.message);
    });
  });

  // Keep-alive heartbeat interval
  const interval = setInterval(() => {
    if (!wss) return;
    wss.clients.forEach((ws) => {
      const extWs = ws as any;
      if (extWs.isAlive === false) {
        return ws.terminate();
      }
      extWs.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  console.log('⚡ Realtime WebSocket & Event Engine initialized on /ws');
  return wss;
}

export function getOnlineUsersCount(): number {
  const wsCount = wss ? wss.clients.size : 0;
  const sseCount = sseClients.size;
  // Combine counts with a baseline minimum of 1
  return Math.max(1, wsCount + sseCount);
}

export function broadcastRealtimeEvent<T = any>(type: RealtimeEventType, payload: T): void {
  const event: RealtimeEvent<T> = {
    type,
    payload,
    timestamp: Date.now(),
  };

  const serialized = JSON.stringify(event);

  // 1. Broadcast to all active WebSockets
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(serialized);
        } catch (e) {
          console.warn('Error sending to websocket client:', e);
        }
      }
    });
  }

  // 2. Broadcast to all connected SSE clients (fallback/redundancy)
  sseClients.forEach((res) => {
    try {
      res.write(`data: ${serialized}\n\n`);
    } catch (e) {
      sseClients.delete(res);
    }
  });
}

// Server-Sent Events endpoint handler as resilient fallback
export function handleSseRoute(req: Request, res: Response): void {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write(': connected\n\n');

  sseClients.add(res);

  // Broadcast presence
  broadcastRealtimeEvent('presence:update', {
    onlineCount: getOnlineUsersCount(),
  });

  // Initial event
  const initPayload: RealtimeEvent = {
    type: 'init',
    payload: {
      onlineCount: getOnlineUsersCount(),
      connectedAt: Date.now(),
      mode: 'sse',
    },
    timestamp: Date.now(),
  };
  res.write(`data: ${JSON.stringify(initPayload)}\n\n`);

  req.on('close', () => {
    sseClients.delete(res);
    broadcastRealtimeEvent('presence:update', {
      onlineCount: getOnlineUsersCount(),
    });
  });
}
