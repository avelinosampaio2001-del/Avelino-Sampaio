import { RealtimeEvent, RealtimeEventType } from '../types';

type EventCallback = (event: RealtimeEvent) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private sse: EventSource | null = null;
  private listeners: Map<RealtimeEventType | '*', Set<EventCallback>> = new Map();
  private reconnectTimeout: any = null;
  private reconnectAttempts = 0;
  private isExplicitlyClosed = false;
  private isConnected = false;
  private mode: 'websocket' | 'sse' | 'disconnected' = 'disconnected';
  private onlineCount = 1;

  constructor() {
    this.connect();
  }

  public connect(): void {
    if (typeof window === 'undefined') return;
    this.isExplicitlyClosed = false;

    // Try WebSocket first
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.cleanup();
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.mode = 'websocket';
        this.reconnectAttempts = 0;
        this.notify('init', {
          type: 'init',
          payload: { onlineCount: this.onlineCount, mode: 'websocket' },
          timestamp: Date.now(),
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data: RealtimeEvent = JSON.parse(event.data);
          if (data.type === 'presence:update' && data.payload?.onlineCount) {
            this.onlineCount = data.payload.onlineCount;
          }
          if (data.type === 'init' && data.payload?.onlineCount) {
            this.onlineCount = data.payload.onlineCount;
          }
          this.dispatch(data);
        } catch (e) {
          // ignore invalid ping/pong
        }
      };

      this.ws.onerror = () => {
        // If WebSocket fails (e.g. in some iframe environments), fallback to SSE
        if (!this.isConnected) {
          this.connectSseFallback();
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        if (!this.isExplicitlyClosed) {
          this.scheduleReconnect();
        }
      };
    } catch (e) {
      this.connectSseFallback();
    }
  }

  private connectSseFallback(): void {
    if (this.isExplicitlyClosed) return;
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    try {
      if (this.ws) {
        try { this.ws.close(); } catch (e) {}
        this.ws = null;
      }

      this.sse = new EventSource('/api/realtime/events');

      this.sse.onopen = () => {
        this.isConnected = true;
        this.mode = 'sse';
        this.reconnectAttempts = 0;
      };

      this.sse.onmessage = (e) => {
        try {
          const data: RealtimeEvent = JSON.parse(e.data);
          if (data.type === 'presence:update' && data.payload?.onlineCount) {
            this.onlineCount = data.payload.onlineCount;
          }
          if (data.type === 'init' && data.payload?.onlineCount) {
            this.onlineCount = data.payload.onlineCount;
          }
          this.dispatch(data);
        } catch (err) {}
      };

      this.sse.onerror = () => {
        this.isConnected = false;
        if (this.sse) {
          this.sse.close();
          this.sse = null;
        }
        this.scheduleReconnect();
      };
    } catch (err) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.isExplicitlyClosed) return;
    clearTimeout(this.reconnectTimeout);
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private dispatch(event: RealtimeEvent): void {
    this.notify(event.type, event);
    this.notify('*', event);
  }

  private notify(type: RealtimeEventType | '*', event: RealtimeEvent): void {
    const list = this.listeners.get(type);
    if (list) {
      list.forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          console.error('Error in realtime listener:', err);
        }
      });
    }
  }

  public subscribe(type: RealtimeEventType | '*', callback: EventCallback): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }

  public getStatus(): { isConnected: boolean; mode: 'websocket' | 'sse' | 'disconnected'; onlineCount: number } {
    return {
      isConnected: this.isConnected,
      mode: this.mode,
      onlineCount: this.onlineCount,
    };
  }

  public cleanup(): void {
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    if (this.sse) {
      try { this.sse.close(); } catch (e) {}
      this.sse = null;
    }
  }

  public destroy(): void {
    this.isExplicitlyClosed = true;
    clearTimeout(this.reconnectTimeout);
    this.cleanup();
    this.listeners.clear();
  }
}

export const realtimeClient = new RealtimeClient();
