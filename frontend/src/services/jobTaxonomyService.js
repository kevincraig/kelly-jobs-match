// Job taxonomy based on O*NET and BLS occupational classifications
const jobTaxonomy = {
  'Computer and Mathematical': {
    'Software Development': [
      'Software Developer',
      'Software Engineer',
      'Web Developer',
      'Mobile Developer',
      'Game Developer',
      'DevOps Engineer',
      'QA Engineer',
      'Systems Engineer'
    ],
    'Data and Analytics': [
      'Data Scientist',
      'Data Engineer',
      'Data Analyst',
      'Business Intelligence Analyst',
      'Machine Learning Engineer',
      'AI Engineer'
    ],
    'IT and Systems': [
      'Systems Administrator',
      'Network Engineer',
      'Security Engineer',
      'IT Support Specialist',
      'Database Administrator',
      'Cloud Engineer'
    ]
  },
  'Architecture and Engineering': {
    'Engineering': [
      'Mechanical Engineer',
      'Electrical Engineer',
      'Civil Engineer',
      'Chemical Engineer',
      'Industrial Engineer',
      'Aerospace Engineer'
    ],
    'Architecture': [
      'Architect',
      'Landscape Architect',
      'Interior Designer',
      'Urban Planner'
    ]
  },
  'Life, Physical, and Social Science': {
    'Science': [
      'Research Scientist',
      'Laboratory Technician',
      'Environmental Scientist',
      'Chemist',
      'Biologist',
      'Physicist'
    ],
    'Social Science': [
      'Sociologist',
      'Psychologist',
      'Economist',
      'Political Scientist'
    ]
  },
  'Education, Training, and Library': {
    'Education': [
      'Teacher',
      'Professor',
      'School Administrator',
      'Librarian',
      'Educational Consultant'
    ],
    'Training': [
      'Corporate Trainer',
      'Instructional Designer',
      'Curriculum Developer'
    ]
  },
  'Healthcare Practitioners and Technical': {
    'Medical': [
      'Physician',
      'Nurse',
      'Pharmacist',
      'Dentist',
      'Veterinarian'
    ],
    'Healthcare Support': [
      'Medical Assistant',
      'Pharmacy Technician',
      'Dental Hygienist',
      'Physical Therapist'
    ]
  },
  'Business and Financial Operations': {
    'Management': [
      'Project Manager',
      'Product Manager',
      'Operations Manager',
      'Business Analyst',
      'Management Consultant'
    ],
    'Finance': [
      'Accountant',
      'Financial Analyst',
      'Investment Banker',
      'Actuary',
      'Auditor'
    ]
  },
  'Arts, Design, Entertainment, Sports, and Media': {
    'Design': [
      'Graphic Designer',
      'UX/UI Designer',
      'Industrial Designer',
      'Fashion Designer',
      'Interior Designer'
    ],
    'Media': [
      'Content Writer',
      'Journalist',
      'Editor',
      'Social Media Manager',
      'Digital Marketing Specialist'
    ]
  },
  'Installation, Maintenance, and Repair': {
    'Maintenance': [
      'Maintenance Technician',
      'HVAC Technician',
      'Electrician',
      'Plumber',
      'Carpenter'
    ],
    'Manufacturing': [
      'Machine Operator',
      'Assembly Worker',
      'Quality Control Inspector',
      'Production Supervisor'
    ]
  },
  'Transportation and Material Moving': {
    'Transportation': [
      'Truck Driver',
      'Delivery Driver',
      'Logistics Coordinator',
      'Supply Chain Manager'
    ],
    'Warehouse': [
      'Warehouse Worker',
      'Forklift Operator',
      'Inventory Manager',
      'Shipping Coordinator'
    ]
  },
  'Building and Grounds Cleaning and Maintenance': {
    'Cleaning': [
      'Janitor',
      'Housekeeper',
      'Custodian',
      'Groundskeeper'
    ],
    'Maintenance': [
      'Building Maintenance Worker',
      'Landscaper',
      'Pest Control Worker'
    ]
  }
};

// Function to find the category and subcategory for a job title
export const findJobCategory = (jobTitle) => {
  const titleLower = jobTitle.toLowerCase();
  
  for (const [category, subcategories] of Object.entries(jobTaxonomy)) {
    for (const [subcategory, roles] of Object.entries(subcategories)) {
      for (const role of roles) {
        if (titleLower.includes(role.toLowerCase())) {
          return {
            category,
            subcategory,
            role
          };
        }
      }
    }
  }
  
  return null;
};

// Function to get all roles in a category
export const getRolesInCategory = (category, subcategory = null) => {
  if (!category) return [];
  
  if (subcategory) {
    return jobTaxonomy[category]?.[subcategory] || [];
  }
  
  const roles = [];
  for (const subcat of Object.values(jobTaxonomy[category] || {})) {
    roles.push(...subcat);
  }
  return roles;
};

// Function to get all categories and subcategories
export const getAllCategories = () => {
  const categories = {};
  for (const [category, subcategories] of Object.entries(jobTaxonomy)) {
    categories[category] = Object.keys(subcategories);
  }
  return categories;
};

// Function to check if a job matches a user's role
export const isRoleMatch = (userRole, jobTitle, jobCategory) => {
  if (!userRole) return false;
  
  const userRoleInfo = findJobCategory(userRole);
  const jobInfo = findJobCategory(jobTitle);
  
  if (!userRoleInfo || !jobInfo) return false;
  
  // Must match both category and subcategory
  if (userRoleInfo.category === jobInfo.category && 
      userRoleInfo.subcategory === jobInfo.subcategory) {
    return true;
  }
  
  // For tech roles, allow some cross-category matches
  if (userRoleInfo.category === 'Computer and Mathematical') {
    const techRoles = [
      'Software Developer',
      'Software Engineer',
      'Web Developer',
      'Mobile Developer',
      'Game Developer',
      'DevOps Engineer',
      'QA Engineer',
      'Systems Engineer',
      'Data Scientist',
      'Data Engineer',
      'Data Analyst',
      'Business Intelligence Analyst',
      'Machine Learning Engineer',
      'AI Engineer',
      'Systems Administrator',
      'Network Engineer',
      'Security Engineer',
      'IT Support Specialist',
      'Database Administrator',
      'Cloud Engineer'
    ];
    
    // Check if both roles are in the tech category
    return techRoles.includes(userRole) && techRoles.includes(jobInfo.role);
  }
  
  return false;
}; 