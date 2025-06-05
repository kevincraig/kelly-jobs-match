import axios from 'axios';
import { User, Skill, Experience, UserPreferences } from '../types';

export const api = {
  async getProfile(): Promise<User> {
    try {
      const response = await axios.get('/api/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  async updateUser(userData: Partial<User>): Promise<User> {
    try {
      const response = await axios.put('/api/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async updateSkills(skills: Skill[]): Promise<User> {
    try {
      const response = await axios.put('/api/profile/skills', { skills });
      return response.data;
    } catch (error) {
      console.error('Error updating skills:', error);
      throw error;
    }
  },

  async updatePreferences(preferences: UserPreferences): Promise<User> {
    try {
      const response = await axios.put('/api/profile/preferences', { preferences });
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  },

  async addExperience(experience: Experience): Promise<User> {
    try {
      const response = await axios.post('/api/profile/experience', { experience });
      return response.data;
    } catch (error) {
      console.error('Error adding experience:', error);
      throw error;
    }
  },

  async updateExperience(experience: Experience): Promise<User> {
    try {
      const response = await axios.put('/api/profile/experience', { experience });
      return response.data;
    } catch (error) {
      console.error('Error updating experience:', error);
      throw error;
    }
  },

  async deleteExperience(experienceId: string): Promise<User> {
    try {
      const response = await axios.delete(`/api/profile/experience/${experienceId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting experience:', error);
      throw error;
    }
  }
}; 