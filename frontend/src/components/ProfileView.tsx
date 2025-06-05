import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Skill } from '../types';
import SkillsModal from './SkillsModal';

const ProfileView: React.FC = () => {
  const { user } = useAuth();
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [userSkills, setUserSkills] = useState<Skill[]>([]);

  if (!user) {
    return null;
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.username}
              </h2>
            </div>
            <button
              onClick={() => setIsSkillsModalOpen(true)}
              className="px-4 py-2 bg-kelly text-white rounded-lg hover:bg-kelly-700 transition-colors"
            >
              Edit Skills
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">User Info</h3>
              <div className="text-gray-700">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
            </div>
          </div>
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