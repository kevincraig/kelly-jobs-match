import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

const API_BASE_URL = 'http://localhost:5000/api';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true
});

export const fetchKellyJobs = async (page = 1, pageSize = 10) => {
  try {
    console.log('Fetching Kelly Services job feed...');
    const response = await axios.get(`${API_BASE_URL}/jobs/feed`, {
      params: { page, pageSize }
    });
    console.log('Feed response received:', response.status);
    
    if (!response.data || !response.data.jobs) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Invalid job feed structure');
    }

    const jobs = response.data.jobs;
    console.log(`Found ${jobs.length} jobs in feed`);
    // Log the first few raw jobs for debugging
    console.log('First 3 raw jobs from backend:', jobs.slice(0, 3));

    const safeValue = (val, fallback) => (val && typeof val === 'string' && val.trim() !== '' ? val : fallback);

    const processedJobs = jobs.map(job => {
      try {
        return {
          id: job.id || `kelly-${Math.random().toString(36).substr(2, 9)}`,
          title: safeValue(job.title, safeValue(job.JobTitle, 'Untitled Position')),
          company: safeValue(job.company, 'Kelly Services'),
          location: safeValue(job.location, (job.PhyCity && job.PhyState ? `${job.PhyCity}, ${job.PhyState}` : 'Location not specified')),
          coordinates: job.coordinates || null,
          jobType: safeValue(job.jobType, safeValue(job.JobType, 'Full-time')),
          remote: typeof job.remote === 'boolean' ? job.remote : (job.RemoteWork === 'true'),
          description: safeValue(job.description, safeValue(job.JobBody, '')),
          requiredSkills: job.requiredSkills && job.requiredSkills.length > 0 ? job.requiredSkills : extractSkills(job.description || job.JobBody || ''),
          experienceLevel: safeValue(job.experienceLevel, safeValue(job.JobLevel, determineExperienceLevel(job))),
          yearsRequired: job.yearsRequired != null ? job.yearsRequired : extractYearsRequired(job.description || job.JobBody || ''),
          postedDate: safeValue(job.postedDate, safeValue(job.JobPostDate, new Date().toISOString())),
          salary: job.salary || extractSalary(job),
          department: safeValue(job.department, ''),
          category: safeValue(job.category, ''),
          education: safeValue(job.education, extractEducation(job.description || job.JobBody || '')),
          benefits: job.benefits && job.benefits.length > 0 ? job.benefits : extractBenefits(job.description || job.JobBody || ''),
          url: safeValue(job.url, safeValue(job.ApplyOnlineURL, '')),
          applyUrl: safeValue(job.applyUrl, safeValue(job.ApplyOnlineURL, '')),
          source: 'Kelly Services'
        };
      } catch (error) {
        console.error('Error processing job:', job, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries from failed processing

    console.log(`Successfully processed ${processedJobs.length} jobs`);
    return processedJobs;
  } catch (error) {
    console.error('Error fetching Kelly jobs:', error);
    throw error;
  }
};

// Helper functions to extract information from job descriptions
const extractSkills = (description) => {
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
};

const determineExperienceLevel = (job) => {
  const description = (job.description || '').toLowerCase();
  if (description.includes('senior') || description.includes('lead') || description.includes('principal')) {
    return 'Senior';
  } else if (description.includes('junior') || description.includes('entry level') || description.includes('entry-level')) {
    return 'Entry Level';
  } else if (description.includes('mid-level') || description.includes('mid level')) {
    return 'Mid Level';
  }
  return 'Not Specified';
};

const extractYearsRequired = (description) => {
  const matches = description.match(/(\d+)[\+]?\s*(?:years?|yrs?)/i);
  return matches ? parseInt(matches[1]) : null;
};

const extractSalary = (job) => {
  if (!job.description) return null;
  const salaryMatch = job.description.match(/\$(\d{2,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:-|to)\s*\$(\d{2,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (salaryMatch) {
    return {
      min: parseFloat(salaryMatch[1].replace(/,/g, '')),
      max: parseFloat(salaryMatch[2].replace(/,/g, '')),
      currency: 'USD'
    };
  }
  return null;
};

const extractEducation = (description) => {
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
};

const extractBenefits = (description) => {
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
}; 