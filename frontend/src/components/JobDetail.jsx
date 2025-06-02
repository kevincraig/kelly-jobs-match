import React, { useContext, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { calculateJobMatch } from '../services/jobMatchingService';

const getMatchStrength = (score) => {
  if (score >= 70) return { label: 'high', color: 'bg-green-500' };
  if (score >= 40) return { label: 'medium', color: 'bg-yellow-400' };
  return { label: 'low', color: 'bg-red-400' };
};

const JobDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job;
  const { user } = useAuth();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Calculate match score only if user is logged in
  const matchScore = useMemo(() => (user && job ? calculateJobMatch(user, job) : null), [user, job]);
  const matchStrength = matchScore ? getMatchStrength(matchScore.score) : null;

  if (!job) {
    return <div className="p-8">No job data found.</div>;
  }
  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-8 mt-8">
      <button onClick={() => navigate(-1)} className="text-kelly bg-transparent hover:bg-transparent hover:underline mb-4 px-0 py-0 font-medium text-base text-left">&larr; Back to Results</button>
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
      {/* Match Score Section */}
      {user && matchScore && (
        <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
          <div className="flex items-center mb-2">
            <span className={`inline-block w-3 h-3 rounded-full mr-2 ${matchStrength.color}`}></span>
            <span className="font-semibold text-gray-800">Job match is <span className={`capitalize font-bold ${matchStrength.color}`}>{matchStrength.label}</span></span>
            <span className="ml-3 text-sm text-gray-500">({matchScore.score}%)</span>
          </div>
          <div className="text-gray-700 mb-2">
            Your profile matches {matchStrength.label === 'high' ? 'most' : matchStrength.label === 'medium' ? 'several' : 'few'} of the required qualifications.
          </div>
          <details className="bg-white border border-gray-200 rounded p-2 mt-1">
            <summary className="cursor-pointer text-xs text-gray-500">Show match details</summary>
            <ul className="text-xs text-gray-700 mt-2 space-y-1">
              {matchScore.factors.map((factor, idx) => (
                <li key={idx}>• {factor}</li>
              ))}
            </ul>
          </details>
        </div>
      )}
      {/* End Match Score Section */}
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