'use client';

import React from 'react';

interface MobileBottomNavProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeItem,
  onItemClick,
}) => {
  const items = [
    { id: 'tasks', label: 'Tasks', icon: '📋' },
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'spaces', label: 'Spaces', icon: '🌐' },
    { id: 'meet', label: 'Meetings', icon: '📅' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-white/10 flex justify-around z-40">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onItemClick(item.id)}
          className={`flex-1 py-3 px-2 text-center transition-colors ${
            activeItem === item.id
              ? 'text-blue-400 bg-white/5'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <div className="text-xl mb-1">{item.icon}</div>
          <div className="text-xs">{item.label}</div>
        </button>
      ))}
    </div>
  );
};

export default MobileBottomNav;
