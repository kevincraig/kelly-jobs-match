import React, { useState } from 'react';
import { useJobs } from '../hooks/useJobs';
import { Job, SearchFilters } from '../types';
import JobCard from './JobCard';
import SearchFiltersComponent from './SearchFilters';

export default function JobsView() {
  const { jobs, loading, error, pagination, searchJobs } = useJobs();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    keywords: '',
    jobType: 'full-time',
    remote: false,
    useMySkills: false
  });

  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
    setPage(1);
    searchJobs(filters, 1, pageSize);
  };

  const handleClear = () => {
    setSearchFilters({
      keywords: '',
      jobType: 'full-time',
      remote: false,
      useMySkills: false
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    searchJobs(searchFilters, newPage, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    searchJobs(searchFilters, 1, newPageSize);
  };

  const handleJobClick = (job: Job) => {
    // Handle job click
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SearchFiltersComponent 
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
          loading={loading}
          onSearch={() => handleSearch(searchFilters)}
          onClear={handleClear}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: Job) => (
            <JobCard
              key={job.id}
              job={job}
              onClick={handleJobClick}
            />
          ))}
        </div>
      )}
      {pagination && (
        <div className="mt-8 flex justify-between items-center">
          <div>
            <span className="text-gray-600">
              Showing {pagination.startIndex} to {pagination.endIndex} of{' '}
              {pagination.totalItems} results
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 