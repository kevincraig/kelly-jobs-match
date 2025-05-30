import React from 'react';

const ProfileView = ({ user, setUser }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Profile View</h2>
        <p className="text-gray-600">Profile component will be implemented here.</p>
        <p className="text-sm text-gray-500 mt-2">User: {user?.email}</p>
      </div>
    </div>
  );
};

export default ProfileView;