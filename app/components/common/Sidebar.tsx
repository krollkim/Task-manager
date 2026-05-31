'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarUser {
  name?: string;
  email?: string;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  onClose?: () => void;
  onLogout?: () => void;
  isMobile?: boolean;
  currentUser?: SidebarUser;
}

export default function Sidebar({
  activeItem,
  onItemClick,
  onClose,
  onLogout,
  isMobile,
  currentUser,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (item: string) =>
    activeItem ? activeItem === item : pathname.includes(item);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '✓' },
    { id: 'meet', label: 'Meetings', icon: '📅' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'spaces', label: 'Spaces', icon: '🗂️' },
    { id: 'mail', label: 'Mail', icon: '✉️' },
  ];

  const handleItemClick = (id: string) => {
    onItemClick?.(id);
    if (isMobile) onClose?.();
  };

  return (
    <aside className="h-full pro-sidebar-gradient pro-shadow flex flex-col">
      {/* Logo/Branding */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="text-white font-bold text-xl hover:text-white/80 transition-colors">
          📋 Task Manager
        </Link>
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-1 text-white/60 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-left ${
                  isActive(item.id)
                    ? 'bg-gradient-to-r from-purple-500/40 to-pink-500/40 text-white border border-purple-400/50'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - User & Logout */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {currentUser?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {currentUser?.name ?? 'User'}
            </p>
            <p className="text-white/40 text-xs truncate">
              {currentUser?.email ?? ''}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium text-left"
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
