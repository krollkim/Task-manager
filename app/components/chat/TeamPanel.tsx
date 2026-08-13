'use client';

import React, { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface TeamPanelProps {
  onOpenChat: () => void;
}

const MAX_VISIBLE_AVATARS = 5;

const TeamPanel: React.FC<TeamPanelProps> = ({ onOpenChat }) => {
  const socket = useSocket();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [inviteLink, setInviteLink] = useState('');

  React.useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;

    // Listen for online users updates
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    // Listen for presence changes
    socket.on('userOnline', (user) => {
      setOnlineUsers((prev) => {
        const exists = prev.some((u) => u.userId === user.userId);
        return exists ? prev : [...prev, user];
      });
    });

    socket.on('userOffline', (userId) => {
      setOnlineUsers((prev) => prev.filter((u) => u.userId !== userId));
    });

    return () => {
      if (typeof socket.off === 'function') {
        socket.off('onlineUsers');
        socket.off('userOnline');
        socket.off('userOffline');
      }
    };
  }, [socket]);

  const visibleUsers = onlineUsers.slice(0, MAX_VISIBLE_AVATARS);
  const overflowCount = onlineUsers.length - MAX_VISIBLE_AVATARS;

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) return;
    setInviteStatus('loading');
    try {
      const response = await fetch('/api/teams/invite', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail }),
      });

      if (!response.ok) throw new Error('invite failed');

      const data = await response.json();
      setInviteLink(data.inviteUrl);
      setInviteStatus('success');
      setInviteEmail('');
    } catch {
      setInviteStatus('error');
    }
  };

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
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowInvite((v) => !v);
              setInviteStatus('idle');
              setInviteLink('');
            }}
            className="text-white/30 hover:text-white/60 transition-colors text-xs"
            aria-label="Invite teammate"
          >
            + Invite
          </button>
          <button
            onClick={onOpenChat}
            className="text-white/30 hover:text-white/60 transition-colors"
            aria-label="Open team chat"
          >
            💬
          </button>
        </div>
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {onlineUsers.length === 0 ? (
          <span className="text-xs text-white/25 italic">No one online</span>
        ) : (
          <>
            {visibleUsers.map((user) => (
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

      {/* Invite form */}
      {showInvite && (
        <div className="mt-2 flex flex-col gap-1.5">
          <input
            type="email"
            placeholder="teammate@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 placeholder-white/25 focus:outline-none focus:border-white/25 w-full"
          />
          <button
            onClick={handleInvite}
            disabled={inviteStatus === 'loading'}
            className="text-xs bg-indigo-600/50 hover:bg-indigo-600/70 text-white/80 rounded-lg px-2 py-1 transition-colors disabled:opacity-50"
          >
            {inviteStatus === 'loading' ? 'Sending...' : 'Send Invite'}
          </button>
          {inviteStatus === 'success' && inviteLink && (
            <p className="text-xs text-emerald-400/80 break-all">{inviteLink}</p>
          )}
          {inviteStatus === 'error' && (
            <p className="text-xs text-red-400/70">Failed. Check the email and try again.</p>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="mt-2 text-xs text-white/25">{onlineUsers.length} online</p>
    </div>
  );
};

export default TeamPanel;
