import React, { useState, useEffect } from 'react';
import { Star, Plus, X, Building2, Filter, Trash2 } from 'lucide-react';
import { getAllCategories, getRolesInCategory } from '../services/jobTaxonomyService';
import { skillsAPI } from '../services/api';

const ProfileView = ({ profileData, setProfileData, onShowSkillsModal }) => {
  const [saving, setSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [categories, setCategories] = useState({});

  useEffect(() => {
    // Fetch available skills from your API
    const fetchSkills = async () => {
      try {
        const response = await skillsAPI.getAllSkills();
        setAvailableSkills(response.skills);
      } catch (error) {
        console.error('Error fetching skills:', error);
      }
    };
    fetchSkills();
    
    // Load job categories
    setCategories(getAllCategories());
  }, []);

  // Update subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      setSelectedSubcategory('');
    }
  }, [selectedCategory]);

  if (!profileData) return null;

  const handleAddSkill = () => {
    if (selectedSkill && !profileData.skills.some(s => s.name === selectedSkill)) {
      const skillToAdd = availableSkills.find(s => s.name === selectedSkill);
      if (skillToAdd) {
        setProfileData(prev => ({
          ...prev,
          skills: [...prev.skills, skillToAdd]
        }));
        setSelectedSkill('');
      }
    }
  };

  const removeSkill = (skillName) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.name !== skillName)
    }));
  };

  const handleRoleChange = (category, subcategory, role) => {
    setProfileData(prev => ({
      ...prev,
      role,
      roleCategory: category,
      roleSubcategory: subcategory
    }));
  };

  const addExperience = () => {
    setProfileData(prev => ({
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
    const newExp = [...profileData.experience];
    newExp[index][field] = field === 'years' ? parseInt(value) || 0 : value;
    setProfileData(prev => ({ ...prev, experience: newExp }));
  };

  const clearAllSkills = () => {
    setProfileData(prev => ({ ...prev, skills: [] }));
    setShowClearAllModal(false);
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
            <input type="text" value={profileData.firstName} onChange={e => setProfileData(prev => ({ ...prev, firstName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="Enter your first name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input type="text" value={profileData.lastName} onChange={e => setProfileData(prev => ({ ...prev, lastName: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="Enter your last name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input type="text" value={profileData.location} onChange={e => setProfileData(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly" placeholder="City, State" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Role/Position Type</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly"
              >
                <option value="">Select Category</option>
                {Object.keys(categories).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              {selectedCategory && (
                <select 
                  value={selectedSubcategory} 
                  onChange={e => setSelectedSubcategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly"
                >
                  <option value="">Select Subcategory</option>
                  {categories[selectedCategory]?.map(subcategory => (
                    <option key={subcategory} value={subcategory}>{subcategory}</option>
                  ))}
                </select>
              )}
              
              {selectedCategory && selectedSubcategory && (
                <select 
                  value={profileData.role || ''} 
                  onChange={e => handleRoleChange(selectedCategory, selectedSubcategory, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kelly"
                >
                  <option value="">Select Role</option>
                  {getRolesInCategory(selectedCategory, selectedSubcategory).map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              )}
            </div>
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
          <div className="flex gap-2">
            <button
              onClick={onShowSkillsModal}
              className="bg-kelly text-white px-6 py-2 rounded-lg hover:bg-kelly-dark disabled:opacity-50 font-bold font-sans flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Skills</span>
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {(profileData.skills || []).map((skill) => (
            <span
              key={skill.name}
              className="inline-flex justify-between items-center pl-4 py-1 rounded-full text-sm font-medium bg-kelly-100 text-kelly-800 min-w-[80px] h-9"
            >
              <span className="flex-1 text-center">{skill.name}</span>
              <button
                onClick={() => removeSkill(skill.name)}
                className="ml-2 flex items-center justify-center w-12 h-12 rounded-full bg-transparent hover:bg-kelly-100 text-kelly-700 focus:outline-none z-10"
                aria-label="Remove skill"
              >
                <X className="h-7 w-7 text-kelly-700" />
              </button>
            </span>
          ))}
        </div>
        <div className='flex justify-end py-0'>
          <button
            onClick={() => setShowClearAllModal(true)}
            className="bg-transparent text-red-600 px-4 rounded-lg flex items-center space-x-2 hover:bg-red-50 hover:text-red-800 text-xs font-bold font-sans"
            title="Clear All Skills"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </button>
        </div>
        {/* Clear All Confirmation Modal */}
        {showClearAllModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Clear All Skills?</h3>
              <p className="mb-6 text-gray-700">Are you sure you want to remove all skills from your profile? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowClearAllModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={clearAllSkills}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          </div>
        )}
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
        {((profileData.experience || []).map((exp, index) => (
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
        )))}
        {profileData.experience.length === 0 && (
          <p className="text-gray-500 italic">No experience added yet. Click "Add Experience" to get started.</p>
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
              {((profileData.preferences && profileData.preferences.jobTypes) || []).map(type => (
                <label key={type} className="flex items-center">
                  <input type="checkbox" checked={profileData.preferences && profileData.preferences.jobTypes && profileData.preferences.jobTypes.includes(type)} onChange={e => {
                    const newTypes = e.target.checked
                      ? [...profileData.preferences.jobTypes, type]
                      : profileData.preferences.jobTypes.filter(t => t !== type);
                    setProfileData(prev => ({
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
              <input type="checkbox" checked={profileData.preferences.remoteWork} onChange={e => setProfileData(prev => ({
                ...prev,
                preferences: { ...prev.preferences, remoteWork: e.target.checked }
              }))} className="mr-2" />
              <span className="text-sm font-medium text-gray-700">Open to Remote Work</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Commute Distance: {profileData.preferences.maxRadius} miles</label>
            <input type="range" min="5" max="100" step="5" value={profileData.preferences.maxRadius} onChange={e => setProfileData(prev => ({
              ...prev,
              preferences: { ...prev.preferences, maxRadius: parseInt(e.target.value) }
            }))} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;