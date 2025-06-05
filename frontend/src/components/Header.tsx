import React from 'react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface HeaderProps {
  currentView: 'profile' | 'jobs';
  setCurrentView: (view: 'profile' | 'jobs') => void;
  user: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img
                className="h-8 w-auto"
                src="/kelly-logo.svg"
                alt="Kelly Jobs Match"
              />
            </div>
            <nav className="ml-6 flex space-x-8">
              <button
                onClick={() => setCurrentView('jobs')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  currentView === 'jobs'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Jobs
              </button>
              <button
                onClick={() => setCurrentView('profile')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  currentView === 'profile'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Profile
              </button>
            </nav>
          </div>
          <div className="flex items-center">
            <div className="ml-3 relative">
              <div className="flex items-center">
                <span className="text-gray-700 mr-4">{user.name || user.email}</span>
                <button
                  onClick={onLogout}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 