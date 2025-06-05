import axios from 'axios';
import { Auth } from 'aws-amplify';
import { Job, SearchFilters } from '../types';

interface SearchJobsResult {
  items: Job[];
  total: number;
}

class JobService {
  private baseUrl = '/api';

  async searchJobs(filters: SearchFilters, page: number, pageSize: number): Promise<SearchJobsResult> {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    const response = await axios.get(`${this.baseUrl}/jobs/search`, {
      params: {
        ...filters,
        page,
        pageSize,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getJobById(id: string): Promise<Job> {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    const response = await axios.get(`${this.baseUrl}/jobs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getJobSuggestions(query: string): Promise<string[]> {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    const response = await axios.get(`${this.baseUrl}/jobs/suggestions`, {
      params: { query },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getJobLocations(): Promise<string[]> {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    const response = await axios.get(`${this.baseUrl}/jobs/locations`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }

  async getJobTypes(): Promise<string[]> {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken();
    const response = await axios.get(`${this.baseUrl}/jobs/types`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
}

export default new JobService(); 