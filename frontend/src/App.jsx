import React, { useState, useEffect, useMemo } from 'react';
import { User, Search, LogOut, Star, Plus, X, Filter, MapPin, Clock, Building2, Check } from 'lucide-react';
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
import SkillsModal from './components/SkillsModal';
import ProfileView from './components/ProfileView';
import Header from './components/Header.jsx';
import JobDetail from './components/JobDetail';
import LoginForm from './components/LoginForm';

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
    minSkillMatch: 3
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
  const [showSkillsModal, setShowSkillsModal] = useState(false);

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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-kelly mx-auto"></div>
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
            <ProfileView user={user} setUser={setUser} onShowSkillsModal={() => setShowSkillsModal(true)} />
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
        {/* Skills Modal (global, not inside ProfileView) */}
        <SkillsModal 
          showModal={showSkillsModal}
          setShowModal={setShowSkillsModal}
          userSkills={user?.skills || []}
          onAddSkills={(newSkills) => {
            // Add new skills to user profile (update user state)
            setUser(prev => ({
              ...prev,
              skills: [
                ...(prev?.skills || []),
                ...newSkills.filter(newSkill =>
                  !(prev?.skills || []).find(existingSkill => existingSkill.name === newSkill.name)
                )
              ]
            }));
          }}
        />
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