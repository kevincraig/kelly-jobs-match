import React from 'react';
import { Building2, MapPin, Clock, Star } from 'lucide-react';

function highlight(text, keywords) {
  if (!keywords) return text;
  const regex = new RegExp(`(${keywords.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
  );
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
            <Clock className="h-4 w-4 mr-1" />
            <span>{job.jobType}</span>
          </div>
        </div>
        <p className="text-gray-700 mb-3">{highlight(job.shortDescription || '', keywords)}</p>
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {job.requiredSkills.map((skill, index) => (
              <span
                key={index}
                className={`px-2 py-1 text-sm rounded-full ${keywords && skill.toLowerCase().includes(keywords.toLowerCase()) ? 'bg-yellow-200 text-blue-800' : 'bg-blue-100 text-blue-800'}`}
              >
                {highlight(skill, keywords)}
              </span>
            ))}
          </div>
        )}
        {job.matchData && (
          <div className="flex flex-col space-y-1 text-sm text-gray-600 mt-2">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-yellow-400 mr-1" />
              <span>Match Score: {Math.round(job.matchData.score)}%</span>
            </div>
            {job.matchData.matchingSkills && job.matchData.matchingSkills.length > 0 && (
              <div className="flex items-center">
                <span className="font-medium">Matching Skills:</span>
                <span className="ml-1">{job.matchData.matchingSkills.join(', ')}</span>
              </div>
            )}
            {/* Debug: Show all match metrics */}
            <details
              className="bg-gray-50 border border-gray-200 rounded p-2 mt-1"
              onClick={e => e.stopPropagation()}
            >
              <summary className="cursor-pointer text-xs text-gray-500">Show Match Metrics</summary>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(job.matchData, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
      <div className="flex flex-col items-end space-y-2">
        <a
          href={job.applyUrl || job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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