import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Skill } from '../types';
import SkillsModal from './SkillsModal';
import axios from 'axios';

const ProfileView: React.FC = () => {
  const { user } = useAuth();
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.put('http://localhost:5000/api/profile', {
        id: user.id,
        name: name
      });

      // Update the user in localStorage
      const updatedUser = { ...user, name: response.data.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleEdit = () => {
    // TODO: Implement edit functionality
    console.log('Edit profile clicked');
  };

  const handleSaveSkills = (skills: Skill[]) => {
    setUserSkills(skills);
    // TODO: Implement API call to save skills
    console.log('Saving skills:', skills);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.name || user.email}
              </h2>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Name</h3>
                <p className="mt-1 text-sm text-gray-900">{user.name || 'Not set'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Skills
            </h2>
          </div>
          <button
            onClick={() => setIsSkillsModalOpen(true)}
            className="px-4 py-2 bg-kelly text-white rounded-lg hover:bg-kelly-700 transition-colors"
          >
            Edit Skills
          </button>
        </div>
        <div className="text-gray-700">
          <pre>{JSON.stringify(userSkills, null, 2)}</pre>
        </div>
      </div>
      {isSkillsModalOpen && (
        <SkillsModal
          onClose={() => setIsSkillsModalOpen(false)}
          selectedSkills={userSkills}
          availableSkills={[]} // TODO: Fetch available skills from API
          isOpen={isSkillsModalOpen}
          onSave={handleSaveSkills}
        />
      )}
    </div>
  );
};

export default ProfileView; 