import React from 'react';
import { 
  MailOutline, 
  ChatBubbleOutline, 
  FolderOutlined, 
  VideocamOutlined,
  DashboardOutlined,
  AssignmentOutlined 
} from '@mui/icons-material';
import '../../dashboard.css';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'tasks', onItemClick }) => {
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
    <div className="pro-sidebar-gradient pro-rounded-lg pro-shadow-lg h-full w-64 flex flex-col p-6 pro-slide-in">
      {/* Logo/Brand */}
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold tracking-wider">
          Task<span className="pro-text-gradient">Manager</span>
        </h1>
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
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 pro-card-gradient pro-rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">U</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">User Name</p>
            <p className="text-white/60 text-xs">Pro Member</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 