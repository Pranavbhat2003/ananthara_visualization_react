import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection with auto-reconnect
 * Connects to the MCP server backend WebSocket
 */
const useWebSocket = (url = 'ws://localhost:8080') => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastMessage, setLastMessage] = useState(null);
  const [projectData, setProjectData] = useState(null);

  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const messageQueueRef = useRef([]);

  const maxReconnectAttempts = 10;
  const reconnectDelay = 3000;

  // Connect to WebSocket
  const connect = useCallback(() => {
    try {
      console.log('[WebSocket] Connecting to:', url);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;

        // Send client_ready message
        const readyMessage = {
          type: 'client_ready',
          data: {
            timestamp: Date.now()
          }
        };
        ws.send(JSON.stringify(readyMessage));

        // Process queued messages
        while (messageQueueRef.current.length > 0) {
          const queuedMessage = messageQueueRef.current.shift();
          ws.send(JSON.stringify(queuedMessage));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('[WebSocket] Message received:', message.type);
          setLastMessage(message);

          // Handle specific message types
          switch (message.type) {
            case 'project_initialized':
            case 'project_switched':
            case 'files_updated':
            case 'canvas_mode_ready':
              setProjectData(message.data);
              break;

            case 'page_added':
            case 'page_deleted':
            case 'page_renamed':
            case 'page_duplicated':
            case 'canvas_updated':
              // Update project data with new pages
              if (message.data?.pages) {
                setProjectData((prev) => ({
                  ...prev,
                  frontend_data: {
                    ...prev?.frontend_data,
                    pages: message.data.pages
                  },
                  currentPageId: message.data.currentPageId
                }));
              }
              break;

            case 'project_deleted':
              setProjectData(null);
              break;

            default:
              break;
          }
        } catch (error) {
          console.error('[WebSocket] Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('[WebSocket] Connection closed');
        setConnectionStatus('disconnected');
        wsRef.current = null;

        // Attempt to reconnect
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          console.log(`[WebSocket] Reconnecting... Attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);

          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionStatus('connecting');
            connect();
          }, reconnectDelay);
        } else {
          console.error('[WebSocket] Max reconnect attempts reached');
          setConnectionStatus('error');
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setConnectionStatus('error');
    }
  }, [url]);

  // Send message to WebSocket server
  const sendMessage = useCallback((type, data = {}) => {
    const message = { type, data };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('[WebSocket] Message sent:', type);
    } else {
      console.log('[WebSocket] Message queued:', type);
      messageQueueRef.current.push(message);
    }
  }, []);

  // Manual reconnect function
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectAttempts.current = 0;
    setConnectionStatus('connecting');
    connect();
  }, [connect]);

  // Connect on mount
  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    connectionStatus,
    projectData,
    lastMessage,
    sendMessage,
    reconnect
  };
};

export default useWebSocket;
