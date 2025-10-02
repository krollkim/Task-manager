import React, { useState } from 'react';
import { 
  SearchOutlined, 
  NotificationsOutlined, 
  SettingsOutlined,
  MenuOutlined,
  LogoutOutlined 
} from '@mui/icons-material';
import { IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import '../../dashboard.css';

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
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    onSearchChange?.(value);
  };

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="pro-sidebar-gradient pro-rounded-lg pro-shadow h-16 flex items-center justify-between px-6 mb-6 pro-fade-in">
      {/* Left Section - Menu & Search */}
      <div className="flex items-center space-x-4 flex-1">
        {isMobile && (
          <IconButton onClick={onMenuClick} className="text-white">
            <MenuOutlined />
          </IconButton>
        )}
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchOutlined className="text-white/60" />
          </div>
          <input
            type="text"
            value={localSearchValue}
            onChange={handleSearchChange}
            placeholder="Search tasks, notes, or anything..."
            className="
              w-full pl-10 pr-4 py-2 
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
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <IconButton className="text-white hover:bg-white/10 transition-colors duration-200">
          <NotificationsOutlined />
        </IconButton>

        {/* Settings */}
        <IconButton className="text-white hover:bg-white/10 transition-colors duration-200">
          <SettingsOutlined />
        </IconButton>

        {/* Divider */}
        <div className="w-px h-8 bg-white/20"></div>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <Avatar
            onClick={handleUserMenuClick}
            className="pro-card-gradient cursor-pointer hover:scale-105 transition-transform duration-200"
            sx={{ width: 36, height: 36 }}
          >
            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
          {!isMobile && (
            <div className="text-white">
              <p className="text-sm font-medium">{currentUser?.name || 'User Name'}</p>
              <p className="text-xs text-white/60">Online</p>
            </div>
          )}
        </div>

        {/* User Menu */}
        <Menu
          anchorEl={userMenuAnchor}
          open={Boolean(userMenuAnchor)}
          onClose={handleUserMenuClose}
          PaperProps={{
            className: 'pro-button-gradient pro-rounded border border-white/10',
            style: { marginTop: 8 }
          }}
        >
          <MenuItem 
            onClick={handleUserMenuClose}
            className="text-white hover:bg-white/10"
          >
            <SettingsOutlined className="mr-2" fontSize="small" />
            Settings
          </MenuItem>
          <MenuItem 
            onClick={handleLogout}
            className="text-red-300 hover:bg-red-500/10"
          >
            <LogoutOutlined className="mr-2" fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
};

export default Header; 