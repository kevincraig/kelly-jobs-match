import { useState } from 'react';
import { Job, SearchFilters, PaginationInfo } from '../types';
import jobService from '../services/jobService';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const searchJobs = async (filters: SearchFilters, page: number, pageSize: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await jobService.searchJobs(filters, page, pageSize);
      setJobs(result.items);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(result.total / pageSize),
        totalItems: result.total,
        itemsPerPage: pageSize,
        startIndex: (page - 1) * pageSize + 1,
        endIndex: Math.min(page * pageSize, result.total),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getJobById = async (id: string): Promise<Job | null> => {
    try {
      setLoading(true);
      setError(null);
      const job = await jobService.getJobById(id);
      return job;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    jobs,
    loading,
    error,
    pagination,
    searchJobs,
    getJobById,
  };
}; 