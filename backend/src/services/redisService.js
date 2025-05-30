const Redis = require('ioredis');
const config = require('../config');

const redis = new Redis(config.redis.url);

const CACHE_KEYS = {
  JOBS: 'jobs:all',
  JOBS_FEED_LAST_UPDATED: 'jobs:feed:last_updated'
};

const CACHE_TTL = {
  JOBS: 3600, // 1 hour in seconds
  FEED_LAST_UPDATED: 86400 // 24 hours in seconds
};

const redisService = {
  // Get all jobs from cache
  async getJobs() {
    const jobs = await redis.get(CACHE_KEYS.JOBS);
    return jobs ? JSON.parse(jobs) : null;
  },

  // Set jobs in cache
  async setJobs(jobs) {
    await redis.setex(
      CACHE_KEYS.JOBS,
      CACHE_TTL.JOBS,
      JSON.stringify(jobs)
    );
  },

  // Get last feed update timestamp
  async getLastFeedUpdate() {
    return await redis.get(CACHE_KEYS.JOBS_FEED_LAST_UPDATED);
  },

  // Set last feed update timestamp
  async setLastFeedUpdate(timestamp) {
    await redis.setex(
      CACHE_KEYS.JOBS_FEED_LAST_UPDATED,
      CACHE_TTL.FEED_LAST_UPDATED,
      timestamp
    );
  },

  // Clear jobs cache
  async clearJobsCache() {
    await redis.del(CACHE_KEYS.JOBS);
  },

  // Search jobs with filters
  async searchJobs(filters, page = 1, pageSize = 10) {
    const jobs = await this.getJobs();
    if (!jobs) return null;

    let filteredJobs = [...jobs];

    // Apply filters
    if (filters.keywords) {
      const keywordLower = filters.keywords.toLowerCase();
      filteredJobs = filteredJobs.filter(job => 
        job.title.toLowerCase().includes(keywordLower) ||
        job.description.toLowerCase().includes(keywordLower) ||
        (job.requiredSkills || []).some(skill => 
          skill.toLowerCase().includes(keywordLower)
        )
      );
    }

    if (filters.jobType && filters.jobType !== 'All') {
      filteredJobs = filteredJobs.filter(job => job.jobType === filters.jobType);
    }

    if (filters.remote) {
      filteredJobs = filteredJobs.filter(job => job.remote);
    }

    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return {
      jobs: paginatedJobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredJobs.length / pageSize),
        totalJobs: filteredJobs.length,
        hasNext: endIndex < filteredJobs.length,
        hasPrev: page > 1
      }
    };
  }
};

module.exports = redisService; 