import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { calculateJobMatch } from './services/jobMatchingService';
import JobsView from './components/JobsView';
import SkillsModal from './components/SkillsModal';
import ProfileView from './components/ProfileView';
import Header from './components/Header';
import JobDetail from './components/JobDetail';
import LoginForm from './components/LoginForm';
import ResetPassword from './components/ResetPassword';
import { userAPI, jobsAPI, authAPI } from './services/api';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import usePersistentState from './hooks/usePersistentState';

// Main App Component
const App = () => {
  const [currentView, setCurrentView] = useState('profile');
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
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
  const [showSkillsModal, setShowSkillsModal] = useState(false);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(jobs));
  }, [jobs]);

  // Restore authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[Auth] Checking authentication state, token exists:', !!token);
    if (token) {
      let userResponse; // Store the initial user response
      console.log('[Auth] Token found, fetching current user');
      authAPI.getCurrentUser()
        .then(response => {
          console.log('[Auth] Current user fetched successfully:', {
            id: response.id,
            email: response.email,
            firstName: response.firstName
          });
          userResponse = response; // Save the response
          setUser(response);
          setIsAuthenticated(true);
          // Load full user profile after authentication
          console.log('[Auth] Fetching full user profile');
          return userAPI.getProfile();
        })
        .then(profileResponse => {
          if (profileResponse) {
            console.log('[Auth] Full profile fetched successfully');
            // Merge the profile data with the user data
            const mergedUserData = {
              ...userResponse, // Use the stored user response
              ...profileResponse,
              skills: profileResponse.skills || [],
              experience: profileResponse.experience || [],
              preferences: profileResponse.preferences || {}
            };
            console.log('[Auth] User data merged successfully');
            setUser(mergedUserData);
            setProfileData(mergedUserData);
          }
        })
        .catch((error) => {
          console.error('[Auth] Error during authentication:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('[Auth] No token found, user is not authenticated');
      setLoading(false);
    }
  }, []);

  // Optimize auto-save profileData
  useEffect(() => {
    if (!profileData) return;
    
    const saveProfile = async () => {
      try {
        const response = await userAPI.updateProfile(profileData);
        if (response.user) {
          // Only update if there are actual changes
          const hasChanges = JSON.stringify(response.user) !== JSON.stringify(user);
          if (hasChanges) {
            setUser(prev => ({ ...prev, ...response.user }));
          }
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveProfile, 1000);
    return () => clearTimeout(timeoutId);
  }, [profileData]);

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
    console.log('[Login] Setting token and user data');
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);

    // Fetch and merge full profile after login
    console.log('[Login] Fetching full profile after login');
    userAPI.getProfile().then(profileResponse => {
      if (profileResponse) {
        console.log('[Login] Full profile fetched, merging data');
        const mergedUserData = {
          ...userData,
          ...profileResponse,
          skills: profileResponse.skills || [],
          experience: profileResponse.experience || [],
          preferences: profileResponse.preferences || {}
        };
        setUser(mergedUserData);
        setProfileData(mergedUserData);
      }
    }).catch(error => {
      console.error('[Login] Error fetching profile:', error);
    });
  };

  const handleLogout = () => {
    console.log('[Logout] Clearing authentication state');
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
          <Route path="/" element={
            isAuthenticated ? (
              currentView === 'profile' ? (
                <ProfileView 
                  user={user} 
                  onUpdateProfile={(updater) => {
                    const updatedData = typeof updater === 'function' 
                      ? updater(user)
                      : updater;
                    setProfileData(updatedData);
                  }} 
                />
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
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginForm onLogin={handleLogin} />
            )
          } />
          <Route path="/job/:jobId" element={
            isAuthenticated ? (
              <JobDetail />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
        {isAuthenticated && (
          <SkillsModal 
            showModal={showSkillsModal}
            setShowModal={setShowSkillsModal}
            userSkills={profileData?.skills || []}
            setProfileData={setProfileData}
          />
        )}
      </div>
    </div>
  );
};

// Wrap the App component with Router and AuthProvider
const AppWithRouter = () => (
  <Router>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Router>
);

export default AppWithRouter;