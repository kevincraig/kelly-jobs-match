const axios = require('axios');
const xml2js = require('xml2js');
const { Job } = require('../models/index');
const cron = require('node-cron');
const { Op } = require('sequelize');
const { fetchKellyJobs } = require('../services/jobFeedService');
const redisService = require('../services/redisService');

const KELLY_FEED_URL = process.env.KELLY_FEED_URL;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_TTL = process.env.REDIS_TTL || 3600; // 1 hour in seconds

// Configure XML parser
const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
  valueProcessors: [xml2js.processors.parseNumbers, xml2js.processors.parseBooleans]
});

// Schedule feed updates at 8 AM and 8 PM daily
const FEED_UPDATE_SCHEDULE = '0 8,20 * * *';

async function updateFeed() {
  try {
    console.log('Starting job feed update...');
    
    // Fetch new jobs
    const jobs = await fetchKellyJobs();
    
    if (!jobs || jobs.length === 0) {
      console.error('No jobs fetched from feed');
      return;
    }

    // Cache the jobs in Redis
    await redisService.setJobs(jobs);
    await redisService.setLastFeedUpdate(Date.now().toString());
    
    console.log(`Successfully updated feed with ${jobs.length} jobs`);
  } catch (error) {
    console.error('Error updating feed:', error);
  }
}

// Helper functions
function determineExperienceLevel(job) {
  const title = (job.title || '').toLowerCase();
  const description = (job.description || '').toLowerCase();

  if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
    return 'Senior';
  } else if (title.includes('junior') || title.includes('entry')) {
    return 'Junior';
  } else if (description.includes('senior level') || description.includes('leadership')) {
    return 'Senior';
  } else if (description.includes('entry level') || description.includes('junior')) {
    return 'Junior';
  }
  return 'Mid-level';
}

function extractYearsRequired(description) {
  const yearsRegex = /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i;
  const match = description.match(yearsRegex);
  return match ? parseInt(match[1]) : 0;
}

function extractSkills(description) {
  const commonSkills = [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Git',
    'HTML/CSS', 'MongoDB', 'REST APIs', 'GraphQL', 'TypeScript', 'Vue.js',
    'Angular', 'PostgreSQL', 'Redis', 'Kubernetes', 'C#', '.NET',
    'Project Management', 'Agile', 'Scrum', 'JIRA', 'Confluence',
    'Data Analysis', 'Machine Learning', 'AI', 'Cloud Computing',
    'DevOps', 'CI/CD', 'Microservices', 'System Design',
    'Manufacturing', 'Engineering', 'Quality Control', 'Production',
    'Assembly', 'CNC', 'Welding', 'Machining', 'Industrial',
    'Maintenance', 'Electrical', 'Mechanical', 'Technical',
    'Customer Service', 'Administrative', 'Office', 'Reception',
    'Data Entry', 'Accounting', 'Finance', 'HR', 'Marketing',
    'Sales', 'Retail', 'Warehouse', 'Logistics', 'Supply Chain'
  ];

  const skills = new Set();
  const descriptionLower = description.toLowerCase();

  commonSkills.forEach(skill => {
    if (descriptionLower.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });

  return Array.from(skills);
}

function start() {
  // Run initial update
  updateFeed();
  
  // Schedule regular updates
  cron.schedule(FEED_UPDATE_SCHEDULE, updateFeed);
  console.log('Feed updater scheduled for 8 AM and 8 PM daily');
}

module.exports = {
  start,
  updateFeed
};