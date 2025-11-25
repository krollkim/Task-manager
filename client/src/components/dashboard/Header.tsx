import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface HeaderProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onMenuClick?: () => void;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  searchValue = '', 
  onSearchChange, 
  onMenuClick,
  isMobile = false 
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    onSearchChange?.(value);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleUserMenuClose = () => {
    setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  return (
    <header className="pro-sidebar-gradient pro-rounded-lg pro-shadow h-16 flex items-center justify-between px-4 md:px-6 mb-6 pro-fade-in">
      {/* Left Section - Menu & Search */}
      <div className="flex items-center space-x-2 md:space-x-4 flex-1">
        {isMobile && (
          <button onClick={onMenuClick} className="p-2 text-white hover:bg-white/10 transition-colors duration-200 rounded-full">
            <span className="text-xl">☰</span>
          </button>
        )}
        
        {/* Search Bar - Hide on very small screens, show icon only */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-white/60 text-lg">🔍</span>
          </div>
          <input
            type="text"
            value={localSearchValue}
            onChange={handleSearchChange}
            placeholder={isMobile ? "Search..." : "Search tasks, notes, or anything..."}
            className="
              w-full pl-10 pr-4 py-2 text-sm md:text-base
              bg-white/10 text-white placeholder-white/60
              border border-white/20 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent
              transition-all duration-300
              backdrop-blur-sm
            "
          />
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center space-x-1 md:space-x-3">
        {/* Notifications - Hide on very small screens */}
        <button className="p-2 text-white hover:bg-white/10 transition-colors duration-200 rounded-full hidden sm:flex">
          <span className={`${isMobile ? 'text-sm' : 'text-base'}`}>🔔</span>
        </button>

        {/* Settings - Hide on very small screens */}
        <button className="p-2 text-white hover:bg-white/10 transition-colors duration-200 rounded-full hidden sm:flex">
          <span className={`${isMobile ? 'text-sm' : 'text-base'}`}>⚙️</span>
        </button>

        {/* Divider - Hide on mobile */}
        {!isMobile && <div className="w-px h-8 bg-white/20 hidden md:block"></div>}

        {/* User Profile */}
        <div className="flex items-center space-x-2 md:space-x-3 relative">
          <button
            onClick={handleUserMenuToggle}
            className={`pro-card-gradient cursor-pointer hover:scale-105 transition-transform duration-200 rounded-full flex items-center justify-center text-white font-semibold ${isMobile ? 'w-8 h-8 text-sm' : 'w-9 h-9 text-base'}`}
          >
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </button>
          {!isMobile && (
            <div className="text-white hidden md:block">
              <p className="text-sm font-medium">{currentUser?.name || 'User Name'}</p>
              <p className="text-xs text-white/60">Online</p>
            </div>
          )}

          {/* User Menu */}
          {userMenuOpen && (
            <div className="absolute top-full right-0 mt-2 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-white/10 shadow-lg z-50 min-w-[150px]">
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
      </div>

      {/* Click outside to close menu */}
      {userMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={handleUserMenuClose}
        />
      )}
    </header>
  );
};

export default Header;