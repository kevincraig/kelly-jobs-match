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
    try {
      console.log('Attempting to get jobs from Redis cache...');
      const jobs = await redis.get(CACHE_KEYS.JOBS);
      if (jobs) {
        const parsedJobs = JSON.parse(jobs);
        console.log(`Successfully retrieved ${parsedJobs.length} jobs from Redis cache`);
        console.log('Sample job from cache:', parsedJobs[0] ? {
          title: parsedJobs[0].title,
          location: parsedJobs[0].location,
          jobType: parsedJobs[0].jobType
        } : null);
        return parsedJobs;
      } else {
        console.log('No jobs found in Redis cache');
        return null;
      }
    } catch (error) {
      console.error('Error getting jobs from Redis:', error);
      return null;
    }
  },

  // Set jobs in cache
  async setJobs(jobs) {
    try {
      console.log(`Attempting to cache ${jobs.length} jobs in Redis...`);
      await redis.setex(
        CACHE_KEYS.JOBS,
        CACHE_TTL.JOBS,
        JSON.stringify(jobs)
      );
      console.log(`Successfully cached ${jobs.length} jobs in Redis`);
      console.log('Sample job being cached:', jobs[0] ? {
        title: jobs[0].title,
        location: jobs[0].location,
        jobType: jobs[0].jobType
      } : null);
    } catch (error) {
      console.error('Error setting jobs in Redis:', error);
    }
  },

  // Search jobs with filters
  async searchJobs(filters, page = 1, pageSize = 10) {
    try {
      console.log('Redis search called with filters:', filters);
      const jobs = await this.getJobs();
      if (!jobs) {
        console.log('No jobs found in Redis');
        return null;
      }
      console.log(`Found ${jobs.length} total jobs in Redis`);

      let filteredJobs = [...jobs];

      // --- Synonym map for job search ---
      const synonymMap = {
        'therapist': ['slp', 'speech language pathologist', 'counselor', 'psychologist', 'physical therapist', 'occupational therapist'],
        'slp': ['speech language pathologist', 'therapist'],
        'counselor': ['therapist', 'psychologist'],
        'psychologist': ['therapist', 'counselor'],
        'pt': ['physical therapist', 'therapist'],
        'ot': ['occupational therapist', 'therapist'],
        // Add more as needed
      };

      // --- Levenshtein distance for fuzzy matching ---
      function levenshtein(a, b) {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
          for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
              matrix[i][j] = matrix[i - 1][j - 1];
            } else {
              matrix[i][j] = Math.min(
                matrix[i - 1][j - 1] + 1, // substitution
                matrix[i][j - 1] + 1,     // insertion
                matrix[i - 1][j] + 1      // deletion
              );
            }
          }
        }
        return matrix[b.length][a.length];
      }

      // --- Enhanced keyword filter ---
      if (filters.keywords) {
        const keywordLower = filters.keywords.toLowerCase();
        // Expand with synonyms
        let synonyms = [keywordLower];
        if (synonymMap[keywordLower]) {
          synonyms = synonyms.concat(synonymMap[keywordLower]);
        }
        // Remove duplicates
        synonyms = [...new Set(synonyms)];

        console.log(`Filtering Redis jobs by keyword(s):`, synonyms);
        console.log('Sample job titles before filtering:', filteredJobs.slice(0, 3).map(j => j.title));

        // Score-based filtering
        const scoredJobs = filteredJobs.map(job => {
          let score = 0;
          let reasons = [];
          const title = job.title ? job.title.toLowerCase() : '';
          const desc = job.description ? job.description.toLowerCase() : '';
          const skills = (job.requiredSkills || []).map(skill => skill.toLowerCase());

          synonyms.forEach(syn => {
            // Exact match in title
            if (title === syn) { score += 4; reasons.push(`exact title match: ${syn}`); }
            // Partial match in title
            else if (title.includes(syn)) { score += 3; reasons.push(`partial title match: ${syn}`); }
            // Exact match in skills
            if (skills.includes(syn)) { score += 3; reasons.push(`exact skill match: ${syn}`); }
            // Partial match in skills
            else if (skills.some(skill => skill.includes(syn))) { score += 2; reasons.push(`partial skill match: ${syn}`); }
            // Exact match in description
            if (desc === syn) { score += 2; reasons.push(`exact desc match: ${syn}`); }
            // Partial match in description
            else if (desc.includes(syn)) { score += 1; reasons.push(`partial desc match: ${syn}`); }
            // Fuzzy match (Levenshtein)
            if (title && levenshtein(title, syn) <= 2) { score += 1; reasons.push(`fuzzy title match: ${syn}`); }
            if (skills.some(skill => levenshtein(skill, syn) <= 2)) { score += 1; reasons.push(`fuzzy skill match: ${syn}`); }
          });

          return { job, score, reasons };
        });

        // Only keep jobs with score >= 2
        const filteredScoredJobs = scoredJobs.filter(j => j.score >= 2);
        // Debug log for first 5 matches
        filteredScoredJobs.slice(0, 5).forEach((j, idx) => {
          console.log(`[KeywordScore] Match #${idx+1}:`, {
            title: j.job.title,
            score: j.score,
            reasons: j.reasons
          });
        });
        filteredJobs = filteredScoredJobs.map(j => j.job);

        console.log(`After Redis keyword score filter: ${filteredJobs.length} jobs`);
        if (filteredJobs.length > 0) {
          console.log('First matching Redis job:', {
            title: filteredJobs[0].title,
            location: filteredJobs[0].location,
            jobType: filteredJobs[0].jobType
          });
        } else {
          console.log('No jobs matched the keyword score filter');
          console.log('Sample job titles that were checked:', jobs.slice(0, 5).map(j => j.title));
        }
      }

      if (filters.jobType && filters.jobType !== 'All') {
        console.log(`Filtering Redis jobs by type: ${filters.jobType}`);
        filteredJobs = filteredJobs.filter(job => job.jobType === filters.jobType);
        console.log(`After Redis job type filter: ${filteredJobs.length} jobs`);
      }

      // Only apply remote filter if explicitly set to 'true'
      console.log('[DEBUG] filters.remote value:', filters.remote, 'type:', typeof filters.remote);
      if (filters.remote === 'true') {
        console.log('Filtering Redis jobs for remote only');
        filteredJobs = filteredJobs.filter(job => job.remote);
        console.log(`After Redis remote filter: ${filteredJobs.length} jobs`);
      } else {
        console.log('Not filtering by remote status - showing all jobs');
      }

      // Apply skill matching only if useMySkills is true
      if (filters.useMySkills === 'true' && filters.minSkillMatch) {
        console.log(`Filtering Redis jobs by skill match (minimum: ${filters.minSkillMatch})`);
        filteredJobs = filteredJobs.filter(job => {
          const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
          const userSkills = (job.userSkills || []).map(s => s.toLowerCase());
          const matches = jobSkills.filter(skill => 
            userSkills.some(userSkill => userSkill === skill)
          ).length;
          return matches >= parseInt(filters.minSkillMatch);
        });
        console.log(`After skill match filter: ${filteredJobs.length} jobs`);
      }

      // Calculate pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

      console.log('Redis search results:', {
        totalJobs: filteredJobs.length,
        paginatedJobs: paginatedJobs.length,
        currentPage: page,
        totalPages: Math.ceil(filteredJobs.length / pageSize)
      });

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
    } catch (error) {
      console.error('Error searching jobs in Redis:', error);
      return null;
    }
  },

  // Get last feed update timestamp
  async getLastFeedUpdate() {
    try {
      return await redis.get(CACHE_KEYS.JOBS_FEED_LAST_UPDATED);
    } catch (error) {
      console.error('Error getting last feed update from Redis:', error);
      return null;
    }
  },

  // Set last feed update timestamp
  async setLastFeedUpdate(timestamp) {
    try {
      await redis.setex(
        CACHE_KEYS.JOBS_FEED_LAST_UPDATED,
        CACHE_TTL.FEED_LAST_UPDATED,
        timestamp
      );
    } catch (error) {
      console.error('Error setting last feed update in Redis:', error);
    }
  },

  // Clear all job-related cache
  async clearJobCache() {
    try {
      await redis.del(CACHE_KEYS.JOBS);
      await redis.del(CACHE_KEYS.JOBS_FEED_LAST_UPDATED);
      console.log('Cleared job cache from Redis');
    } catch (error) {
      console.error('Error clearing job cache from Redis:', error);
    }
  }
};

module.exports = redisService; 