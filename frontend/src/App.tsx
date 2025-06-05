import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import SkillsModal from './components/SkillsModal';
import ProfileView from './components/ProfileView';
import JobDetail from './components/JobDetail';
import ResetPassword from './components/ResetPassword';
import LoginForm from './components/LoginForm';
import { AuthProvider } from './contexts/AuthContext';
import { Job, SearchFilters, Skill } from './types';
import { useAmplifyAuth } from './hooks/useAmplifyAuth';
import { useJobs } from './hooks/useJobs';
import JobCard from './components/JobCard';
import SearchFiltersComponent from './components/SearchFilters';
import Header from './components/Header';

const App: React.FC = () => {
  const { user, loading: authLoading, signIn, signOut } = useAmplifyAuth();
  const { jobs, loading: jobsLoading, searchJobs } = useJobs();
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    keywords: '',
    jobType: 'full-time',
    remote: false,
    useMySkills: false
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [currentView, setCurrentView] = useState<'profile' | 'jobs'>('jobs');

  const handleSearch = async () => {
    await searchJobs(searchFilters, 1, 10);
  };

  const handleClear = () => {
    setSearchFilters({
      keywords: '',
      jobType: 'full-time',
      remote: false,
      useMySkills: false
    });
    searchJobs({
      keywords: '',
      jobType: 'full-time',
      remote: false,
      useMySkills: false
    }, 1, 10);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handleSkillsSave = async (skills: Skill[]) => {
    // TODO: Implement skill saving logic
    setIsSkillsModalOpen(false);
  };

  const jobTypeUIToBackend = (uiValue: string): string => {
    switch (uiValue) {
      case 'Full-time': return 'full-time';
      case 'Part-time': return 'part-time';
      case 'Contract': return 'contract';
      case 'Temporary': return 'internship';
      case 'All':
      default:
        return 'full-time';
    }
  };

  const jobTypeBackendToUI = (backendValue: string): string => {
    switch (backendValue) {
      case 'full-time': return 'Full-time';
      case 'part-time': return 'Part-time';
      case 'contract': return 'Contract';
      case 'internship': return 'Temporary';
      default: return 'All';
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          {user && (
            <Header
              currentView={currentView}
              setCurrentView={setCurrentView}
              user={user}
              onLogout={signOut}
            />
          )}
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <Routes>
              <Route
                path="/"
                element={
                  user ? (
                    <div className="flex flex-col gap-6">
                      {/* Search Filters Card */}
                      <div className="bg-white rounded-xl shadow p-6 mb-4">
                        <SearchFiltersComponent
                          searchFilters={{
                            keywords: searchFilters.keywords,
                            jobType: jobTypeBackendToUI(searchFilters.jobType),
                            remote: searchFilters.remote,
                            useMySkills: searchFilters.useMySkills,
                          }}
                          setSearchFilters={(update) => {
                            setSearchFilters((prev) => {
                              const next = typeof update === 'function' ? update({
                                keywords: prev.keywords,
                                jobType: jobTypeBackendToUI(prev.jobType),
                                remote: prev.remote,
                                useMySkills: prev.useMySkills,
                              }) : update;
                              return {
                                keywords: next.keywords,
                                jobType: jobTypeUIToBackend(next.jobType),
                                remote: next.remote,
                                useMySkills: next.useMySkills,
                              };
                            });
                          }}
                          loading={jobsLoading}
                          onSearch={handleSearch}
                          onClear={handleClear}
                        />
                      </div>
                      {/* Jobs List */}
                      <div className="flex flex-col gap-6">
                        {jobsLoading ? (
                          <div>Loading jobs...</div>
                        ) : (
                          jobs.map(job => (
                            <div key={job.id} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <JobCard
                                  job={job}
                                  onClick={handleJobClick}
                                />
                              </div>
                              <div className="mt-4 md:mt-0 md:ml-6 flex-shrink-0 flex items-center justify-end">
                                <a
                                  href={job.applyUrl || job.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition-colors text-lg"
                                >
                                  Apply Now
                                </a>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route path="/profile" element={<ProfileView />} />
              <Route
                path="/jobs/:id"
                element={
                  <JobDetail
                    job={selectedJob || jobs[0]}
                    onClose={() => setSelectedJob(null)}
                    onApply={(jobId) => console.log('Apply to job:', jobId)}
                  />
                }
              />
              <Route
                path="/login"
                element={
                  <div className="min-h-screen flex flex-col md:justify-center md:items-center bg-gray-100">
                    <div className="flex flex-row w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden mx-auto my-12">
                      <LoginForm />
                      {/* Right: Illustration */}
                      <div className="w-1/2 flex flex-col justify-center items-center p-3 object-cover bg-kelly-550">
                        <div className="rounded-3xl w-full h-full object-contain bg-kelly-100">
                          <img
                            src="/login.png"
                            alt="Person searching for a job illustration"
                            className="w-full h-full rounded-2xl"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                }
              />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </main>

          <SkillsModal
            isOpen={isSkillsModalOpen}
            onClose={() => setIsSkillsModalOpen(false)}
            onSave={handleSkillsSave}
            selectedSkills={[]}
            availableSkills={availableSkills}
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 