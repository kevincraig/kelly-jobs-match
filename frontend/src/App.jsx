import React, { useState, useEffect, useMemo } from 'react';
import { User, Search, LogOut, Star, Plus, X, Filter, MapPin, Clock, Building2 } from 'lucide-react';
import './App.css';
import { fetchKellyJobs } from './services/jobFeedService';
import { calculateJobMatch } from './services/jobMatchingService';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import SearchFilters from './components/SearchFilters';
import JobList from './components/JobList';
import PaginationControls from './components/PaginationControls';
import usePersistentState from './hooks/usePersistentState';
import { getAllSkills, searchSkills } from './utils/skillsTaxonomy';
import JobsView from './components/JobsView';

// API functions
const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  post: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }
    return response.json();
  },
  get: async (url) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }
    return response.json();
  },
  put: async (url, data) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }
    return response.json();
  }
};

const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
};

const jobsAPI = {
  searchJobs: async (filters, page = 1, pageSize = 10) => {
    try {
      console.log('Fetching jobs with filters:', filters, 'page:', page, 'pageSize:', pageSize);
      const jobs = await fetchKellyJobs(page, pageSize);
      
      // Apply filters to the fetched jobs
      let filteredJobs = jobs;
      
      if (filters.keywords) {
        const keywordLower = filters.keywords.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(keywordLower) ||
          job.description.toLowerCase().includes(keywordLower) ||
          job.requiredSkills.some(skill => skill.toLowerCase().includes(keywordLower))
        );
      }
      
      if (filters.jobType !== 'All') {
        filteredJobs = filteredJobs.filter(job => job.jobType === filters.jobType);
      }
      
      if (filters.remote) {
        filteredJobs = filteredJobs.filter(job => job.remote);
      }
      
      console.log(`Filtered to ${filteredJobs.length} jobs`);
      return { jobs: filteredJobs };
    } catch (error) {
      console.error('Error in jobsAPI.searchJobs:', error);
      // Do not fall back to sample data
      return { jobs: [] };
    }
  },
};

// Skills taxonomy for the frontend
const SKILLS_TAXONOMY = {
  'Technical Skills': [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Git',
    'HTML/CSS', 'MongoDB', 'REST APIs', 'GraphQL', 'TypeScript', 'Vue.js',
    'Angular', 'PostgreSQL', 'Redis', 'Kubernetes', 'C#', '.NET'
  ],
  'Soft Skills': [
    'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration',
    'Project Management', 'Critical Thinking', 'Adaptability', 'Time Management',
    'Customer Service', 'Negotiation', 'Presentation', 'Mentoring',
    'Strategic Planning', 'Decision Making', 'Conflict Resolution'
  ],
  'Industry Skills': [
    'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education',
    'Marketing', 'Sales', 'HR', 'Legal', 'Accounting', 'Engineering',
    'Design', 'Operations', 'Quality Assurance', 'Data Analysis'
  ]
};

// Skills Modal Component
const SkillsModal = ({ showModal, setShowModal, userSkills, onAddSkills }) => {
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('Technical Skills');
  const [selectedSkillsToAdd, setSelectedSkillsToAdd] = useState([]);

  const toggleSkillSelection = (skillName) => {
    setSelectedSkillsToAdd(prev => 
      prev.includes(skillName)
        ? prev.filter(name => name !== skillName)
        : [...prev, skillName]
    );
  };

  const addSkills = () => {
    const newSkills = selectedSkillsToAdd.map(skillName => ({
      name: skillName,
      proficiency: 'Intermediate'
    }));
    
    onAddSkills(newSkills);
    setSelectedSkillsToAdd([]);
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Skills</h3>
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedSkillsToAdd([]);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Skill Categories */}
        <div className="flex space-x-2 mb-4">
          {Object.keys(SKILLS_TAXONOMY).map(category => (
            <button
              key={category}
              onClick={() => setSelectedSkillCategory(category)}
              className={`px-3 py-2 rounded-lg text-sm ${
                selectedSkillCategory === category
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Skills List - Scrollable */}
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SKILLS_TAXONOMY[selectedSkillCategory].map(skill => {
              const isAlreadyAdded = userSkills.some(s => s.name === skill);
              const isSelected = selectedSkillsToAdd.includes(skill);
              
              return (
                <label
                  key={skill}
                  className={`flex items-center p-2 rounded-lg text-sm cursor-pointer ${
                    isAlreadyAdded
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isAlreadyAdded}
                    onChange={() => !isAlreadyAdded && toggleSkillSelection(skill)}
                    className="mr-2"
                  />
                  <span className="flex-1">{skill}</span>
                  {isAlreadyAdded && (
                    <span className="ml-2 text-xs">✓ Added</span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedSkillsToAdd.length > 0 && (
              <span>{selectedSkillsToAdd.length} skill{selectedSkillsToAdd.length !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedSkillsToAdd([]);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={addSkills}
              disabled={selectedSkillsToAdd.length === 0}
              className={`px-4 py-2 rounded-lg ${
                selectedSkillsToAdd.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add {selectedSkillsToAdd.length > 0 ? `${selectedSkillsToAdd.length} ` : ''}Skill{selectedSkillsToAdd.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Search className="h-6 w-6 text-white" />
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
                    ? 'bg-blue-600 text-white' 
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
                    ? 'bg-blue-600 text-white' 
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

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;
  const R = 3959; // Earth's radius in miles
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Helper to get a short preview of the job description (plain text, 200 chars)
function getShortDescription(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  return text.length > 200 ? text.slice(0, 200) + '...' : text;
}

// Profile Component
const ProfileView = ({ user, setUser }) => {
  const [showSkillsModal, setShowSkillsModal] = useState(false);
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

  const handleAddSkills = (newSkills) => {
    const updatedSkills = [
      ...formData.skills,
      ...newSkills.filter(newSkill => 
        !formData.skills.find(existingSkill => existingSkill.name === newSkill.name)
      )
    ];
    setFormData(prev => ({ ...prev, skills: updatedSkills }));
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
      const response = await userAPI.updateProfile(formData);
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
          <User className="h-5 w-5 mr-2" />
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, State"
            />
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
            onClick={() => setShowSkillsModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Add Skills</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.skills.map((skill, index) => (
            <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center space-x-2">
              <span>{skill.name}</span>
              <button
                onClick={() => removeSkill(skill.name)}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {formData.skills.length === 0 && (
            <p className="text-gray-500 italic">No skills added yet. Click "Add Skills" to get started.</p>
          )}
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700"
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
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Software Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={exp.years}
                  onChange={(e) => updateExperience(index, 'years', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="3"
                />
              </div>
            </div>
          </div>
        ))}
        {formData.experience.length === 0 && (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Job Types
            </label>
            <div className="space-y-2">
              {['Full-time', 'Part-time', 'Contract', 'Contract-to-hire'].map(type => (
                <label key={type} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.preferences.jobTypes.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...formData.preferences.jobTypes, type]
                        : formData.preferences.jobTypes.filter(t => t !== type);
                      setFormData(prev => ({
                        ...prev,
                        preferences: { ...prev.preferences, jobTypes: newTypes }
                      }));
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{type}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={formData.preferences.remoteWork}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, remoteWork: e.target.checked }
                }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Open to Remote Work</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Commute Distance: {formData.preferences.maxRadius} miles
            </label>
            <input
              type="range"
              min="5"
              max="100"
              step="5"
              value={formData.preferences.maxRadius}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                preferences: { ...prev.preferences, maxRadius: parseInt(e.target.value) }
              }))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Skills Modal */}
      <SkillsModal 
        showModal={showSkillsModal}
        setShowModal={setShowSkillsModal}
        userSkills={formData.skills}
        onAddSkills={handleAddSkills}
      />
    </div>
  );
};

// Job Detail Page
const JobDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;
  if (!job) {
    return <div className="p-8">No job data found.</div>;
  }
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">&larr; Back to Results</button>
      <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
      <div className="flex items-center space-x-4 text-gray-600 mb-4">
        <div className="flex items-center">
          <Building2 className="h-4 w-4 mr-1" />
          <span>{job.company}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{job.remote ? 'Remote' : job.location}</span>
        </div>
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          <span>{job.jobType}</span>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-gray-700" dangerouslySetInnerHTML={{ __html: job.description }}></div>
      </div>
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.requiredSkills.map((skill, index) => (
            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{skill}</span>
          ))}
        </div>
      )}
      <div className="flex items-center space-x-4 mb-4">
        {job.salary && (
          <div className="text-sm text-gray-600">
            {typeof job.salary === 'string' ? (
              job.salary
            ) : job.salary.min && job.salary.max ? (
              `${job.salary.currency || 'USD'} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`
            ) : (
              'Salary not specified'
            )}
          </div>
        )}
        {job.applyUrl && (
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">Apply Now</a>
        )}
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isLogin 
        ? await authAPI.login({ email: formData.email, password: formData.password })
        : await authAPI.register(formData);
      
      onLogin(response.user, response.token);
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="bg-blue-600 p-3 rounded-lg inline-block mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Kelly Jobs Match
          </h2>
          <p className="mt-2 text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john.doe@email.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Please wait...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', firstName: '', lastName: '' });
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('profile');
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  // Use persistent state for filters
  const [searchFilters, setSearchFilters] = usePersistentState('searchFilters', {
    keywords: '',
    location: '',
    jobType: 'All',
    remote: false,
    radius: 25,
    useMySkills: false,
    minSkillMatch: 1
  });
  const [page, setPage] = usePersistentState('searchPage', 1);
  const [pageSize, setPageSize] = usePersistentState('searchPageSize', 10);
  const [jobs, setJobs] = useState(() => {
    const savedJobs = localStorage.getItem('savedJobs');
    return savedJobs ? JSON.parse(savedJobs) : [];
  });
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(jobs));
  }, [jobs]);

  // Restore authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getCurrentUser()
        .then(response => {
          setUser(response);
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Suggestions for autocomplete
  const handleKeywordChange = (val) => {
    if (!val) {
      setSuggestions([]);
      return;
    }
    // Suggest from skills and job titles
    const skillSuggestions = searchSkills(val).slice(0, 5);
    const jobTitleSuggestions = jobs
      .map(j => j.title)
      .filter(title => title.toLowerCase().includes(val.toLowerCase()))
      .slice(0, 5);
    setSuggestions([...new Set([...skillSuggestions, ...jobTitleSuggestions])]);
  };

  // Manual search for keyword search mode
  const handleSearchClick = () => {
    setPage(1);
    setLoading(true);
    searchJobs(1, pageSize);
  };

  const handleClearKeywords = () => {
    setSearchFilters(prev => ({ ...prev, keywords: '' }));
    setSuggestions([]);
  };

  const searchJobs = async (newPage = page, newPageSize = pageSize) => {
    if (!searchFilters.useMySkills && !searchFilters.keywords && searchFilters.jobType === 'All') {
      setJobs([]);
      return; // No search criteria
    }
    setLoading(true);
    setError(null);
    try {
      const response = await jobsAPI.searchJobs(searchFilters, newPage, newPageSize);
      setJobs(response.jobs || []);
      if (response.pagination) setPagination(response.pagination);
    } catch (error) {
      console.error('Job search error:', error);
      setError('Failed to fetch jobs. Please try again.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Pagination controls
  const handleNextPage = () => {
    setPage(prev => prev + 1);
    setLoading(true);
    searchJobs(page + 1, pageSize);
  };
  const handlePrevPage = () => {
    setPage(prev => Math.max(1, prev - 1));
    setLoading(true);
    searchJobs(page - 1, pageSize);
  };
  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
    setLoading(true);
    searchJobs(1, Number(e.target.value));
  };

  // Get matched jobs with scores
  const matchedJobs = useMemo(() => {
    if (loading) return [];
    let filteredJobs = jobs;
    filteredJobs = filteredJobs.filter(job => {
      if (searchFilters.keywords) {
        const keywordMatch =
          job.title.toLowerCase().includes(searchFilters.keywords.toLowerCase()) ||
          job.description.toLowerCase().includes(searchFilters.keywords.toLowerCase()) ||
          (job.requiredSkills || []).some(skill =>
            skill.toLowerCase().includes(searchFilters.keywords.toLowerCase())
          );
        if (!keywordMatch) return false;
      }
      if (searchFilters.jobType !== 'All' && job.jobType !== searchFilters.jobType) {
        return false;
      }
      if (searchFilters.remote && !job.remote) {
        return false;
      }
      if (searchFilters.useMySkills && user?.skills?.length > 0) {
        const userSkills = user.skills.map(s => s.name);
        const skillMatches = (job.requiredSkills || []).filter(skill =>
          userSkills.some(userSkill =>
            userSkill.toLowerCase() === skill.toLowerCase()
          )
        ).length;
        if (skillMatches < searchFilters.minSkillMatch) {
          return false;
        }
      }
      return true;
    });
    // Calculate match scores and sort
    const jobsWithScores = filteredJobs.map(job => {
      const jobData = { ...job };
      jobData.matchData = user ? calculateJobMatch(user, jobData) : null;
      jobData.shortDescription = getShortDescription(job.description);
      return jobData;
    });
    return jobsWithScores.sort((a, b) => {
      if (!a.matchData && !b.matchData) return 0;
      if (!a.matchData) return 1;
      if (!b.matchData) return -1;
      return b.matchData.score - a.matchData.score;
    });
  }, [user, searchFilters, jobs, loading]);

  // Add handleLogin and handleLogout
  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('profile');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={currentView === 'profile' ? (
            <ProfileView user={user} setUser={setUser} />
          ) : (
            <JobsView
              user={user}
              searchFilters={searchFilters}
              setSearchFilters={setSearchFilters}
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              jobs={jobs}
              setJobs={setJobs}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
              pagination={pagination}
              setPagination={setPagination}
              jobsAPI={jobsAPI}
            />
          )} />
          <Route path="/job/:jobId" element={<JobDetail />} />
        </Routes>
      </div>
    </div>
  );
}

// Wrap the App component with Router
const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;