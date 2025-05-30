const axios = require('axios');
const xml2js = require('xml2js');

class XMLParser {
  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      trim: true,
    });
  }

  async fetchAndParseKellyFeed() {
    try {
      console.log('Fetching Kelly Services job feed...');
      
      const response = await axios.get(process.env.KELLY_FEED_URL, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Kelly-Jobs-Match/1.0',
        },
      });

      const parsedData = await this.parser.parseStringPromise(response.data);
      
      // Extract jobs from the XML structure
      const jobs = this.extractJobs(parsedData);
      
      console.log(`Parsed ${jobs.length} jobs from Kelly feed`);
      return jobs;
      
    } catch (error) {
      console.error('Error fetching Kelly feed:', error.message);
      // Return empty array for now to prevent crashes
      return [];
    }
  }

  extractJobs(parsedData) {
    // This will need to be adjusted based on Kelly's actual XML structure
    try {
      const source = parsedData.source || parsedData;
      let jobs = [];

      if (source.job) {
        jobs = Array.isArray(source.job) ? source.job : [source.job];
      }

      return jobs.map(job => this.transformJobData(job));
    } catch (error) {
      console.error('Error extracting jobs:', error);
      return [];
    }
  }

  transformJobData(jobXml) {
    // Transform XML job data to our database format
    return {
      externalId: jobXml.id || jobXml.referenceid || `kelly_${Date.now()}_${Math.random()}`,
      title: jobXml.title || 'Untitled Position',
      company: jobXml.company || 'Kelly Services',
      description: jobXml.description || '',
      location: jobXml.location || jobXml.city || '',
      jobType: this.parseJobType(jobXml.type || jobXml.employmenttype),
      remote: this.parseRemote(jobXml.description, jobXml.location),
      salary: jobXml.salary || jobXml.compensation || '',
      applyUrl: jobXml.url || jobXml.applyurl || '',
      postedDate: jobXml.date || jobXml.dateposted || new Date(),
      requiredSkills: this.extractSkills(jobXml.description || ''),
      experienceLevel: this.parseExperienceLevel(jobXml.description || ''),
      yearsRequired: this.parseYearsRequired(jobXml.description || ''),
    };
  }

  parseJobType(typeString) {
    if (!typeString) return 'Full-time';
    
    const type = typeString.toLowerCase();
    if (type.includes('part') || type.includes('pt')) return 'Part-time';
    if (type.includes('contract') && type.includes('hire')) return 'Contract-to-hire';
    if (type.includes('contract')) return 'Contract';
    return 'Full-time';
  }

  parseRemote(description, location) {
    const text = (description + ' ' + location).toLowerCase();
    return text.includes('remote') || text.includes('work from home') || text.includes('wfh');
  }

  extractSkills(description) {
    // Simple skill extraction - in production, use NLP or predefined skill lists
    const skillKeywords = [
      'javascript', 'react', 'node.js', 'python', 'java', 'sql', 'aws',
      'communication', 'leadership', 'project management', 'teamwork',
      'html', 'css', 'mongodb', 'postgresql', 'git', 'docker'
    ];
    
    const foundSkills = [];
    const text = description.toLowerCase();
    
    skillKeywords.forEach(skill => {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills;
  }

  parseExperienceLevel(description) {
    const text = description.toLowerCase();
    if (text.includes('senior') || text.includes('lead')) return 'Senior';
    if (text.includes('junior') || text.includes('entry')) return 'Junior';
    if (text.includes('mid') || text.includes('intermediate')) return 'Mid-level';
    return 'Mid-level';
  }

  parseYearsRequired(description) {
    const yearMatches = description.match(/(\d+)\+?\s*years?/i);
    return yearMatches ? parseInt(yearMatches[1]) : 0;
  }
}

module.exports = new XMLParser();