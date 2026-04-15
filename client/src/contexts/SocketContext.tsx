import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, PresenceUser } from '../types/types';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface SocketContextValue {
  onlineUsers: PresenceUser[];
  messages: ChatMessage[];
  sendMessage: (roomId: string, text: string) => void;
  convertMessage: (messageId: string, type: 'task' | 'note') => void;
  fetchHistory: (roomId: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socket = io(SERVER_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on('presence:list', (users: PresenceUser[]) => setOnlineUsers(users));
    socket.on('presence:join', (user: PresenceUser) =>
      setOnlineUsers(prev => prev.some(u => u.userId === user.userId) ? prev : [...prev, user])
    );
    socket.on('presence:leave', ({ userId }: { userId: string }) =>
      setOnlineUsers(prev => prev.filter(u => u.userId !== userId))
    );
    socket.on('chat:message', (msg: ChatMessage) =>
      setMessages(prev => [...prev, msg])
    );
    socket.on('task:converted', ({ messageId, item, itemType }: { messageId: string; item: { _id: string }; itemType: string }) =>
      setMessages(prev => prev.map(m =>
        m._id === messageId
          ? { ...m, linkedItemId: item._id, linkedItemType: itemType as ChatMessage['linkedItemType'] }
          : m
      ))
    );

    return () => { socket.disconnect(); };
  }, []);

  const sendMessage = (roomId: string, text: string) => socketRef.current?.emit('chat:send', { roomId, text });
  const convertMessage = (messageId: string, type: 'task' | 'note') => socketRef.current?.emit('chat:convert', { messageId, type });
  const fetchHistory = async (roomId: string) => {
    try {
      const res = await fetch(`${SERVER_URL}/messages?roomId=${roomId}&limit=50`, { credentials: 'include' });
      const data: ChatMessage[] = await res.json();
      setMessages(data);
    } catch {
      // History fetch failures are non-critical; silently ignore
    }
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
