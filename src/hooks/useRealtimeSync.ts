import { useEffect, useRef, useState } from 'react';
import { YouthProfile } from '../types';
import { ToastMessage } from '../components/LiveToast';

interface Props {
  onLiveUpdate: (newYouthList: YouthProfile[], event: ToastMessage) => void;
  onInitialSync?: (youthList: YouthProfile[]) => void;
}

export function useRealtimeSync({ onLiveUpdate, onInitialSync }: Props) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: any;

    function connect() {
      try {
        ws = new WebSocket('ws://localhost:3001');
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[Realtime] WebSocket connected to backend');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'LIVE_EVENT' && data.youthList) {
              onLiveUpdate(data.youthList, data.event);
            }
          } catch (err) {
            console.error('[Realtime] Error processing WS message:', err);
          }
        };

        ws.onclose = () => {
          console.log('[Realtime] WebSocket disconnected. Reconnecting in 3s...');
          setIsConnected(false);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          console.warn('[Realtime] WS error:', err);
          ws.close();
        };
      } catch (e) {
        console.warn('[Realtime] Connection failed, retrying in 3s...');
        reconnectTimeout = setTimeout(connect, 3000);
      }
    }

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { isConnected };
}
