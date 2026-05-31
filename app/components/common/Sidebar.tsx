'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const sidebarItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Tasks', href: '/tasks', icon: '✓' },
    { label: 'Calendar', href: '/calendar', icon: '📅' },
    { label: 'Chat', href: '/chat', icon: '💬' },
    { label: 'Settings', href: '/settings', icon: '⚙️' },
  ];

  return (
    <aside className="h-full pro-sidebar-gradient pro-shadow flex flex-col">
      {/* Logo/Branding */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="text-white font-bold text-xl hover:text-white/80 transition-colors">
          📋 Task Manager
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white border border-purple-400/50'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - User & Logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">User Name</p>
            <p className="text-white/40 text-xs truncate">user@example.com</p>
          </div>
        </div>

        <button className="w-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium text-left">
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
