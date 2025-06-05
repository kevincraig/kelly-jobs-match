import React from 'react';
import { User } from '../types';

type HeaderProps = {
  currentView: 'profile' | 'jobs';
  setCurrentView: (view: 'profile' | 'jobs') => void;
  user: User | null;
  onLogout: () => void;
};

export default function Header({ currentView, setCurrentView, user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">Kelly Jobs Match</h1>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              Welcome, {user?.username || 'User'}
            </span>
            <button
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 