import React from 'react';
import { useSocket } from '../../hooks/useSocket';

interface TeamPanelProps {
  onOpenChat: () => void;
}

const MAX_VISIBLE_AVATARS = 5;

const TeamPanel: React.FC<TeamPanelProps> = ({ onOpenChat }) => {
  const { onlineUsers } = useSocket();

  const visibleUsers = onlineUsers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = onlineUsers.length - MAX_VISIBLE_AVATARS;

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
      }}
      className="p-3 mb-3"
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-widest text-white/35">Team</span>
        <button
          onClick={onOpenChat}
          className="text-white/30 hover:text-white/60 transition-colors"
          aria-label="Open team chat"
        >
          💬
        </button>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {onlineUsers.length === 0 ? (
          <span className="text-xs text-white/25 italic">No one online</span>
        ) : (
          <>
            {visibleUsers.map(user => (
              <div key={user.userId} className="relative">
                <div className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center text-xs text-white font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
              </div>
            ))}
            {overflowCount > 0 && (
              <span className="text-xs text-white/40 ml-1">+{overflowCount}</span>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <p className="mt-2 text-xs text-white/25">{onlineUsers.length} online</p>
    </div>
  );
};

export default TeamPanel;
