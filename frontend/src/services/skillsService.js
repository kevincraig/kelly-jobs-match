import { skillsAPI } from './api';

// Get all available skills
export const getAllSkills = async () => {
  try {
    const response = await skillsAPI.getAllSkills();
    return response.skills || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
};

// Search skills by keyword
export const searchSkills = (keyword) => {
  if (!keyword) return [];
  
  // This is a client-side search implementation
  // In a real application, you might want to use the API instead
  const allSkills = [
    // Technical Skills
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Git',
    'HTML/CSS', 'MongoDB', 'REST APIs', 'GraphQL', 'TypeScript', 'Vue.js',
    'Angular', 'PostgreSQL', 'Redis', 'Kubernetes', 'C#', '.NET',
    // Soft Skills
    'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration',
    'Project Management', 'Critical Thinking', 'Adaptability', 'Time Management',
    'Customer Service', 'Negotiation', 'Presentation', 'Mentoring',
    'Strategic Planning', 'Decision Making', 'Conflict Resolution',
    // Industry Skills
    'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education',
    'Marketing', 'Sales', 'HR', 'Legal', 'Accounting', 'Engineering',
    'Design', 'Operations', 'Quality Assurance', 'Data Analysis'
  ];

  const keywordLower = keyword.toLowerCase();
  return allSkills.filter(skill => 
    skill.toLowerCase().includes(keywordLower)
  );
};

// Add a skill to user's profile
export const addSkill = async (userId, skill) => {
  try {
    const response = await skillsAPI.addSkill(userId, skill);
    return response;
  } catch (error) {
    console.error('Error adding skill:', error);
    throw error;
  }
};

// Remove a skill from user's profile
export const removeSkill = async (userId, skillId) => {
  try {
    const response = await skillsAPI.removeSkill(userId, skillId);
    return response;
  } catch (error) {
    console.error('Error removing skill:', error);
    throw error;
  }
}; 