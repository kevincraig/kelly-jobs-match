import React from 'react';
import { X, Building2, MapPin, Clock, Briefcase, Star } from 'lucide-react';
import { Job, Skill } from '../types';

type JobDetailProps = {
  job: Job;
  onClose: () => void;
  onApply: (jobId: string) => void;
};

export default function JobDetail({ job, onClose, onApply }: JobDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h2>
              <div className="flex items-center space-x-4 text-gray-600">
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
                    <span>{new Date(job.postedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill: Skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 rounded-full text-sm font-normal bg-kelly-light text-kelly font-sans"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.matchData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                Match Score: {Math.round(job.matchData.score * 100)}%
              </h3>
              {job.matchData.matchedSkills.length > 0 && (
                <div className="mb-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Matched Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matchData.matchedSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {job.matchData.missingSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Missing Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matchData.missingSkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800"
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onApply(job.id)}
              className="px-4 py-2 bg-kelly text-white rounded-lg hover:bg-kelly-700 transition-colors"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 