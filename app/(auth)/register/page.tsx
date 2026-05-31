'use client';

import React from 'react';
import Register from '@/components/auth/Register';

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-white/60">Join Task Manager today</p>
      </div>
      <Register />
    </div>
  );
}
