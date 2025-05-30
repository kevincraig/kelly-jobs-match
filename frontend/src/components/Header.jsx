import React from 'react';
import { User, Search, LogOut } from 'lucide-react';

const Header = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-kelly-light p-2 rounded-lg">
              <img src="/kelly-logo.svg" alt="Kelly Services" className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-kelly font-sans">Kelly Jobs Match</h1>
              <p className="text-sm text-gray-900 font-sans">Intelligent Job Matching System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${currentView === 'profile'
                    ? 'bg-kelly-700 hover:bg-kelly-100 text-white hover:text-kelly-700'
                    : 'text-kelly-300 hover:bg-kelly-100'
                  }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setCurrentView('jobs')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${currentView === 'jobs'
                  ? 'bg-kelly-700 hover:bg-kelly-100 text-white hover:text-kelly-700'
                  : 'text-kelly-300 hover:bg-kelly-100'
                }`}
              >
                <Search className="h-4 w-4" />
                <span>Find Jobs</span>
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || 'User'}
              </span>
              <button
                onClick={onLogout}
                className="text-kelly-300 hover:text-kelly-100 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;