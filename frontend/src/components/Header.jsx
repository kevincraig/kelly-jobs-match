import React from 'react';
import { User, Search, LogOut } from 'lucide-react';

const Header = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="kelly-gradient p-2 rounded-lg">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6.294a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Kelly Jobs Match</h1>
              <p className="text-sm text-gray-500">Intelligent Job Matching System</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  currentView === 'profile' 
                    ? 'bg-kelly-blue text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setCurrentView('jobs')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  currentView === 'jobs' 
                    ? 'bg-kelly-blue text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
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
                className="text-gray-400 hover:text-gray-600 transition-colors"
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