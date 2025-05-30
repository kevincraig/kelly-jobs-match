import React, { useState, useEffect } from 'react';
import { Star, Plus, X, Building2, Filter } from 'lucide-react';

const ProfileView = ({ user, setUser, onShowSkillsModal }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    location: user?.location || '',
    skills: user?.skills || [],
    experience: user?.experience || [],
    education: user?.education || [],
    certifications: user?.certifications || [],
    preferences: user?.preferences || {
      jobTypes: ['Full-time'],
      remoteWork: false,
      maxRadius: 25,
    }
  });
  const [saving, setSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');

  useEffect(() => {
    // Fetch available skills from your API
    const fetchSkills = async () => {
      try {
        const response = await window.userAPI.getSkills();
        setAvailableSkills(response.skills);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    fetchSkills();
  }, []);

  const handleAddSkill = () => {
    if (selectedSkill && !formData.skills.some(s => s.name === selectedSkill)) {
      const skillToAdd = availableSkills.find(s => s.name === selectedSkill);
      if (skillToAdd) {
        setFormData(prev => ({
          ...prev,
          skills: [...prev.skills, skillToAdd]
        }));
        setSelectedSkill('');
      }
    }
  };

  const removeSkill = (skillName) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        title: '',
        company: '',
        years: 0,
        description: ''
      }]
    }));
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index][field] = field === 'years' ? parseInt(value) || 0 : value;
    setFormData(prev => ({ ...prev, experience: newExp }));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      // Assume userAPI.updateProfile is available globally or via context
      const response = await window.userAPI.updateProfile(formData);
      setUser(response.user);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg></span>
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input type="text" value={formData.firstName} onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="Enter your first name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" value={formData.lastName} onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="Enter your last name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="City, State" />
          </div>
        </div>
      </div>
      {/* Skills Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Skills
          </h2>
          <button
            onClick={onShowSkillsModal}
            className="bg-kelly text-white px-6 py-2 rounded-lg hover:bg-kelly-dark disabled:opacity-50 font-bold font-sans flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Skills</span>
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.skills.map((skill) => (
            <span
              key={skill.name}
              className="inline-flex justify-between items-center pl-4 py-1 rounded-full text-sm font-medium bg-kelly-100 text-kelly-800 min-w-[80px] h-9"
            >
              <span className="flex-1 text-center">{skill.name}</span>
              <button
                onClick={() => removeSkill(skill.name)}
                className="ml-2 flex items-center justify-center w-12 h-12 rounded-full bg-transparent hover:bg-kelly-200 text-kelly-700 focus:outline-none z-10"
                aria-label="Remove skill"
              >
                <X className="h-7 w-7 text-kelly-700" />
              </button>
            </span>
          ))}
        </div>
      </div>
      {/* Experience Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Work Experience
          </h2>
          <button
            onClick={addExperience}
            className="bg-kelly text-white px-6 py-2 rounded-lg hover:bg-kelly-dark disabled:opacity-50 font-bold font-sans flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Experience</span>
          </button>
        </div>
        {formData.experience.map((exp, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input type="text" value={exp.title} onChange={e => updateExperience(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="Software Developer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input type="text" value={exp.company} onChange={e => updateExperience(index, 'company', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="Company Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years</label>
                <input type="number" min="0" max="50" value={exp.years} onChange={e => updateExperience(index, 'years', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="3" />
              </div>
            </div>
          </div>
        ))}
        {formData.experience.length === 0 && (
          <p className="text-gray-500 italic">No experience added yet. Click \"Add Experience\" to get started.</p>
        )}
      </div>
      {/* Job Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Job Preferences
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Job Types</label>
            <div className="space-y-2">
              {['Full-time', 'Part-time', 'Contract', 'Contract-to-hire'].map(type => (
                <label key={type} className="flex items-center">
                  <input type="checkbox" checked={formData.preferences.jobTypes.includes(type)} onChange={e => {
                    const newTypes = e.target.checked
                      ? [...formData.preferences.jobTypes, type]
                      : formData.preferences.jobTypes.filter(t => t !== type);
                    setFormData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, jobTypes: newTypes }
                    }));
                  }} className="mr-2" />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center mb-4">
              <input type="checkbox" checked={formData.preferences.remoteWork} onChange={e => setFormData(prev => ({
                ...prev,
                preferences: { ...prev.preferences, remoteWork: e.target.checked }
              }))} className="mr-2" />
              <span className="text-sm font-medium text-gray-700">Open to Remote Work</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Commute Distance: {formData.preferences.maxRadius} miles</label>
            <input type="range" min="5" max="100" step="5" value={formData.preferences.maxRadius} onChange={e => setFormData(prev => ({
              ...prev,
              preferences: { ...prev.preferences, maxRadius: parseInt(e.target.value) }
            }))} className="w-full" />
          </div>
        </div>
      </div>
      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={saveProfile} disabled={saving} className="bg-kelly text-white px-6 py-3 rounded-lg hover:bg-kelly-dark disabled:opacity-50 font-bold font-sans">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
};

export default ProfileView;