import React, { useState } from 'react';
import { Skill } from '../types';

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skills: Skill[]) => void;
  selectedSkills: Skill[];
  availableSkills: Skill[];
}

function SkillsModal({
  isOpen,
  onClose,
  onSave,
  selectedSkills,
  availableSkills
}: SkillsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<Skill[]>(selectedSkills);

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSkillToggle = (skill: Skill) => {
    setSelected(prev =>
      prev.some(s => s.id === skill.id)
        ? prev.filter(s => s.id !== skill.id)
        : [...prev, skill]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Select Skills</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close modal"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            {filteredSkills.map((skill) => (
              <div key={skill.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`skill-${skill.id}`}
                  checked={selected.some(s => s.id === skill.id)}
                  onChange={() => handleSkillToggle(skill)}
                  className="h-4 w-4 text-kelly focus:ring-kelly border-gray-300 rounded"
                />
                <label htmlFor={`skill-${skill.id}`} className="ml-2 text-sm text-gray-700">
                  {skill.name}
                </label>
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kelly"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-kelly hover:bg-kelly-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kelly"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillsModal; 