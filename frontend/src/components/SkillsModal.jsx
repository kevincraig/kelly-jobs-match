import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const SKILLS_TAXONOMY = {
  'Technical Skills': [
    'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Git',
    'HTML/CSS', 'MongoDB', 'REST APIs', 'GraphQL', 'TypeScript', 'Vue.js',
    'Angular', 'PostgreSQL', 'Redis', 'Kubernetes', 'C#', '.NET'
  ],
  'Soft Skills': [
    'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration',
    'Project Management', 'Critical Thinking', 'Adaptability', 'Time Management',
    'Customer Service', 'Negotiation', 'Presentation', 'Mentoring',
    'Strategic Planning', 'Decision Making', 'Conflict Resolution'
  ],
  'Industry Skills': [
    'Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Education',
    'Marketing', 'Sales', 'HR', 'Legal', 'Accounting', 'Engineering',
    'Design', 'Operations', 'Quality Assurance', 'Data Analysis'
  ]
};

const SkillsModal = ({ showModal, setShowModal, userSkills, onAddSkills }) => {
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('Technical Skills');
  const [selectedSkillsToAdd, setSelectedSkillsToAdd] = useState([]);

  const toggleSkillSelection = (skillName) => {
    setSelectedSkillsToAdd(prev =>
      prev.includes(skillName)
        ? prev.filter(name => name !== skillName)
        : [...prev, skillName]
    );
  };

  const addSkills = () => {
    const newSkills = selectedSkillsToAdd.map(skillName => ({
      name: skillName,
      proficiency: 'Intermediate'
    }));
    onAddSkills(newSkills);
    setSelectedSkillsToAdd([]);
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Skills</h3>
          <button
            onClick={() => {
              setShowModal(false);
              setSelectedSkillsToAdd([]);
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex space-x-2 mb-4">
          {Object.keys(SKILLS_TAXONOMY).map(category => (
            <button
              key={category}
              onClick={() => setSelectedSkillCategory(category)}
              className={`px-3 py-2 rounded-lg text-sm ${
                selectedSkillCategory === category
                  ? 'bg-kelly-light text-kelly'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {SKILLS_TAXONOMY[selectedSkillCategory].map(skill => {
              const isAlreadyAdded = userSkills.some(s => s.name === skill);
              const isSelected = selectedSkillsToAdd.includes(skill);
              return (
                <div
                  key={skill}
                  className={`flex items-center px-3 py-1 rounded-full text-sm font-normal select-none transition-colors
                    ${isAlreadyAdded
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isSelected
                        ? 'bg-kelly text-white cursor-pointer'
                        : 'bg-kelly-light text-kelly cursor-pointer hover:bg-kelly/30'}
                  `}
                  style={{ minHeight: '2rem', pointerEvents: isAlreadyAdded ? 'none' : 'auto' }}
                  onClick={() => {
                    if (!isAlreadyAdded) toggleSkillSelection(skill);
                  }}
                >
                  <span className="flex-1">{skill}</span>
                  {isAlreadyAdded ? (
                    <X className="h-4 w-4 ml-2 text-gray-400" />
                  ) : isSelected ? (
                    <Check className="h-4 w-4 ml-2 text-white" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedSkillsToAdd.length > 0 && (
              <span>{selectedSkillsToAdd.length} skill{selectedSkillsToAdd.length !== 1 ? 's' : ''} selected</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setShowModal(false);
                setSelectedSkillsToAdd([]);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={addSkills}
              disabled={selectedSkillsToAdd.length === 0}
              className={`px-4 py-2 rounded-lg ${
                selectedSkillsToAdd.length > 0
                  ? 'bg-kelly text-white hover:bg-kelly-dark'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Add {selectedSkillsToAdd.length > 0 ? `${selectedSkillsToAdd.length} ` : ''}Skill{selectedSkillsToAdd.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsModal; 