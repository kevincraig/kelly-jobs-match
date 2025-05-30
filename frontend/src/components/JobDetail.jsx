import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock } from 'lucide-react';

const JobDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;
  if (!job) {
    return <div className="p-8">No job data found.</div>;
  }
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-kelly hover:underline">&larr; Back to Results</button>
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
            <span key={index} className="px-2 py-1 bg-kelly-light text-kelly text-sm rounded-full">{skill}</span>
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
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="bg-kelly text-white px-4 py-2 rounded-lg hover:bg-kelly-dark transition-colors">Apply Now</a>
        )}
      </div>
    </div>
  );
};

export default JobDetail; 