const express = require('express');
const { Op } = require('sequelize');
const Job = require('../models/Job');
const User = require('../models/User');
const { calculateDistance, calculateJobMatch } = require('../services/jobMatcher');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const redisService = require('../services/redisService');
const { fetchKellyJobs } = require('../services/jobFeedService');

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

// GET /api/jobs/search - Search jobs with filters
router.get('/search', auth, async (req, res) => {
  try {
    const {
      keywords,
      jobType,
      remote,
      radius = 25,
      useMySkills,
      minSkillMatch = 1,
      page = 1,
      limit = 20
    } = req.query;

    // Try to get results from Redis cache first
    const cachedResults = await redisService.searchJobs(
      { keywords, jobType, remote },
      parseInt(page),
      parseInt(limit)
    );

    if (cachedResults) {
      return res.json(cachedResults);
    }

    // If no cached results, fall back to database search
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let whereClause = { isActive: true };

    if (keywords && useMySkills !== 'true') {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${keywords}%` } },
        { description: { [Op.iLike]: `%${keywords}%` } },
        { company: { [Op.iLike]: `%${keywords}%` } }
      ];
    }

    if (jobType && jobType !== 'All') {
      whereClause.jobType = jobType;
    }

    if (remote === 'true') {
      whereClause.remote = true;
    }

    const offset = (page - 1) * limit;

    let jobs = await Job.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['postedDate', 'DESC']]
    });

    // Skills-based filtering
    if (useMySkills === 'true' && user.skills?.length > 0) {
      const userSkills = user.skills.map(s => s.name);
      jobs.rows = jobs.rows.filter(job => {
        const skillMatches = job.requiredSkills.filter(skill =>
          userSkills.some(userSkill => 
            userSkill.toLowerCase() === skill.toLowerCase()
          )
        ).length;
        return skillMatches >= parseInt(minSkillMatch);
      });
    }

    // Calculate match scores and apply location filtering
    const jobsWithScores = jobs.rows.map(job => {
      const jobData = job.toJSON();
      
      if (user.latitude && user.longitude && job.latitude && job.longitude) {
        jobData.distance = calculateDistance(
          { lat: user.latitude, lng: user.longitude },
          { lat: job.latitude, lng: job.longitude }
        );
      }

      jobData.matchScore = calculateJobMatch(user, jobData);
      
      return jobData;
    });

    // Filter by radius (if not remote)
    const filteredJobs = jobsWithScores.filter(job => {
      if (job.remote) return true;
      if (!job.distance) return true;
      return job.distance <= parseInt(radius);
    });

    // Sort by match score
    filteredJobs.sort((a, b) => b.matchScore.score - a.matchScore.score);

    const response = {
      jobs: filteredJobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredJobs.length / limit),
        totalJobs: filteredJobs.length,
        hasNext: page * limit < filteredJobs.length,
        hasPrev: page > 1
      }
    };

    // Cache the results
    await redisService.setJobs(filteredJobs);

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

module.exports = router;