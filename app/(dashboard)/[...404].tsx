'use client';

import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* 404 Title */}
      <div className="text-center mb-8">
        <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-white/60 text-lg max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
      </div>

      {/* Suggested Links */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          Back to Dashboard
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:bg-white/10 transition-all duration-200 transform hover:scale-105"
        >
          Back to Home
        </Link>
      </div>

      {/* Decorative element */}
      <div className="mt-12 opacity-30">
        <svg
          className="w-32 h-32 text-white/20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
    </div>
  );
}
