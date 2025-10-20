import React, { useState } from 'react';
import { 
  MailOutline, 
  ChatBubbleOutline, 
  FolderOutlined, 
  VideocamOutlined,
  DashboardOutlined,
  AssignmentOutlined,
  SettingsOutlined,
  LogoutOutlined
} from '@mui/icons-material';
import { Menu, MenuItem, Avatar } from '@mui/material';

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
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    onLogout?.();
    handleUserMenuClose();
  };
  const sidebarItems: SidebarItem[] = [
    {
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      active: activeItem === 'dashboard',
      onClick: () => onItemClick?.('dashboard')
    },
    {
      icon: <AssignmentOutlined />,
      label: 'Tasks',
      active: activeItem === 'tasks',
      onClick: () => onItemClick?.('tasks')
    },
    {
      icon: <MailOutline />,
      label: 'Mail',
      active: activeItem === 'mail',
      onClick: () => onItemClick?.('mail')
    },
    {
      icon: <ChatBubbleOutline />,
      label: 'Chat',
      active: activeItem === 'chat',
      onClick: () => onItemClick?.('chat')
    },
    {
      icon: <FolderOutlined />,
      label: 'Spaces',
      active: activeItem === 'spaces',
      onClick: () => onItemClick?.('spaces')
    },
    {
      icon: <VideocamOutlined />,
      label: 'Meet',
      active: activeItem === 'meet',
      onClick: () => onItemClick?.('meet')
    }
  ];

  return (
    <div className="pro-sidebar-gradient pro-rounded-lg pro-shadow-lg h-full w-64 flex flex-col p-6 pro-slide-in relative">
      {/* Mobile Close Button */}
      {/* {isMobile && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
        >
          <CloseOutlined />
        </button>
      )} */}
      
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
      <div className="mt-8 p-4 pro-glass pro-rounded">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Avatar
            onClick={handleUserMenuClick}
            className="pro-card-gradient cursor-pointer hover:scale-105 transition-transform duration-200"
            sx={{ width: isMobile ? 32 : 36, height: isMobile ? 32 : 36 }}
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
    </div>
  );
};

export default Sidebar; 