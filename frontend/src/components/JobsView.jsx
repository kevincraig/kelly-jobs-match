import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, Building2, MapPin, Clock } from 'lucide-react';
import JobList from './JobList';
import PaginationControls from './PaginationControls';
import SearchFilters from './SearchFilters';
import { calculateJobMatch } from '../services/jobMatchingService';
import { searchSkills } from '../utils/skillsTaxonomy';

function getShortDescription(html) {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  const text = div.textContent || div.innerText || '';
  return text.length > 200 ? text.slice(0, 200) + '...' : text;
}

const JobsView = ({
  user,
  searchFilters,
  setSearchFilters,
  page,
  setPage,
  pageSize,
  setPageSize,
  jobs,
  setJobs,
  loading,
  setLoading,
  error,
  setError,
  pagination,
  setPagination,
  jobsAPI
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedJobs', JSON.stringify(jobs));
  }, [jobs]);

  // Get matched jobs (no scoring/filtering, just display as received)
  const matchedJobs = useMemo(() => {
    if (loading) return [];
    return jobs;
  }, [jobs, loading]);

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

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center text-kelly font-sans">
          <Search className="h-5 w-5 mr-2 text-kelly" />
          Job Search
        </h2>
        <SearchFilters
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          loading={loading}
          onSearch={handleSearchClick}
          suggestions={suggestions}
          onKeywordChange={handleKeywordChange}
          onClear={handleClearKeywords}
        />
      </div>
      {/* Job Results */}
      <JobList
        jobs={matchedJobs}
        keywords={searchFilters.keywords}
        onJobClick={job => navigate(`/job/${job.id}`, { state: { job } })}
        loading={loading}
        error={error}
        emptyStateMessage={
          searchFilters.useMySkills
            ? "No jobs match your current skills and criteria. Try adjusting your minimum skill matches or adding more skills to your profile."
            : "Try adjusting your search criteria or keywords to find more opportunities."
        }
      />
      <PaginationControls
        page={page}
        pageSize={pageSize}
        onPrev={handlePrevPage}
        onNext={handleNextPage}
        onPageSizeChange={handlePageSizeChange}
        hasNext={pagination.hasNext}
        hasPrev={pagination.hasPrev}
      />
    </div>
  );
};

export default JobsView;