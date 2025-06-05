import React from 'react';
import { Building2, MapPin, Clock, Star, Briefcase } from 'lucide-react';
import { Job, Skill } from '../types';

interface JobCardProps {
  job: Job;
  keywords?: string;
  onClick: (job: Job) => void;
}

interface Salary {
  min?: number;
  max?: number;
  currency?: string;
}

function highlight(text: string, keywords?: string): React.ReactNode {
  if (!keywords) return text;
  const parts = text.split(new RegExp(`(${keywords})`, 'gi'));
  return parts.map((part, i) => 
    part.toLowerCase() === keywords?.toLowerCase() 
      ? <span key={i} className="bg-yellow-200">{part}</span> 
      : part
  );
}

function timeSince(date: string | Date | undefined): string {
  if (!date) return '';
  const now = new Date();
  const posted = new Date(date);
  const seconds = Math.floor((now.getTime() - posted.getTime()) / 1000);
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

const JobCard: React.FC<JobCardProps> = ({ job, keywords, onClick }) => (
  <button 
    className="w-full text-left bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow job-card cursor-pointer" 
    onClick={() => onClick(job)}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(job);
      }
    }}
    aria-label={`View details for ${job.title} position at ${job.company}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {highlight(job.title, keywords)}
        </h3>
        <div className="flex items-center space-x-4 text-gray-600 mb-2">
          <div className="flex items-center">
            <Building2 className="h-4 w-4 mr-1" />
            <span>{highlight(job.company, keywords)}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{highlight(job.remote ? 'Remote' : job.location, keywords)}</span>
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
        <p className="text-gray-700 mb-3">
          {highlight(job.description.substring(0, 200) + '...', keywords)}
        </p>
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {job.requiredSkills.map((skill: Skill) => (
              <span
                key={skill.id}
                className="px-3 py-1 rounded-full text-sm font-normal bg-kelly-light text-kelly font-sans"
              >
                {highlight(skill.name, keywords)}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end space-y-2">
        <button
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onClick(job);
          }}
          className="bg-kelly text-white px-4 py-2 rounded-lg hover:bg-kelly-dark transition-colors font-bold font-sans"
          aria-label={`Apply for ${job.title} position at ${job.company}`}
        >
          Apply Now
        </button>
        {job.salary && (
          <div className="text-sm text-gray-600">
            {typeof job.salary === 'string' ? (
              job.salary
            ) : (job.salary as Salary).min && (job.salary as Salary).max ? (
              `${(job.salary as Salary).currency || 'USD'} ${(job.salary as Salary).min?.toLocaleString()} - ${(job.salary as Salary).max?.toLocaleString()}`
            ) : (
              'Salary not specified'
            )}
          </div>
        )}
      </div>
    </div>
  </button>
);

export default JobCard; 