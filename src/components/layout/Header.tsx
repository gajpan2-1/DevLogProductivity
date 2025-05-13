import React from 'react';
import { Bell, Plus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Button from '../common/Button';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isDeveloper = user?.role === 'developer';
  
  // Get title based on current path if not provided
  const getTitle = () => {
    if (title) return title;
    
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/logs':
        return 'My Work Logs';
      case '/logs/new':
        return 'Create Work Log';
      case '/stats':
        return 'Statistics';
      case '/team':
        return 'Team Overview';
      case '/reports':
        return 'Reports';
      case '/settings':
        return 'Settings';
      case '/notifications':
        return 'Notifications';
      default:
        return 'DevLog';
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <h1 className="text-xl font-bold text-gray-900">{getTitle()}</h1>
          
          <div className="flex items-center space-x-4">
            {isDeveloper && location.pathname !== '/logs/new' && (
              <Link to="/logs/new">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={16} />}
                >
                  New Log
                </Button>
              </Link>
            )}
            
            <button className="p-1 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span className="sr-only">View notifications</span>
              <Bell size={20} />
            </button>
            
            <img
              className="h-8 w-8 rounded-full"
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=4F46E5&color=fff`}
              alt={user?.name}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;