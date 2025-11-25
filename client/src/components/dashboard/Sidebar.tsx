import React, { useState } from 'react';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
  currentUser?: { name?: string; email?: string };
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeItem = 'tasks', 
  onItemClick, 
  onClose, 
  isMobile = false, 
  currentUser, 
  onLogout 
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleUserMenuClose = () => {
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    handleUserMenuClose();
  };

  const sidebarItems: SidebarItem[] = [
    {
      icon: <span className="text-xl">📊</span>,
      label: 'Dashboard',
      active: activeItem === 'dashboard',
      onClick: () => onItemClick?.('dashboard')
    },
    {
      icon: <span className="text-xl">📋</span>,
      label: 'Tasks',
      active: activeItem === 'tasks',
      onClick: () => onItemClick?.('tasks')
    },
    {
      icon: <span className="text-xl">📧</span>,
      label: 'Mail',
      active: activeItem === 'mail',
      onClick: () => onItemClick?.('mail')
    },
    {
      icon: <span className="text-xl">💬</span>,
      label: 'Chat',
      active: activeItem === 'chat',
      onClick: () => onItemClick?.('chat')
    },
    {
      icon: <span className="text-xl">📁</span>,
      label: 'Spaces',
      active: activeItem === 'spaces',
      onClick: () => onItemClick?.('spaces')
    },
    {
      icon: <span className="text-xl">📹</span>,
      label: 'Meet',
      active: activeItem === 'meet',
      onClick: () => onItemClick?.('meet')
    }
  ];

  return (
    <div className="pro-sidebar-gradient pro-rounded-lg pro-shadow-lg h-full w-64 flex flex-col p-6 pro-slide-in relative">
      {/* Mobile Close Button */}
      {isMobile && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
        >
          ✕
        </button>
      )}
      
      {/* Logo/Brand */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold tracking-wider">
          Task<span className="pro-text-gradient">Manager</span>
        </h1>
        {isMobile && (
          <p className="text-white/50 text-sm mt-1">Mobile Navigation</p>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1">
        <ul className="space-y-3">
          {sidebarItems.map((item, index) => (
            <li key={index}>
              <button
                onClick={item.onClick}
                className={`
                  w-full flex items-center space-x-4 px-4 py-3 rounded-xl
                  transition-all duration-300 ease-in-out group
                  ${item.active 
                    ? 'bg-white/20 text-white pro-shadow' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <span className={`
                  text-xl transition-transform duration-300
                  ${item.active ? 'scale-110' : 'group-hover:scale-105'}
                `}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm tracking-wide">
                  {item.label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="mt-8 p-4 pro-glass pro-rounded relative">
        <div className="flex items-center space-x-2 md:space-x-3">
          <button
            onClick={handleUserMenuToggle}
            className={`pro-card-gradient cursor-pointer hover:scale-105 transition-transform duration-200 rounded-full flex items-center justify-center text-white font-semibold ${isMobile ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-base'}`}
          >
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </button>
          {!isMobile && (
            <div className="text-white">
              <p className="text-sm font-medium">{currentUser?.name || 'User Name'}</p>
              <p className="text-xs text-white/60">Online</p>
            </div>
          )}
        </div>

        {/* User Menu */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-0 mb-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/10 shadow-lg z-50 min-w-[150px]">
            <button 
              onClick={handleUserMenuClose}
              className="w-full px-4 py-3 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center rounded-t-lg"
            >
              <span className="mr-2 text-sm">⚙️</span>
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left text-red-300 hover:bg-red-500/10 transition-colors duration-200 flex items-center rounded-b-lg"
            >
              <span className="mr-2 text-sm">🚪</span>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleUserMenuClose}
        />
      )}
    </div>
  );
};

export default Sidebar;