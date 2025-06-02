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
    'Healthcare Skills': {
      'Therapy & Counseling': [
        'Individual Therapy', 'Group Therapy', 'Family Therapy', 'Couples Counseling',
        'Cognitive Behavioral Therapy (CBT)', 'Dialectical Behavior Therapy (DBT)',
        'Trauma-Informed Care', 'Crisis Intervention', 'Mental Health Assessment',
        'Treatment Planning', 'Progress Documentation', 'Case Management'
      ],
      'Mental Health': [
        'Anxiety Treatment', 'Depression Treatment', 'PTSD Treatment',
        'Substance Abuse Counseling', 'Eating Disorder Treatment',
        'Personality Disorder Treatment', 'Mood Disorder Treatment',
        'Behavioral Health', 'Psychiatric Assessment', 'Mental Health Diagnosis'
      ],
      'Healthcare Documentation': [
        'Electronic Health Records (EHR)', 'HIPAA Compliance',
        'Patient Documentation', 'Treatment Notes', 'Progress Reports',
        'Insurance Documentation', 'Medical Terminology'
      ],
      'Healthcare Technology': [
        'Teletherapy', 'Virtual Counseling', 'Healthcare Software',
        'Patient Management Systems', 'Digital Assessment Tools'
      ]
    },
    'Education Skills': {
      'Teaching Methods': [
        'Lesson Planning', 'Curriculum Development', 'Differentiated Instruction',
        'Classroom Management', 'Student Assessment', 'Educational Technology',
        'Project-Based Learning', 'Inclusive Education', 'Special Education',
        'Early Childhood Education'
      ],
      'Subject Expertise': [
        'Mathematics Education', 'Science Education', 'Language Arts',
        'Social Studies', 'Physical Education', 'Arts Education',
        'Music Education', 'Foreign Language Instruction', 'STEM Education',
        'Literacy Instruction'
      ],
      'Educational Technology': [
        'Learning Management Systems', 'Educational Software',
        'Digital Assessment Tools', 'Online Learning Platforms',
        'Interactive Whiteboards', 'Educational Apps'
      ],
      'Student Support': [
        'Student Counseling', 'Behavioral Management',
        'Individual Education Plans (IEP)', 'Parent Communication',
        'Student Progress Monitoring', 'Academic Support'
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