import React from 'react';
import { Search, X } from 'lucide-react';
import { SearchFilters as SearchFiltersType } from '../types';

interface SearchFiltersProps {
  searchFilters: {
    keywords: string;
    jobType: string;
    remote: boolean;
    useMySkills: boolean;
  };
  setSearchFilters: React.Dispatch<React.SetStateAction<{
    keywords: string;
    jobType: string;
    remote: boolean;
    useMySkills: boolean;
  }>>;
  loading: boolean;
  onSearch: () => void;
  onClear: () => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchFilters,
  setSearchFilters,
  loading,
  onSearch,
  onClear
}) => {
  return (
    <div className="space-y-4">
      {/* Keyword Search */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchFilters.keywords}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, keywords: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSearch();
                }
              }}
              placeholder="Search by job title, skills, or keywords..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kelly focus:border-kelly"
            />
            {searchFilters.keywords && (
              <button
                onClick={onClear}
                className="absolute bg-transparent right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={onSearch}
            disabled={loading}
            className="px-4 py-2 bg-kelly text-white rounded-lg hover:bg-kelly-700 transition-colors disabled:opacity-50"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select
          value={searchFilters.jobType}
          onChange={(e) => setSearchFilters(prev => ({ ...prev, jobType: e.target.value }))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kelly focus:border-kelly"
        >
          <option value="All">All Job Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Temporary">Temporary</option>
        </select>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="remote"
            checked={searchFilters.remote}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, remote: e.target.checked }))}
            className="h-4 w-4 text-kelly focus:ring-kelly border-gray-300 rounded"
          />
          <label htmlFor="remote" className="text-sm text-gray-700">
            Remote jobs only
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="useMySkills"
            checked={searchFilters.useMySkills}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, useMySkills: e.target.checked }))}
            className="h-4 w-4 text-kelly focus:ring-kelly border-gray-300 rounded"
          />
          <label htmlFor="useMySkills" className="text-sm text-gray-700">
            Match my skills
          </label>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters; 