'use client';

import React, { createContext, useRef, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(
  undefined
);

export const useSocket = () => {
  const context = React.useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context.socket;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);

  if (!socketRef.current) {
    try {
      // Use explicit socket server URL (separate Express server on port 5001)
      // Falls back gracefully if the server is not running
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
      const socket = io(socketUrl, {
        withCredentials: true,
        autoConnect: false,
        reconnectionAttempts: 3,
        timeout: 5000,
      });

      socket.on('connect_error', () => {
        // Suppress connection errors when Express server is not running
      });

      socket.connect();
      socketRef.current = socket;
    } catch {
      // Socket initialization failed; context provides null socket
      socketRef.current = null;
    }
  }

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
