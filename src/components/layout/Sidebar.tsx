import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BarChart3, 
  Settings, 
  LogOut, 
  Users,
  Bell
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  
  const isDeveloper = user?.role === 'developer';
  const isManager = user?.role === 'manager';
  
  const handleLogout = () => {
    logout();
  };
  
  const commonLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: <Settings size={20} />,
    },
  ];
  
  const developerLinks = [
    {
      to: '/logs',
      label: 'My Logs',
      icon: <CalendarDays size={20} />,
    },
    {
      to: '/stats',
      label: 'Statistics',
      icon: <BarChart3 size={20} />,
    },
  ];
  
  const managerLinks = [
    {
      to: '/team',
      label: 'Team',
      icon: <Users size={20} />,
    },
    {
      to: '/reports',
      label: 'Reports',
      icon: <BarChart3 size={20} />,
    },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: <Bell size={20} />,
    },
  ];
  
  // Combine links based on user role
  const links = [
    ...commonLinks,
    ...(isDeveloper ? developerLinks : []),
    ...(isManager ? managerLinks : []),
  ];
  
  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-600">DevLog</h1>
      </div>
      
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `
                  flex items-center px-4 py-2 text-sm font-medium rounded-md
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <img
              className="h-10 w-10 rounded-full"
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=4F46E5&color=fff`}
              alt={user?.name}
            />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center w-full px-4 py-2 text-sm text-red-600 font-medium rounded-md hover:bg-red-50"
        >
          <LogOut size={18} className="mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;