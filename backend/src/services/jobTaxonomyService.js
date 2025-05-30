// Basic job taxonomy service
const jobTaxonomyService = {
  getJobCategories: () => {
    return [
      'Engineering',
      'Design',
      'Product',
      'Marketing',
      'Sales',
      'Customer Support',
      'Operations',
      'Finance',
      'Human Resources',
      'Legal'
    ];
  },

  getSkillsByCategory: (category) => {
    // This is a placeholder implementation
    return [];
  }
};

module.exports = jobTaxonomyService; 