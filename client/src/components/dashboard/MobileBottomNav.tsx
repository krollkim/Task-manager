import React from 'react';

interface MobileBottomNavProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeItem, onItemClick }) => {
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      icon: <span>📊</span>,
      label: 'Home'
    },
    {
      id: 'tasks', 
      icon: <span>📋</span>,
      label: 'Tasks'
    },
    {
      id: 'mail',
      icon: <span>📧</span>,
      label: 'Mail'
    },
    {
      id: 'chat',
      icon: <span>💬</span>,
      label: 'Chat'
    },
    {
      id: 'spaces',
      icon: <span>📁</span>,
      label: 'Files'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Bottom Navigation */}
      <div className="pro-sidebar-gradient backdrop-blur-lg border-t border-white/10 pro-shadow-lg">
        <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`
                flex flex-col items-center justify-center
                min-w-[3.5rem] h-14 px-2 py-1 mobile-nav-item
                pro-rounded transition-all duration-300 ease-out
                active:scale-95 relative overflow-hidden group
                ${activeItem === item.id
                  ? 'text-white pro-button-gradient pro-shadow' 
                  : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }
              `}
            >
              {/* Active indicator */}
              {activeItem === item.id && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-b-full" />
              )}
              
              {/* Icon with scaling animation */}
              <div className={`
                text-xl mb-1 transition-all duration-300
                ${activeItem === item.id 
                  ? 'scale-110 text-white' 
                  : 'scale-100 group-hover:scale-105'
                }
              `}>
                {item.icon}
              </div>
              
              {/* Label - hidden on very small screens, shown as tiny text on mobile */}
              <span className={`
                text-[10px] font-medium leading-none transition-all duration-300
                ${activeItem === item.id ? 'text-white' : 'text-white/50'}
                hidden xs:block
              `}>
                {item.label}
              </span>
            </button>
          ))}
          
          {/* Profile/More button */}
          <button
            className="
              flex flex-col items-center justify-center
              min-w-[3.5rem] h-14 px-2 py-1 mobile-nav-item
              pro-rounded transition-all duration-300 ease-out
              text-white/60 hover:text-white/80 hover:bg-white/5
              active:scale-95 relative overflow-hidden group
            "
          >
            <div className="text-xl mb-1 transition-all duration-300 group-hover:scale-105">
              <span aria-hidden="true">👤</span>
            </div>
            <span className="text-[10px] font-medium leading-none text-white/50 hidden xs:block">
              Profile
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;