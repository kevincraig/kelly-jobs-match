const express = require('express');
const router = express.Router();

// For now, we'll return static skills data
// Later this can be moved to a database table

const SKILLS_CATEGORIES = {
  'Technical Skills': [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Git',
    'HTML/CSS', 'MongoDB', 'REST APIs', 'GraphQL', 'TypeScript', 'Vue.js'
  ],
  'Soft Skills': [
    'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration',
    'Project Management', 'Critical Thinking', 'Adaptability', 'Time Management'
  ],
  'Industry Skills': [
    'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education',
    'Marketing', 'Sales', 'HR', 'Legal', 'Accounting'
  ]
};

// GET /api/skills/categories - Get all skill categories
router.get('/categories', (req, res) => {
  res.json(SKILLS_CATEGORIES);
});

// GET /api/skills - Get all skills (flattened)
router.get('/', (req, res) => {
  const allSkills = [];
  Object.values(SKILLS_CATEGORIES).forEach(category => {
    allSkills.push(...category);
  });
  res.json([...new Set(allSkills)].sort());
});

module.exports = router;