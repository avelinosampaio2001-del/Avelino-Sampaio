import { useState, useEffect } from 'react';
import { realtimeClient } from '../services/realtimeClient';
import { RealtimeEvent, RealtimeEventType } from '../types';

export function useRealtime() {
  const [status, setStatus] = useState(() => realtimeClient.getStatus());
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);

  useEffect(() => {
    // Subscribe to all events to keep track of connection status and last event
    const unsubscribe = realtimeClient.subscribe('*', (event) => {
      setLastEvent(event);
      setStatus(realtimeClient.getStatus());
    });

    // Check status periodically
    const timer = setInterval(() => {
      setStatus(realtimeClient.getStatus());
    }, 4000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  return {
    isConnected: status.isConnected,
    mode: status.mode,
    onlineCount: status.onlineCount,
    lastEvent,
    subscribe: realtimeClient.subscribe.bind(realtimeClient),
  };
}
