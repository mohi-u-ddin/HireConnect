import type { Job, JobFilters, PaginatedResult } from '../types';
import { mockJobs } from '../data/mock/jobs';
import { simulateLatency, ApiError } from './apiClient';

const jobs: Job[] = [...mockJobs];

function applyFilters(source: Job[], filters: JobFilters): Job[] {
  let result = [...source];

  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase();
    result = result.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        j.companyName.toLowerCase().includes(kw) ||
        j.skills.some((s) => s.toLowerCase().includes(kw))
    );
  }
  if (filters.location) {
    const loc = filters.location.toLowerCase();
    result = result.filter((j) => j.location.toLowerCase().includes(loc));
  }
  if (filters.employmentType?.length) {
    result = result.filter((j) => filters.employmentType!.includes(j.employmentType));
  }
  if (filters.experienceLevel?.length) {
    result = result.filter((j) => filters.experienceLevel!.includes(j.experienceLevel));
  }
  if (filters.workArrangement?.length) {
    result = result.filter((j) => filters.workArrangement!.includes(j.workArrangement));
  }
  if (filters.category?.length) {
    result = result.filter((j) => filters.category!.includes(j.category));
  }
  if (filters.salaryMin != null) {
    result = result.filter((j) => j.salaryMax >= filters.salaryMin!);
  }
  if (filters.salaryMax != null) {
    result = result.filter((j) => j.salaryMin <= filters.salaryMax!);
  }

  switch (filters.sort) {
    case 'newest':
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      break;
    case 'salary_desc':
      result.sort((a, b) => b.salaryMax - a.salaryMax);
      break;
    case 'salary_asc':
      result.sort((a, b) => a.salaryMin - b.salaryMin);
      break;
    default:
      // "Most relevant" — keep insertion order (would be relevance-ranked by backend)
      break;
  }

  return result;
}

export const jobService = {
  async getJobs(filters: JobFilters = {}): Promise<PaginatedResult<Job>> {
    await simulateLatency();

    const activeOnly = jobs.filter((j) => j.status === 'ACTIVE');
    const filtered = applyFilters(activeOnly, filters);

    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 9;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    return {
      items,
      total: filtered.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filtered.length / pageSize)),
    };
  },

  async getFeaturedJobs(limit = 8): Promise<Job[]> {
    await simulateLatency();
    return jobs.filter((j) => j.status === 'ACTIVE').slice(0, limit);
  },

  async getJobById(id: string): Promise<Job> {
    await simulateLatency();
    const job = jobs.find((j) => j.id === id);
    if (!job) throw new ApiError('Job not found.', 404);
    return job;
  },

  async getJobsByEmployer(employerId: string): Promise<Job[]> {
    await simulateLatency();
    return jobs.filter((j) => j.employerId === employerId);
  },

  async createJob(payload: Omit<Job, 'id' | 'applicationsCount' | 'postedAt'>): Promise<Job> {
    await simulateLatency();
    const newJob: Job = {
      ...payload,
      id: `j${jobs.length + 1}`,
      applicationsCount: 0,
      postedAt: new Date().toISOString(),
    };
    jobs.unshift(newJob);
    return newJob;
  },

  async updateJob(id: string, payload: Partial<Job>): Promise<Job> {
    await simulateLatency();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new ApiError('Job not found.', 404);
    jobs[idx] = { ...jobs[idx], ...payload };
    return jobs[idx];
  },

  async deleteJob(id: string): Promise<void> {
    await simulateLatency();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new ApiError('Job not found.', 404);
    jobs.splice(idx, 1);
  },

  async getAllJobsForAdmin(): Promise<Job[]> {
    await simulateLatency();
    return [...jobs];
  },
};
