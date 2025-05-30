// Expanded skills taxonomy based on O*NET
export const SKILLS_TAXONOMY = {
    'Technical Skills': {
      'Programming Languages': [
        'JavaScript', 'Python', 'Java', 'C#', 'C++', 'TypeScript', 'PHP', 'Ruby', 
        'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB'
      ],
      'Web Development': [
        'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 
        'HTML/CSS', 'Sass/SCSS', 'Webpack', 'Bootstrap', 'Tailwind CSS'
      ],
      'Databases': [
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 
        'Oracle', 'SQL Server', 'Cassandra', 'DynamoDB'
      ],
      'Cloud & DevOps': [
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 
        'Git', 'CI/CD', 'Terraform', 'Ansible'
      ],
      'Data & Analytics': [
        'Data Analysis', 'Machine Learning', 'AI', 'Data Visualization', 
        'Tableau', 'Power BI', 'Excel', 'Pandas', 'NumPy', 'TensorFlow'
      ]
    },
    'Soft Skills': {
      'Communication': [
        'Written Communication', 'Verbal Communication', 'Presentation Skills', 
        'Public Speaking', 'Active Listening', 'Negotiation', 'Conflict Resolution'
      ],
      'Leadership': [
        'Team Leadership', 'Project Management', 'Strategic Planning', 
        'Decision Making', 'Coaching', 'Mentoring', 'Change Management'
      ],
      'Problem Solving': [
        'Critical Thinking', 'Analytical Thinking', 'Creative Problem Solving', 
        'Research Skills', 'Troubleshooting', 'Innovation'
      ],
      'Collaboration': [
        'Teamwork', 'Cross-functional Collaboration', 'Cultural Awareness', 
        'Emotional Intelligence', 'Empathy', 'Adaptability'
      ]
    },
    'Industry Skills': {
      'Healthcare': [
        'Patient Care', 'Medical Terminology', 'HIPAA Compliance', 'Electronic Health Records', 
        'Clinical Research', 'Nursing', 'Physical Therapy', 'Medical Billing'
      ],
      'Finance': [
        'Financial Analysis', 'Accounting', 'Investment Management', 'Risk Assessment', 
        'Banking', 'Insurance', 'Compliance', 'Auditing', 'Financial Planning'
      ],
      'Manufacturing': [
        'Quality Control', 'Lean Manufacturing', 'Six Sigma', 'Supply Chain', 
        'Production Planning', 'Safety Protocols', 'Equipment Maintenance'
      ],
      'Sales & Marketing': [
        'Sales', 'Digital Marketing', 'Social Media Marketing', 'SEO/SEM', 
        'Content Marketing', 'Brand Management', 'Customer Relationship Management'
      ],
      'Education': [
        'Curriculum Development', 'Classroom Management', 'Student Assessment', 
        'Educational Technology', 'Special Education', 'Adult Learning'
      ]
    }
  };
  
  // Flatten skills for search
  export const getAllSkills = () => {
    const allSkills = [];
    Object.values(SKILLS_TAXONOMY).forEach(category => {
      Object.values(category).forEach(skillGroup => {
        allSkills.push(...skillGroup);
      });
    });
    return [...new Set(allSkills)].sort();
  };
  
  export const searchSkills = (query) => {
    const allSkills = getAllSkills();
    return allSkills.filter(skill => 
      skill.toLowerCase().includes(query.toLowerCase())
    );
  };