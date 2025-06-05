import axios from 'axios';
import { Job, SearchFilters } from '../types';

interface SearchJobsResult {
  items: Job[];
  total: number;
}

class JobService {
  private baseUrl = '/api';

  async searchJobs(filters: SearchFilters, page: number, pageSize: number): Promise<SearchJobsResult> {
    const response = await axios.get(`${this.baseUrl}/jobs`, {
      params: {
        ...filters,
        page,
        pageSize,
      },
    });
    return response.data;
  }

  async getJobById(id: string): Promise<Job> {
    const response = await axios.get(`${this.baseUrl}/jobs/${id}`);
    return response.data;
  }

  async getJobSuggestions(query: string): Promise<string[]> {
    const response = await axios.get(`${this.baseUrl}/jobs/suggestions`, {
      params: { query },
    });
    return response.data;
  }

  async getJobLocations(): Promise<string[]> {
    const response = await axios.get(`${this.baseUrl}/jobs/locations`);
    return response.data;
  }

  async getJobTypes(): Promise<string[]> {
    const response = await axios.get(`${this.baseUrl}/jobs/types`);
    return response.data;
  }
}

export default new JobService(); 