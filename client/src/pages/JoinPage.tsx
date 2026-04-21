import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../components/auth/AuthContext';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
  withCredentials: true,
});

type State = 'loading' | 'valid' | 'accepting' | 'done' | 'invalid';

const JoinPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [state, setState] = useState<State>('loading');
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');

  // Validate the token on mount
  useEffect(() => {
    if (!token) { setState('invalid'); return; }
    api.get(`/teams/invite/${token}`)
      .then(({ data }) => {
        setInviteEmail(data.email);
        setState('valid');
      })
      .catch(() => {
        setState('invalid');
        setError('This invite link is invalid or has expired.');
      });
  }, [token]);

  // Auto-accept if the user is already logged in
  useEffect(() => {
    if (state === 'valid' && isAuthenticated) {
      setState('accepting');
      api.post(`/teams/invite/${token}/accept`)
        .then(() => {
          setState('done');
          setTimeout(() => navigate('/dashboard'), 1500);
        })
        .catch(() => {
          setError('Failed to accept the invite. Please try again.');
          setState('valid');
        });
    }
  }, [state, isAuthenticated, token, navigate]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0a0e1c 0%, #111827 100%)' }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
        }}
        className="w-full max-w-sm p-8 text-center"
      >
        {state === 'loading' && (
          <>
            <p className="text-white/60 text-sm animate-pulse">Validating invite…</p>
          </>
        )}

        {state === 'invalid' && (
          <>
            <p className="text-2xl mb-3">⚠️</p>
            <p className="text-white/80 font-medium mb-1">Invalid invite</p>
            <p className="text-white/40 text-sm">{error || 'This link is no longer valid.'}</p>
          </>
        )}

        {(state === 'valid' || state === 'accepting') && !isAuthenticated && (
          <>
            <p className="text-2xl mb-3">👋</p>
            <p className="text-white/80 font-semibold text-lg mb-1">You're invited!</p>
            <p className="text-white/45 text-sm mb-6">
              Join the workspace as{' '}
              <span className="text-white/70 font-medium">{inviteEmail}</span>
            </p>
            <button
              onClick={() => navigate(`/register?inviteToken=${token}&email=${encodeURIComponent(inviteEmail)}`)}
              className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
              style={{ background: 'rgba(99,102,241,0.7)' }}
            >
              Create account & join
            </button>
            <button
              onClick={() => navigate(`/login?redirect=/join/${token}`)}
              className="w-full mt-2 py-2.5 rounded-xl text-sm text-white/50 hover:text-white/80 transition-colors"
            >
              Already have an account? Sign in
            </button>
          </>
        )}

        {state === 'accepting' && isAuthenticated && (
          <>
            <p className="text-white/60 text-sm animate-pulse">Joining workspace…</p>
          </>
        )}

        {state === 'done' && (
          <>
            <p className="text-2xl mb-3">✅</p>
            <p className="text-white/80 font-medium mb-1">You've joined!</p>
            <p className="text-white/40 text-sm">Redirecting to dashboard…</p>
          </>
        )}
      </div>
    </div>
  );
};

export default JoinPage;
