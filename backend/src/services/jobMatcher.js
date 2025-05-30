// Job matching algorithm service
const calculateDistance = (coord1, coord2) => {
    if (!coord1 || !coord2) return null;
    
    const R = 3959; // Earth's radius in miles
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const calculateJobMatch = (user, job) => {
    let score = 0;
    let factors = [];
  
    // Skills match (40% weight)
    const userSkills = (user.skills || []).map(s => s.name?.toLowerCase() || s.toLowerCase());
    const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
    
    const skillMatches = jobSkills.filter(skill => 
      userSkills.some(userSkill => userSkill === skill)
    );
    
    const skillScore = jobSkills.length > 0 ? (skillMatches.length / jobSkills.length) * 40 : 0;
    score += skillScore;
    factors.push(`Skills: ${skillMatches.length}/${jobSkills.length} match (${Math.round(skillScore)}%)`);
  
    // Location match (30% weight)
    let locationScore = 0;
    if (job.remote || user.preferences?.remoteWork) {
      locationScore = 30;
      factors.push('Location: Remote work available (30%)');
    } else if (job.distance !== undefined) {
      const maxRadius = user.preferences?.maxRadius || 25;
      if (job.distance <= maxRadius) {
        locationScore = Math.max(0, 30 - (job.distance / maxRadius) * 30);
        factors.push(`Location: ${job.distance.toFixed(1)} miles away (${Math.round(locationScore)}%)`);
      } else {
        factors.push(`Location: ${job.distance.toFixed(1)} miles - outside preferred radius (0%)`);
      }
    } else {
      locationScore = 15; // Partial score if no distance data
      factors.push('Location: Unknown distance (15%)');
    }
    score += locationScore;
  
    // Experience match (30% weight)
    const userExperience = Math.max(...(user.experience || []).map(exp => exp.years || 0), 0);
    const requiredYears = job.yearsRequired || 0;
    
    let experienceScore = 0;
    if (userExperience >= requiredYears) {
      experienceScore = 30;
      factors.push(`Experience: ${userExperience} years meets ${requiredYears} required (30%)`);
    } else if (requiredYears > 0) {
      experienceScore = (userExperience / requiredYears) * 30;
      factors.push(`Experience: ${userExperience}/${requiredYears} years required (${Math.round(experienceScore)}%)`);
    } else {
      experienceScore = 30; // No experience required
      factors.push('Experience: No specific requirement (30%)');
    }
    score += experienceScore;
  
    return {
      score: Math.round(score),
      factors,
      breakdown: {
        skills: Math.round(skillScore),
        location: Math.round(locationScore),
        experience: Math.round(experienceScore)
      }
    };
  };
  
  module.exports = {
    calculateDistance,
    calculateJobMatch
  };