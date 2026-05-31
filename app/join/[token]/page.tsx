'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface JoinPageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function JoinPage({ params }: JoinPageProps) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { token } = resolvedParams;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processing invite...');

  useEffect(() => {
    const acceptInvite = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid invite link');
        return;
      }

      try {
        setStatus('loading');
        setMessage('Accepting invite...');

        const response = await fetch(`/api/teams/invite/${token}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Invite accepted! Redirecting...');
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          const error = await response.json();
          setStatus('error');
          setMessage(error.error || 'Failed to accept invite');
        }
      } catch (err) {
        setStatus('error');
        setMessage(
          err instanceof Error ? err.message : 'An error occurred'
        );
      }
    };

    acceptInvite();
  }, [token, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-4">Join Task Manager</h1>
        <div className="space-y-4">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
              <p className="text-white/70">{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <div className="text-4xl">✓</div>
              <p className="text-white">{message}</p>
            </>
          )}
          {status === 'error' && (
            <>
              <div className="text-4xl">✕</div>
              <p className="text-red-400">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Go Home
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
