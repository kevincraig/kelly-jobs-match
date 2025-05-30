import React, { useState } from 'react';
import { Search, X, Star } from 'lucide-react';

const SearchFilters = ({
  searchFilters,
  setSearchFilters,
  loading,
  onSearch,
  suggestions = [],
  onKeywordChange,
  onClear
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="mb-4">
      {/* Search Mode Toggle - Prominent */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col md:flex-row md:items-center md:space-x-8">
        <span className="font-semibold text-kelly mb-2 md:mb-0 font-sans">Search Mode:</span>
        <label className="flex items-center space-x-2 mr-6">
          <input
            type="radio"
            name="searchMode"
            checked={!searchFilters.useMySkills}
            onChange={() => setSearchFilters(prev => ({ 
              ...prev, 
              useMySkills: false,
              keywords: ''
            }))}
            className="form-radio text-kelly"
          />
          <span className="text-kelly font-medium font-sans">Keyword Search</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            name="searchMode"
            checked={searchFilters.useMySkills}
            onChange={() => setSearchFilters(prev => ({ 
              ...prev, 
              useMySkills: true,
              keywords: ''
            }))}
            className="form-radio text-kelly"
          />
          <span className="text-kelly font-medium flex items-center font-sans"><Star className="h-4 w-4 mr-1 text-kelly" />Find Jobs Based on My Skills</span>
        </label>
      </div>
      {/* Keyword Search */}
      {!searchFilters.useMySkills && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by keywords..."
            value={searchFilters.keywords}
            onChange={e => {
              setSearchFilters(prev => ({ ...prev, keywords: e.target.value }));
              onKeywordChange && onKeywordChange(e.target.value);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchFilters.keywords && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              <X className="h-5 w-5" />
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
                  onMouseDown={() => {
                    setSearchFilters(prev => ({ ...prev, keywords: s }));
                    onKeywordChange && onKeywordChange(s);
                    setShowSuggestions(false);
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Job Type Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
        <select
          value={searchFilters.jobType}
          onChange={e => setSearchFilters(prev => ({ ...prev, jobType: e.target.value }))}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="All">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Temporary">Temporary</option>
        </select>
      </div>
      {/* Remote Filter */}
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={searchFilters.remote}
            onChange={e => setSearchFilters(prev => ({ ...prev, remote: e.target.checked }))}
            className="mr-2"
          />
          <span className="text-sm font-medium">Remote Only</span>
        </label>
      </div>
      {/* Skills Match Filter */}
      {searchFilters.useMySkills && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Skills Match
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={searchFilters.minSkillMatch}
            onChange={e => setSearchFilters(prev => ({ ...prev, minSkillMatch: parseInt(e.target.value) }))}
            className="w-full"
          />
          <div className="text-sm text-gray-500 text-center">
            {searchFilters.minSkillMatch}+ skills
          </div>
        </div>
      )}
      <div className="mt-4">
        <button
          onClick={onSearch}
          disabled={loading || (!searchFilters.keywords.trim() && !searchFilters.useMySkills)}
          className="bg-kelly text-white px-6 py-2 rounded-lg hover:bg-kelly-dark disabled:opacity-50 font-bold font-sans"
        >
          {loading ? 'Searching...' : 'Search Jobs'}
        </button>
      </div>
    </div>
  );
};

export default SearchFilters; 