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
    console.log('[API Request] URL:', config.url);
    console.log('[API Request] Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Request] Auth header set:', config.headers.Authorization.substring(0, 20) + '...');
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('[API Response] Status:', response.status, 'URL:', response.config.url);
    return response;
  },
  (error) => {
    console.error('[API Error]', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.response?.data?.message || error.message
    });
    if (error.response?.status === 401) {
      console.log('[API Error] 401 Unauthorized - Clearing token and redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('[API] Raw login response:', response);
      // The response data is already in the correct format
      return response.data;
    } catch (error) {
      console.error('[API] Login error:', error);
      throw error;
    }
  },
  register: (userData) => api.post('/auth/register', userData).then(response => response.data),
  getCurrentUser: () => api.get('/auth/me').then(response => response.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then(response => response.data),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }).then(response => response.data),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
};

export const userAPI = {
  getProfile: () => api.get('/users/profile').then(response => response.data),
  updateProfile: (data) => api.put('/users/profile', data).then(response => response.data),
};

export const jobsAPI = {
  searchJobs: (filters) => {
    console.log('[API] Search jobs request params:', filters);
    return api.get('/jobs/search', { params: filters })
      .then(response => {
        console.log('[API] Search jobs raw response:', response);
        console.log('[API] Search jobs response data:', response.data);
        // Check if we need to access data.jobs or just jobs
        const jobs = response.data.jobs || response.data;
        console.log('[API] Extracted jobs:', jobs);
        if (jobs && jobs.length > 0) {
          console.log('[API] First job in results:', {
            title: jobs[0].title,
            location: jobs[0].location,
            jobType: jobs[0].jobType
          });
        } else {
          console.log('[API] No jobs found in response');
        }
        return {
          ...response.data,
          jobs: jobs
        };
      })
      .catch(error => {
        console.error('[API] Search jobs error:', error);
        throw error;
      });
  },
  getJobMatches: (userId) => api.get(`/jobs/matches/${userId}`).then(response => response.data),
  getJobById: (jobId) => api.get(`/jobs/${jobId}`).then(response => response.data),
  updateFeed: () => api.get('/jobs/feed/update').then(response => response.data)
};

export const skillsAPI = {
  getAllSkills: () => api.get('/skills'),
  getSkillCategories: () => api.get('/skills/categories'),
};

// jobsAPI.searchJobs is the canonical way to fetch jobs for search/match. Do not use jobFeedService.js for this purpose.

export default api;