import React from 'react';
import { ChatMessage } from '../../types/types';

interface MessageBubbleProps {
  message: ChatMessage;
  onConvert: (messageId: string, type: 'task' | 'note') => void;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onConvert, isOwn }) => {
  return (
    <div className={`relative group flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      {!isOwn && (
        <span className="text-xs text-white/40 mb-0.5 ml-1">{message.senderName}</span>
      )}

      <div
        className={`relative rounded-2xl px-3 py-2 max-w-[80%] text-sm ${
          isOwn
            ? 'bg-indigo-600/40 border border-indigo-400/20 text-white/85'
            : 'bg-white/5 border border-white/10 text-white/85'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>

        {message.linkedItemId ? (
          <span className="mt-1 text-xs bg-white/10 rounded-full px-2 py-0.5 text-white/60 inline-block">
            {message.linkedItemType === 'task' ? '📋 Task created' : '📝 Note created'}
          </span>
        ) : (
          <div className="mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => onConvert(message._id, 'task')}
              className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-2 py-0.5 text-white/50 hover:text-white/80 cursor-pointer transition-colors"
            >
              → Task
            </button>
            <button
              onClick={() => onConvert(message._id, 'note')}
              className="text-xs bg-white/10 hover:bg-white/20 rounded-full px-2 py-0.5 text-white/50 hover:text-white/80 cursor-pointer transition-colors"
            >
              → Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
