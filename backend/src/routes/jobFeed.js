const express = require('express');
const router = express.Router();
const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const { Job } = require('../models/Job');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true
});

// Cache the parsed jobs in memory
let cachedJobs = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchAndParseJobs() {
  // Return cached jobs if they're still fresh
  if (cachedJobs && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
    return cachedJobs;
  }

  console.log('Fetching Kelly Services job feed...');
  const response = await axios.get('https://sf-job-feeds.s3.us-east-2.amazonaws.com/kelly-services/production-recruitics-usa.xml');
  console.log('Feed response received:', response.status);
  
  const result = parser.parse(response.data);
  console.log('Parsed XML structure:', JSON.stringify(result, null, 2));

  if (!result.Jobs || !result.Jobs.Job) {
    console.error('Invalid feed structure:', result);
    throw new Error('Invalid job feed structure');
  }

  // Convert single job to array if necessary
  const jobs = Array.isArray(result.Jobs.Job) ? result.Jobs.Job : [result.Jobs.Job];
  console.log(`Found ${jobs.length} jobs in feed`);
  // Log the first few raw jobs for debugging
  console.log('First 3 raw jobs from XML:', jobs.slice(0, 3));

  // Helper to fix image src URLs in job descriptions
  function fixImageSrc(description) {
    if (!description) return '';
    return description.replace(/src=["'](\/wp-content[^"']+)["']/g, 'src="https://www.mykelly.com$1"');
  }

  const processedJobs = jobs.map(job => {
    try {
      // Extract location information
      const location = job.JobLocations?.Location;
      const locationStr = location ? 
        `${location.City}, ${location.State}` : 
        `${job.PhyCity}, ${job.PhyState}`;

      // Extract job categories
      const categories = job.JobCategories?.Category;
      const category = categories ? 
        (Array.isArray(categories) ? categories[0].JobCategoryDesc : categories.JobCategoryDesc) : 
        '';

      // Parse salary from TargetedPayRate
      let salary = null;
      if (typeof job.TargetedPayRate === 'string') {
        const salaryMatch = job.TargetedPayRate.match(/\$(\d+(?:\.\d{2})?)\s*-\s*\$(\d+(?:\.\d{2})?)/);
        if (salaryMatch) {
          salary = {
            min: parseFloat(salaryMatch[1]),
            max: parseFloat(salaryMatch[2]),
            currency: 'USD'
          };
        }
      }

      return {
        id: job['@_Jobid'] || `kelly-${job.JobReqID}`,
        title: job.JobTitle || 'Untitled Position',
        company: 'Kelly Services',
        location: locationStr || 'Location not specified',
        coordinates: null, // We'll need to geocode this later
        jobType: job.JobType || 'Full-time',
        remote: job.RemoteWork === 'true',
        description: fixImageSrc(job.JobBody || ''),
        requiredSkills: [], // We'll extract these from the description
        experienceLevel: job.JobLevel || 'Not Specified',
        yearsRequired: null, // We'll extract this from the description
        postedDate: job.JobPostDate || new Date().toISOString(),
        salary: salary,
        department: category || '',
        category: category || '',
        education: null, // We'll extract this from the description
        benefits: [], // We'll extract these from the description
        url: job.ApplyOnlineURL || '',
        applyUrl: job.ApplyOnlineURL || '',
        source: 'Kelly Services'
      };
    } catch (error) {
      console.error('Error processing job:', job, error);
      return null;
    }
  }).filter(Boolean); // Remove any null entries from failed processing

  console.log(`Successfully processed ${processedJobs.length} jobs`);
  
  // Update cache
  cachedJobs = processedJobs;
  lastFetchTime = Date.now();
  
  return processedJobs;
}

router.get('/', async (req, res) => {
  try {
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({ error: 'Page number must be greater than 0' });
    }
    if (pageSize < 1 || pageSize > 100) {
      return res.status(400).json({ error: 'Page size must be between 1 and 100' });
    }

    // Fetch and parse jobs
    const allJobs = await fetchAndParseJobs();
    
    // Calculate pagination
    const totalJobs = allJobs.length;
    const totalPages = Math.ceil(totalJobs / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalJobs);
    
    // Get jobs for current page
    const jobs = allJobs.slice(startIndex, endIndex);

    // Return paginated response
    res.json({
      jobs,
      pagination: {
        currentPage: page,
        pageSize,
        totalPages,
        totalJobs,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching Kelly jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

module.exports = router; 