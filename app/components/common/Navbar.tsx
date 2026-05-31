'use client';

import React from 'react';
import Link from 'next/link';

interface NavbarProps {
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export default function Navbar({ onSidebarToggle, isSidebarOpen }: NavbarProps) {
  return (
    <nav className="pro-sidebar-gradient pro-rounded-lg pro-shadow h-16 flex items-center justify-between px-4 md:px-6">
      {/* Left Section - Menu & Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onSidebarToggle}
          className="p-2 text-white hover:bg-white/10 transition-colors duration-200 rounded-lg md:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link href="/dashboard" className="text-white font-semibold text-lg hover:text-white/80 transition-colors">
          Task Manager
        </Link>
      </div>

      {/* Right Section - User Menu */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-white hover:bg-white/10 transition-colors duration-200 rounded-lg" aria-label="Search">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button className="p-2 text-white hover:bg-white/10 transition-colors duration-200 rounded-lg" aria-label="Notifications">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <button className="p-2 text-white hover:bg-white/10 transition-colors duration-200 rounded-full" aria-label="User menu">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
            U
          </div>
        </button>
      </div>
    </nav>
  );
}
