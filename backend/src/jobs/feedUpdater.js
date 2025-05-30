const axios = require('axios');
const xml2js = require('xml2js');
const { Job } = require('../models/index');
const cron = require('node-cron');
const { Op } = require('sequelize');

const KELLY_FEED_URL = process.env.KELLY_FEED_URL;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_TTL = process.env.REDIS_TTL || 3600; // 1 hour in seconds

// Configure XML parser
const parser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true,
  valueProcessors: [xml2js.processors.parseNumbers, xml2js.processors.parseBooleans]
});

async function updateFeed() {
  try {
    console.log('Starting job feed update...');
    console.log('Fetching Kelly Services job feed...');
    
    const response = await axios.get(KELLY_FEED_URL);
    const result = await parser.parseStringPromise(response.data);
    
    if (!result.source || !result.source.job) {
      console.error('Invalid feed structure:', result);
      return;
    }

    // Convert to array if single job
    const jobs = Array.isArray(result.source.job) 
      ? result.source.job 
      : [result.source.job];

    console.log(`Parsed ${jobs.length} jobs from Kelly feed`);

    let created = 0;
    let updated = 0;

    for (const job of jobs) {
      try {
        const jobData = {
          externalId: job.id || `kelly-${Math.random().toString(36).substr(2, 9)}`,
          title: job.title || 'Untitled Position',
          company: job.company || 'Kelly Services',
          location: job.location || 'Location not specified',
          description: job.description || '',
          jobType: job.jobtype || 'Full-time',
          remote: job.remote === 'true',
          salary: job.salary || 'Not specified',
          experienceLevel: determineExperienceLevel(job),
          yearsRequired: extractYearsRequired(job.description || ''),
          requiredSkills: extractSkills(job.description || ''),
          applyUrl: job.applyurl || '',
          postedDate: job.posteddate || new Date(),
          isActive: true
        };

        // Handle coordinates if they exist
        if (job.coordinates) {
          jobData.latitude = parseFloat(job.coordinates.latitude);
          jobData.longitude = parseFloat(job.coordinates.longitude);
        }

        // Update or create job
        const [jobRecord, created] = await Job.upsert(jobData, {
          where: { externalId: jobData.externalId }
        });

        if (created) {
          created++;
        } else {
          updated++;
        }
      } catch (error) {
        console.error('Error processing job:', job.id, error);
      }
    }

    // Deactivate old jobs
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days old
    await Job.update(
      { isActive: false },
      { where: { updatedAt: { [Op.lt]: cutoffDate } } }
    );

    console.log(`Feed update complete: ${created} created, ${updated} updated`);
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

// Schedule feed updates
function start() {
  // Run immediately on startup
  updateFeed();
  
  // Schedule updates for 8 AM and 8 PM daily
  cron.schedule('0 8,20 * * *', () => {
    console.log('Running scheduled feed update...');
    updateFeed();
  });
  
  console.log('Feed updater scheduled for 8 AM and 8 PM daily');
}

module.exports = { start };