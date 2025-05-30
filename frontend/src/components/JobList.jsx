import React from 'react';
import JobCard from './JobCard';

const JobList = ({ jobs, keywords, onJobClick, loading, error, emptyStateMessage }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Looking for jobs...</p>
      </div>
    );
  }
  if (error) {
    return <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>;
  }
  if (!jobs.length) {
    return <div className="bg-white rounded-lg shadow p-8 text-center">{emptyStateMessage}</div>;
  }
  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <JobCard key={job.id} job={job} keywords={keywords} onClick={() => onJobClick(job)} />
      ))}
    </div>
  );
};

export default JobList; 