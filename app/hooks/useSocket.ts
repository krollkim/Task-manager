'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * useSocket Hook
 * Manages Socket.io connection for real-time features
 *
 * TODO: Ensure Socket.io server running on port 5001 (development)
 * or configure proper production URL
 *
 * Usage:
 * const socket = useSocket();
 * socket?.on('message', (data) => console.log(data));
 */

export function useSocket(): Socket | null {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Determine socket server URL
    const socketUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
        : process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

    // Create socket connection if not already connected
    if (!socketRef.current) {
      socketRef.current = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 2,
        timeout: 5000,
      });

      socketRef.current.on('connect', () => {
        setIsConnected(true);
      });

      socketRef.current.on('disconnect', () => {
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', () => {
        // Suppress — Express server may not be running (chat feature)
      });
    }

    // Cleanup on unmount
    return () => {
      // Note: Do NOT disconnect here if using a singleton pattern
      // The socket should persist across component remounts
    };
  }, []);

  return socketRef.current;
}

/**
 * Get the socket instance from context (if using SocketContext singleton)
 * TODO: Implement SocketContext provider
 */
export function useSocketContext(): Socket | null {
  // TODO: Implement with useContext(SocketContext)
  return null;
}
