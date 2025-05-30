import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addSkill: (skillData) => api.post('/users/skills', skillData),
  removeSkill: (skillId) => api.delete(`/users/skills/${skillId}`),
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
};

export const jobsAPI = {
  searchJobs: (filters) => api.get('/jobs/search', { params: filters }),
  getJobMatches: (userId) => api.get(`/jobs/matches/${userId}`),
  getJobById: (jobId) => api.get(`/jobs/${jobId}`),
};

export const skillsAPI = {
  getAllSkills: () => api.get('/skills'),
  getSkillCategories: () => api.get('/skills/categories'),
};

export default api;