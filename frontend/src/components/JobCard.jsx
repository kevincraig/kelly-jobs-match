import React from 'react';
import { Building2, MapPin, Clock, Star, Briefcase } from 'lucide-react';

function highlight(text, keywords) {
  if (!keywords) return text;
  const regex = new RegExp(`(${keywords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
  );
}

// Utility to format time since posted
function timeSince(date) {
  if (!date) return '';
  const now = new Date();
  const posted = new Date(date);
  const seconds = Math.floor((now - posted) / 1000);
  if (isNaN(seconds)) return '';
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

const JobCard = ({ job, keywords, onClick }) => (
  <div className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow job-card cursor-pointer" onClick={onClick}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">{highlight(job.title, keywords)}</h3>
        <div className="flex items-center space-x-4 text-gray-600 mb-2">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 mr-1" />
            <span>{job.company}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{job.remote ? 'Remote' : job.location}</span>
            {job.distance && (
              <span className="text-xs ml-1">({job.distance.toFixed(1)} mi)</span>
            )}
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-1" />
            <span>{job.jobType}</span>
          </div>
          {job.postedDate && (
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span>{timeSince(job.postedDate)}</span>
            </div>
          )}
        </div>
        <p className="text-gray-700 mb-3">{highlight(job.shortDescription || '', keywords)}</p>
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {job.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-normal bg-kelly-light text-kelly font-sans`}
              >
                {highlight(skill, keywords)}
              </span>
            ))}
          </div>
        )}
        {/* Always show match metrics */}
        <div className="flex flex-col space-y-1 text-sm text-gray-600 mt-2">
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-400 mr-1" />
            <span>Match Score: {Math.round(job.matchScore?.score || 0)}%</span>
          </div>
          {job.matchScore?.factors && (
            <div className="flex flex-col space-y-1">
              {job.matchScore.factors.map((factor, index) => (
                <div key={index} className="text-xs text-gray-500">{factor}</div>
              ))}
            </div>
          )}
          {/* Debug: Show all match metrics */}
          <details
            className="bg-gray-50 border border-gray-200 rounded p-2 mt-1"
            onClick={e => e.stopPropagation()}
          >
            <summary className="cursor-pointer text-xs text-gray-500">Show Match Metrics</summary>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(job.matchScore, null, 2)}</pre>
          </details>
          {/* Debug: Show raw job data */}
          <details
            className="bg-gray-50 border border-gray-200 rounded p-2 mt-1"
            onClick={e => e.stopPropagation()}
          >
            <summary className="cursor-pointer text-xs text-gray-500">Show Raw Job Data</summary>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(job, null, 2)}</pre>
          </details>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <a
          href={job.applyUrl || job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-kelly text-white px-4 py-2 rounded-lg hover:bg-kelly-dark transition-colors font-bold font-sans"
          onClick={e => e.stopPropagation()}
        >
          Apply Now
        </a>
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
      </div>
    </div>
  </div>
);

export default JobCard; 