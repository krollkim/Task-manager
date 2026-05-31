'use client';

import React from 'react';
import Login from '@/components/auth/Login';

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
        <p className="text-white/60">Welcome back to Task Manager</p>
      </div>
      <Login />
    </div>
  );
}
