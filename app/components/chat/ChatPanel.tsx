'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import MessageBubble from './MessageBubble';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROOM_ID = 'general';

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const socket = useSocket();
  const { user } = useAuth();
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    // Listen for messages
    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for history
    socket.on('history', (msgs) => {
      setHistory(msgs);
      setMessages(msgs);
    });

    return () => {
      if (typeof socket.off === 'function') {
        socket.off('message');
        socket.off('history');
      }
    };
  }, [socket]);

  useEffect(() => {
    if (isOpen && socket && typeof socket.emit === 'function') {
      // Request message history for the room
      socket.emit('getHistory', ROOM_ID);
    }
  }, [isOpen, socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || !socket) return;

    // Emit message to server
    socket.emit('message', {
      room: ROOM_ID,
      text: trimmed,
      senderName: user?.name || user?.email || 'Anonymous',
      senderId: user?.id || '',
    });

    setInputText('');
  };

  const handleConvert = (messageId: string, type: 'task' | 'note') => {
    if (!socket) return;

    socket.emit('chat:convert', {
      messageId,
      type,
      room: ROOM_ID,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const currentUserId = user?.id ?? '';

  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        background: 'rgba(10,14,28,0.95)',
        backdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
        <span className="text-sm font-semibold text-white/80">Team Chat</span>
        <button
          onClick={onClose}
          className="text-white/40 hover:text-white/80 transition-colors"
          aria-label="Close chat"
        >
          ×
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            onConvert={handleConvert}
            isOwn={msg.senderId === currentUserId}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <div className="px-4 py-3 border-t border-white/[0.08] flex gap-2">
        <textarea
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder-white/20 resize-none focus:outline-none focus:border-white/20"
          rows={1}
          placeholder="Message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSend}
          className="px-3 py-2 bg-indigo-600/60 hover:bg-indigo-600/80 text-white/80 rounded-xl text-sm transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatPanel;
