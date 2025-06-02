// backend/src/services/jobFeedService.js

const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');
const redisService = require('./redisService');

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true
});

async function fetchKellyJobs() {
  try {
    // Check Redis cache first
    const cachedJobs = await redisService.getJobs();
    if (cachedJobs) {
      console.log('Returning jobs from Redis cache');
      return cachedJobs;
    }

    console.log('Fetching Kelly Services job feed...');
    const feedUrl = process.env.KELLY_FEED_URL || 'https://sf-job-feeds.s3.us-east-2.amazonaws.com/kelly-services/production-recruitics-usa.xml';
    console.log('Using feed URL:', feedUrl);
    
    const response = await axios.get(feedUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Kelly-Jobs-Match/1.0',
      },
    });
    console.log('Feed response status:', response.status);
    console.log('Feed response headers:', response.headers);

    const result = parser.parse(response.data);
    console.log('Parsed feed structure:', JSON.stringify(result, null, 2).slice(0, 500) + '...');
    
    if (!result.Jobs || !result.Jobs.Job) {
      console.error('Invalid feed structure:', result);
      throw new Error('Invalid job feed structure');
    }

    // Convert single job to array if necessary
    const jobs = Array.isArray(result.Jobs.Job) ? result.Jobs.Job : [result.Jobs.Job];
    console.log(`Found ${jobs.length} jobs in feed`);
    console.log('First job sample:', JSON.stringify(jobs[0], null, 2));

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

        // Extract skills from description
        const requiredSkills = extractSkills(job.JobBody || '');

        const processedJob = {
          id: job['@_Jobid'] || `kelly-${job.JobReqID}`,
          title: job.JobTitle || 'Untitled Position',
          company: 'Kelly Services',
          location: locationStr || 'Location not specified',
          coordinates: null,
          jobType: job.JobType || 'Full-time',
          remote: job.RemoteWork === 'true',
          description: job.JobBody || '',
          requiredSkills: requiredSkills,
          experienceLevel: job.JobLevel || 'Not Specified',
          yearsRequired: extractYearsRequired(job.JobBody || ''),
          postedDate: job.JobPostDate || new Date().toISOString(),
          salary: salary,
          department: category || '',
          category: category || '',
          education: extractEducation(job.JobBody || ''),
          benefits: extractBenefits(job.JobBody || ''),
          url: job.ApplyOnlineURL || '',
          applyUrl: job.ApplyOnlineURL || '',
          source: 'Kelly Services'
        };
        console.log('Processed job:', processedJob.title);
        return processedJob;
      } catch (error) {
        console.error('Error processing job:', job, error);
        return null;
      }
    }).filter(Boolean);

    console.log(`Successfully processed ${processedJobs.length} jobs`);
    if (processedJobs.length > 0) {
      console.log('Sample processed job:', JSON.stringify(processedJobs[0], null, 2));
    }

    // Cache the processed jobs in Redis
    await redisService.setJobs(processedJobs);
    await redisService.setLastFeedUpdate(Date.now().toString());

    return processedJobs;
  } catch (error) {
    console.error('Error fetching Kelly jobs:', error);
    throw error;
  }
}

// Helper functions
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

function extractYearsRequired(description) {
  const yearsRegex = /(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience/i;
  const match = description.match(yearsRegex);
  return match ? parseInt(match[1]) : 0;
}

function extractEducation(description) {
  const educationLevels = [
    { level: 'PhD', keywords: ['phd', 'doctorate', 'doctoral'] },
    { level: 'Masters', keywords: ['masters', 'ms', 'ma', 'mba'] },
    { level: 'Bachelors', keywords: ['bachelors', 'bs', 'ba', 'b.s.', 'b.a.'] },
    { level: 'Associates', keywords: ['associates', 'aa', 'a.s.', 'a.a.'] }
  ];

  const descriptionLower = description.toLowerCase();
  for (const { level, keywords } of educationLevels) {
    if (keywords.some(keyword => descriptionLower.includes(keyword))) {
      return level;
    }
  }
  return 'Not Specified';
}

function extractBenefits(description) {
  const benefits = [];
  const descriptionLower = description.toLowerCase();
  
  const benefitKeywords = {
    'Health Insurance': ['health insurance', 'medical', 'dental', 'vision'],
    '401(k)': ['401k', 'retirement', 'pension'],
    'Paid Time Off': ['pto', 'vacation', 'paid time off', 'paid leave'],
    'Remote Work': ['remote', 'work from home', 'wfh'],
    'Flexible Schedule': ['flexible schedule', 'flexible hours'],
    'Professional Development': ['professional development', 'training', 'education'],
    'Life Insurance': ['life insurance'],
    'Disability Insurance': ['disability insurance'],
    'Stock Options': ['stock options', 'equity'],
    'Gym Membership': ['gym', 'fitness'],
    'Child Care': ['child care', 'daycare'],
    'Commuter Benefits': ['commuter', 'transit']
  };

  for (const [benefit, keywords] of Object.entries(benefitKeywords)) {
    if (keywords.some(keyword => descriptionLower.includes(keyword))) {
      benefits.push(benefit);
    }
  }

  return benefits;
}

module.exports = { fetchKellyJobs }; 