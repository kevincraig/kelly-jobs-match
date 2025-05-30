// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (coord1, coord2) => {
  if (!coord1 || !coord2) return 0;
  const R = 3959; // Earth's radius in miles
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Calculate skill match score
const calculateSkillMatch = (userSkills, jobSkills) => {
  if (!userSkills?.length || !jobSkills?.length) return 0;
  
  const userSkillNames = userSkills.map(s => s.name.toLowerCase());
  const jobSkillNames = jobSkills.map(s => s.toLowerCase());
  
  const matchingSkills = jobSkillNames.filter(skill => 
    userSkillNames.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
  );
  
  return (matchingSkills.length / jobSkillNames.length) * 100;
};

// Calculate experience match score
const calculateExperienceMatch = (userExperience, jobRequiredYears) => {
  if (!userExperience?.length || !jobRequiredYears) return 0;
  
  const maxUserExperience = Math.max(...userExperience.map(exp => exp.years || 0));
  
  if (maxUserExperience >= jobRequiredYears) {
    return 100;
  }
  
  return (maxUserExperience / jobRequiredYears) * 100;
};

// Calculate education match score
const calculateEducationMatch = (userEducation, jobEducation) => {
  if (!jobEducation) return 50; // Neutral score if no education requirement
  
  const educationLevels = {
    'High School': 1,
    'GED': 1,
    'Associate': 2,
    'Bachelor': 3,
    'Bachelors': 3,
    'Master': 4,
    'Masters': 4,
    'PhD': 5,
    'Doctorate': 5
  };
  
  const userLevel = educationLevels[userEducation] || 0;
  const requiredLevel = educationLevels[jobEducation] || 0;
  
  if (userLevel >= requiredLevel) {
    return 100;
  }
  
  return (userLevel / requiredLevel) * 100;
};

// Calculate location match score
const calculateLocationMatch = (userLocation, jobLocation, maxRadius) => {
  if (jobLocation.remote) return 100;
  if (!userLocation?.coordinates || !jobLocation?.coordinates) return 50;
  
  const distance = calculateDistance(userLocation.coordinates, jobLocation.coordinates);
  
  if (distance <= maxRadius) {
    return Math.max(0, 100 - (distance / maxRadius) * 100);
  }
  
  return 0;
};

// Calculate keyword match score
const calculateKeywordMatch = (userKeywords, jobDescription) => {
  if (!userKeywords?.length || !jobDescription) return 0;
  
  const descriptionLower = jobDescription.toLowerCase();
  const matchingKeywords = userKeywords.filter(keyword => 
    descriptionLower.includes(keyword.toLowerCase())
  );
  
  return (matchingKeywords.length / userKeywords.length) * 100;
};

// Calculate benefits match score
const calculateBenefitsMatch = (userPreferences, jobBenefits) => {
  if (!userPreferences?.length || !jobBenefits?.length) return 50;
  
  const matchingBenefits = jobBenefits.filter(benefit =>
    userPreferences.some(pref => benefit.toLowerCase().includes(pref.toLowerCase()))
  );
  
  return (matchingBenefits.length / userPreferences.length) * 100;
};

// Main matching function
export const calculateJobMatch = (user, job) => {
  const weights = {
    skills: 0.35,        // 35% - Most important
    experience: 0.20,    // 20% - Very important
    location: 0.15,      // 15% - Important
    education: 0.10,     // 10% - Somewhat important
    keywords: 0.10,      // 10% - Somewhat important
    benefits: 0.10       // 10% - Somewhat important
  };

  const scores = {
    skills: calculateSkillMatch(user.skills, job.requiredSkills),
    experience: calculateExperienceMatch(user.experience, job.yearsRequired),
    location: calculateLocationMatch(
      { coordinates: user.coordinates },
      { coordinates: job.coordinates, remote: job.remote },
      user.preferences?.maxRadius || 25
    ),
    education: calculateEducationMatch(user.education, job.education),
    keywords: calculateKeywordMatch(user.preferences?.keywords, job.description),
    benefits: calculateBenefitsMatch(user.preferences?.benefits, job.benefits)
  };

  // Calculate weighted score
  const weightedScore = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + (scores[key] * weight);
  }, 0);

  // Generate match factors for display
  const factors = [
    `Skills: ${Math.round(scores.skills)}% match`,
    `Experience: ${Math.round(scores.experience)}% match`,
    `Location: ${Math.round(scores.location)}% match`,
    `Education: ${Math.round(scores.education)}% match`,
    `Keywords: ${Math.round(scores.keywords)}% match`,
    `Benefits: ${Math.round(scores.benefits)}% match`
  ];

  return {
    score: Math.round(weightedScore),
    factors,
    detailedScores: scores
  };
}; 