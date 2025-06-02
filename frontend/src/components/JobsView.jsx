import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import JobList from './JobList';
import PaginationControls from './PaginationControls';
import SearchFilters from './SearchFilters';
import { calculateJobMatch } from '../services/jobMatchingService';

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

  // Manual search for keyword search mode
  const handleSearchClick = () => {
    setPage(1);
    setLoading(true);
    searchJobs(1, pageSize);
  };

  const handleClearKeywords = () => {
    setSearchFilters(prev => ({ ...prev, keywords: '' }));
  };

  const searchJobs = async (newPage = page, newPageSize = pageSize) => {
    if (!searchFilters.useMySkills && !searchFilters.keywords && searchFilters.jobType === 'All') {
      console.log('No search criteria provided');
      setJobs([]);
      return; // No search criteria
    }
    setLoading(true);
    setError(null);
    try {
      // Create search params object, only including non-empty values
      const searchParams = {
        keywords: searchFilters.keywords?.trim() || '',
        jobType: searchFilters.jobType || 'All',
        remote: searchFilters.remote ? 'true' : 'false',
        radius: searchFilters.radius?.toString() || '25',
        useMySkills: searchFilters.useMySkills ? 'true' : 'false',
        page: newPage.toString(),
        limit: newPageSize.toString()
      };

      // Only add minSkillMatch if useMySkills is true
      if (searchFilters.useMySkills) {
        searchParams.minSkillMatch = searchFilters.minSkillMatch?.toString() || '3';
      }

      // Remove empty values
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] === '' || searchParams[key] === undefined) {
          delete searchParams[key];
        }
      });

      console.log('Searching jobs with filters:', searchParams);
      const response = await jobsAPI.searchJobs(searchParams);
      
      // Log the full response for debugging
      console.log('Full search response:', {
        status: response.status,
        totalJobs: response.jobs?.length || 0,
        pagination: response.pagination,
        firstJob: response.jobs?.[0] || null,
        searchParams: searchParams,
        response: response
      });

      if (!response.jobs) {
        console.error('No jobs array in response:', response);
        console.log('Response structure:', {
          keys: Object.keys(response),
          dataKeys: response.data ? Object.keys(response.data) : null
        });
      }

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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold flex items-center text-kelly font-sans">
            <Search className="h-5 w-5 mr-2 text-kelly" />
            Job Search
          </h2>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                await jobsAPI.updateFeed();
                await searchJobs(1, pageSize);
              } catch (error) {
                console.error('Error updating feed:', error);
                setError('Failed to update job feed. Please try again.');
              } finally {
                setLoading(false);
              }
            }}
            className="px-3 py-1 text-sm bg-kelly-100 text-kelly-700 rounded hover:bg-kelly-200 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Jobs
          </button>
        </div>
        <SearchFilters
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          loading={loading}
          onSearch={handleSearchClick}
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