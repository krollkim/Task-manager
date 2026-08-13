'use client';

import React, { createContext, useContext, useState } from 'react';
import { ChatMessage, PresenceUser } from '@/types/types';

interface SocketContextValue {
  onlineUsers: PresenceUser[];
  messages: ChatMessage[];
  sendMessage: (roomId: string, text: string) => void;
  convertMessage: (messageId: string, type: 'task' | 'note') => void;
  fetchHistory: (roomId: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onlineUsers] = useState<PresenceUser[]>([]);
  const [messages] = useState<ChatMessage[]>([]);

  const sendMessage = () => {
    // Socket.io server implementation deferred to Phase 4
  };
  const convertMessage = () => {
    // Socket.io server implementation deferred to Phase 4
  };
  const fetchHistory = async () => {
    // Socket.io server implementation deferred to Phase 4
  };

  return (
    <SocketContext.Provider value={{ onlineUsers, messages, sendMessage, convertMessage, fetchHistory }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextValue => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};
