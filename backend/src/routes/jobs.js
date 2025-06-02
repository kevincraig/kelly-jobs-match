const express = require('express');
const { Op } = require('sequelize');
const Job = require('../models/Job');
const User = require('../models/User');
const { calculateDistance, calculateJobMatch } = require('../services/jobMatcher');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const redisService = require('../services/redisService');
const { fetchKellyJobs } = require('../services/jobFeedService');
const { isRoleMatch } = require('../services/jobTaxonomyService');

const router = express.Router();

// Helper function to validate UUID
const isValidUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// GET /api/jobs/feed - Fetch jobs from Kelly Services feed
router.get('/feed', auth, async (req, res) => {
  try {
    // Check if we have cached jobs
    const cachedJobs = await redisService.getJobs();
    const lastUpdate = await redisService.getLastFeedUpdate();
    const now = Date.now();
    
    // If we have cached jobs and they're less than 1 hour old, return them
    if (cachedJobs && lastUpdate && (now - parseInt(lastUpdate)) < 3600000) {
      return res.json({ jobs: cachedJobs });
    }

    // Otherwise, fetch new jobs from Kelly Services
    const jobs = await fetchKellyJobs();
    
    // Cache the new jobs
    await redisService.setJobs(jobs);
    await redisService.setLastFeedUpdate(now.toString());
    
    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Debug endpoint to force feed update
router.get('/feed/update', auth, async (req, res) => {
  try {
    console.log('Forcing feed update...');
    const jobs = await fetchKellyJobs();
    console.log(`Fetched ${jobs.length} jobs from Kelly Services feed`);
    
    if (jobs && jobs.length > 0) {
      console.log('Sample job from feed:', {
        title: jobs[0].title,
        location: jobs[0].location,
        jobType: jobs[0].jobType
      });
    } else {
      console.log('No jobs received from feed');
    }

    console.log('Caching jobs in Redis...');
    await redisService.setJobs(jobs);
    await redisService.setLastFeedUpdate(Date.now().toString());
    
    // Verify the cache
    const cachedJobs = await redisService.getJobs();
    console.log(`Verified cache: ${cachedJobs ? cachedJobs.length : 0} jobs in Redis`);
    
    console.log(`Successfully updated feed with ${jobs.length} jobs`);
    res.json({ message: `Feed updated with ${jobs.length} jobs` });
  } catch (error) {
    console.error('Error updating feed:', error);
    res.status(500).json({ message: 'Error updating feed' });
  }
});

// GET /api/jobs/search - Search jobs with filters
router.get('/search', auth, async (req, res) => {
  try {
    const {
      keywords,
      jobType,
      remote,
      radius = 25,
      useMySkills,
      minSkillMatch,
      page = 1,
      limit = 20
    } = req.query;

    console.log('Search request received with filters:', {
      keywords,
      jobType,
      remote,
      radius,
      useMySkills,
      minSkillMatch: useMySkills === 'true' ? minSkillMatch : undefined,
      page,
      limit
    });

    // Try to get results from Redis cache first
    console.log('Attempting to get results from Redis cache...');
    const cachedResults = await redisService.searchJobs(
      { 
        keywords, 
        jobType, 
        remote,
        useMySkills,
        minSkillMatch: useMySkills === 'true' ? minSkillMatch : undefined
      },
      parseInt(page),
      parseInt(limit)
    );

    if (cachedResults) {
      console.log(`Found ${cachedResults.jobs.length} jobs in cache`);
      console.log('First job from cache:', cachedResults.jobs[0] ? {
        title: cachedResults.jobs[0].title,
        location: cachedResults.jobs[0].location,
        jobType: cachedResults.jobs[0].jobType
      } : null);
      return res.json(cachedResults);
    }

    // If no cached results, fetch from Kelly Services feed
    console.log('No cached results, fetching from Kelly Services feed...');
    const jobs = await fetchKellyJobs();
    
    if (!jobs || jobs.length === 0) {
      console.log('No jobs found in feed');
      return res.json({
        jobs: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalJobs: 0,
          hasNext: false,
          hasPrev: false
        }
      });
    }

    // Apply filters
    let filteredJobs = [...jobs];

    console.log(`Loaded ${jobs.length} jobs from feed`);
    console.log('Sample job titles:', jobs.slice(0, 3).map(j => j.title));

    if (keywords) {
      const keywordLower = keywords.toLowerCase();
      console.log(`Filtering jobs by keyword: ${keywordLower}`);
      filteredJobs = filteredJobs.filter(job => {
        const titleMatch = job.title.toLowerCase().includes(keywordLower);
        const descMatch = job.description.toLowerCase().includes(keywordLower);
        const skillsMatch = (job.requiredSkills || []).some(skill => 
          skill.toLowerCase().includes(keywordLower)
        );
        const matches = titleMatch || descMatch || skillsMatch;
        if (matches) {
          console.log(`Job "${job.title}" matches keyword "${keywords}"`);
          if (titleMatch) console.log('  - Matched in title');
          if (descMatch) console.log('  - Matched in description');
          if (skillsMatch) console.log('  - Matched in skills');
        }
        return matches;
      });
      console.log(`After keyword filter (${keywords}): ${filteredJobs.length} jobs`);
      if (filteredJobs.length > 0) {
        console.log('First matching job:', {
          title: filteredJobs[0].title,
          location: filteredJobs[0].location,
          jobType: filteredJobs[0].jobType
        });
      }
    }

    if (jobType && jobType !== 'All') {
      console.log(`Filtering jobs by type: ${jobType}`);
      filteredJobs = filteredJobs.filter(job => {
        const matches = job.jobType === jobType;
        if (matches) {
          console.log(`Job "${job.title}" matches job type "${jobType}"`);
        }
        return matches;
      });
      console.log(`After job type filter: ${filteredJobs.length} jobs`);
    }

    if (remote === 'true') {
      console.log('Filtering for remote jobs only');
      filteredJobs = filteredJobs.filter(job => {
        const matches = job.remote;
        if (matches) {
          console.log(`Job "${job.title}" is remote`);
        }
        return matches;
      });
      console.log(`After remote filter: ${filteredJobs.length} jobs`);
    }

    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    const response = {
      jobs: paginatedJobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredJobs.length / limit),
        totalJobs: filteredJobs.length,
        hasNext: endIndex < filteredJobs.length,
        hasPrev: page > 1
      }
    };

    console.log('Search response:', {
      totalJobs: filteredJobs.length,
      paginatedJobs: paginatedJobs.length,
      currentPage: response.pagination.currentPage,
      totalPages: response.pagination.totalPages,
      firstJob: paginatedJobs[0] ? {
        title: paginatedJobs[0].title,
        location: paginatedJobs[0].location,
        jobType: paginatedJobs[0].jobType,
        remote: paginatedJobs[0].remote
      } : null
    });

    // Cache the results
    await redisService.setJobs(jobs);

    res.json(response);
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/jobs/matches/:userId - Get recommended jobs for user
router.get('/matches/:userId', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get all active jobs
    const jobs = await Job.findAll({
      where: { isActive: true },
      order: [['postedDate', 'DESC']]
    });

    // Calculate match scores
    const jobsWithScores = jobs.map(job => {
      const jobData = job.toJSON();
      jobData.matchScore = calculateJobMatch(user, jobData);
      
      if (user.latitude && user.longitude && job.latitude && job.longitude) {
        jobData.distance = calculateDistance(
          { lat: user.latitude, lng: user.longitude },
          { lat: job.latitude, lng: job.longitude }
        );
      }
      
      return jobData;
    });

    // Filter by user preferences and sort by match score
    const matchedJobs = jobsWithScores
      .filter(job => {
        // Filter by job type preferences
        if (!user.preferences?.jobTypes?.includes(job.jobType)) return false;
        
        // Filter by location/remote preferences
        if (!user.preferences?.remoteWork && !job.remote) {
          if (job.distance && job.distance > (user.preferences?.maxRadius || 25)) {
            return false;
          }
        }
        
        // Minimum match score threshold
        return job.matchScore.score >= 20;
      })
      .sort((a, b) => b.matchScore.score - a.matchScore.score)
      .slice(0, 50); // Top 50 matches

    res.json({ jobs: matchedJobs });

  } catch (error) {
    console.error('Job matching error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/jobs/:id - Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Filter jobs based on user preferences and role
const filterJobs = (jobs, user) => {
  return jobs.filter(job => {
    // Skip jobs that don't match the user's role
    if (user.role && !isRoleMatch(user.role, job.title, job.category)) {
      return false;
    }

    // Filter by job type if specified
    if (user.preferences?.jobType && job.type !== user.preferences.jobType) {
      return false;
    }

    // Filter by remote work preference
    if (user.preferences?.remoteOnly && !job.remote) {
      return false;
    }

    // Filter by skills - require at least one skill match
    if (user.skills?.length > 0) {
      const normalizedUserSkills = user.skills.map(skill => 
        skill.toLowerCase().trim()
      );
      
      const normalizedJobSkills = job.requiredSkills.map(skill => 
        skill.toLowerCase().trim()
      );
      
      const hasSkillMatch = normalizedUserSkills.some(userSkill =>
        normalizedJobSkills.some(jobSkill => 
          jobSkill === userSkill || 
          jobSkill.includes(userSkill) || 
          userSkill.includes(jobSkill)
        )
      );
      
      if (!hasSkillMatch) {
        return false;
      }
    }

    return true;
  });
};

module.exports = router;