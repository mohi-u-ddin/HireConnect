import type { Job, JobFilters, PaginatedResult } from '../types';
import { mockJobs } from '../data/mock/jobs';
import { apiClient, simulateLatency, ApiError } from './apiClient';
import { mapBackendJobToJob, mapBackendPageToPaginatedResult } from './adapters';

const fallbackJobs: Job[] = [...mockJobs];

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
      break;
  }

  return result;
}

export const jobService = {
  async getJobs(filters: JobFilters = {}): Promise<PaginatedResult<Job>> {
    // 1. Try real backend
    try {
      const params = new URLSearchParams();
      if (filters.keyword) params.append('keyword', filters.keyword);
      if (filters.location) params.append('location', filters.location);
      if (filters.category?.length) params.append('category', filters.category[0]);
      if (filters.employmentType?.length) params.append('employmentType', filters.employmentType[0]);
      if (filters.experienceLevel?.length) params.append('experienceLevel', filters.experienceLevel[0]);
      if (filters.workArrangement?.length) params.append('workArrangement', filters.workArrangement[0]);
      if (filters.salaryMin != null) params.append('minSalary', String(filters.salaryMin));
      if (filters.salaryMax != null) params.append('maxSalary', String(filters.salaryMax));

      if (filters.sort === 'newest') params.append('sortBy', 'createdAt');
      else if (filters.sort === 'salary_desc') params.append('sortBy', 'salaryMax');
      else if (filters.sort === 'salary_asc') params.append('sortBy', 'salaryMin');

      const page = filters.page ?? 1;
      const pageSize = filters.pageSize ?? 9;
      // Spring Data is 0-indexed
      params.append('page', String(Math.max(0, page - 1)));
      params.append('size', String(pageSize));

      const res = await apiClient.get<any>(`/jobs?${params.toString()}`);
      return mapBackendPageToPaginatedResult(res, mapBackendJobToJob, page, pageSize);
    } catch (err) {
      console.warn('[jobService.getJobs] Backend request failed, falling back to mock data:', err);
      await simulateLatency();

      const activeOnly = fallbackJobs.filter((j) => j.status === 'ACTIVE');
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
    }
  },

  async getFeaturedJobs(limit = 8): Promise<Job[]> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>(`/jobs?page=0&size=${limit}`);
      if (res && Array.isArray(res.content)) {
        return res.content.map(mapBackendJobToJob);
      }
      if (Array.isArray(res)) {
        return res.slice(0, limit).map(mapBackendJobToJob);
      }
    } catch (err) {
      console.warn('[jobService.getFeaturedJobs] Backend request failed, falling back to mock data:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return fallbackJobs.filter((j) => j.status === 'ACTIVE').slice(0, limit);
  },

  async getJobById(id: string): Promise<Job> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>(`/jobs/${id}`);
      if (res && (res.id != null || res.title)) {
        return mapBackendJobToJob(res);
      }
    } catch (err) {
      console.warn(`[jobService.getJobById] Backend request for job ${id} failed, falling back to mock:`, err);
    }

    // 2. Fallback
    await simulateLatency();
    const job = fallbackJobs.find((j) => j.id === id);
    if (!job) throw new ApiError('Job not found.', 404);
    return job;
  },

  async getJobsByEmployer(employerId: string): Promise<Job[]> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>('/jobs/my-postings?page=0&size=50');
      if (res && Array.isArray(res.content)) {
        return res.content.map(mapBackendJobToJob);
      }
      if (Array.isArray(res)) {
        return res.map(mapBackendJobToJob);
      }
    } catch (err) {
      console.warn('[jobService.getJobsByEmployer] Backend request failed, falling back to mock data:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return fallbackJobs.filter((j) => j.employerId === employerId);
  },

  async createJob(payload: Omit<Job, 'id' | 'applicationsCount' | 'postedAt'>): Promise<Job> {
    // 1. Try real backend
    try {
      const body = {
        title: payload.title,
        description: payload.description,
        responsibilities: Array.isArray(payload.responsibilities)
          ? payload.responsibilities.join('\n')
          : String(payload.responsibilities ?? ''),
        requirements: Array.isArray(payload.requirements)
          ? payload.requirements.join('\n')
          : String(payload.requirements ?? ''),
        salaryMin: payload.salaryMin,
        salaryMax: payload.salaryMax,
        currency: payload.currency || 'USD',
        location: payload.location,
        category: payload.category,
        employmentType: payload.employmentType,
        experienceLevel: payload.experienceLevel,
        workArrangement: payload.workArrangement,
        applicationDeadline: payload.applicationDeadline || null,
      };

      const res = await apiClient.post<any>('/jobs', body);
      if (res && res.id) {
        const createdJob = mapBackendJobToJob(res);
        fallbackJobs.unshift(createdJob);
        return createdJob;
      }
    } catch (err) {
      console.warn('[jobService.createJob] Backend request failed, falling back to mock create:', err);
    }

    // 2. Fallback
    await simulateLatency();
    const newJob: Job = {
      ...payload,
      id: `j${fallbackJobs.length + 1}`,
      applicationsCount: 0,
      postedAt: new Date().toISOString(),
    };
    fallbackJobs.unshift(newJob);
    return newJob;
  },

  async updateJob(id: string, payload: Partial<Job>): Promise<Job> {
    // 1. Try real backend
    try {
      const body = {
        title: payload.title,
        description: payload.description,
        responsibilities: Array.isArray(payload.responsibilities)
          ? payload.responsibilities.join('\n')
          : payload.responsibilities,
        requirements: Array.isArray(payload.requirements)
          ? payload.requirements.join('\n')
          : payload.requirements,
        salaryMin: payload.salaryMin,
        salaryMax: payload.salaryMax,
        currency: payload.currency || 'USD',
        location: payload.location,
        category: payload.category,
        employmentType: payload.employmentType,
        experienceLevel: payload.experienceLevel,
        workArrangement: payload.workArrangement,
        applicationDeadline: payload.applicationDeadline,
        status: payload.status,
      };

      const res = await apiClient.put<any>(`/jobs/${id}`, body);
      if (res && res.id) {
        return mapBackendJobToJob(res);
      }
    } catch (err) {
      console.warn(`[jobService.updateJob] Backend request for job ${id} failed, falling back to mock update:`, err);
    }

    // 2. Fallback
    await simulateLatency();
    const idx = fallbackJobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new ApiError('Job not found.', 404);
    fallbackJobs[idx] = { ...fallbackJobs[idx], ...payload };
    return fallbackJobs[idx];
  },

  async deleteJob(id: string): Promise<void> {
    // 1. Try real backend
    try {
      await apiClient.delete(`/jobs/${id}`);
      const idx = fallbackJobs.findIndex((j) => j.id === id);
      if (idx !== -1) fallbackJobs.splice(idx, 1);
      return;
    } catch (err) {
      console.warn(`[jobService.deleteJob] Backend request for job ${id} failed, falling back to mock delete:`, err);
    }

    // 2. Fallback
    await simulateLatency();
    const idx = fallbackJobs.findIndex((j) => j.id === id);
    if (idx === -1) throw new ApiError('Job not found.', 404);
    fallbackJobs.splice(idx, 1);
  },

  async getAllJobsForAdmin(): Promise<Job[]> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>('/jobs?page=0&size=100');
      if (res && Array.isArray(res.content)) {
        return res.content.map(mapBackendJobToJob);
      }
      if (Array.isArray(res)) {
        return res.map(mapBackendJobToJob);
      }
    } catch (err) {
      console.warn('[jobService.getAllJobsForAdmin] Backend request failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return [...fallbackJobs];
  },

  async getPublicPlatformStats(): Promise<{
    totalJobs: number;
    totalCompanies: number;
    totalJobSeekers: number;
    totalApplications: number;
  }> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<Record<string, any>>('/jobs/platform-stats');
      if (res) {
        return {
          totalJobs: Number(res.totalJobs ?? 0),
          totalCompanies: Number(res.totalCompanies ?? 0),
          totalJobSeekers: Number(res.totalJobSeekers ?? 0),
          totalApplications: Number(res.totalApplications ?? 0),
        };
      }
    } catch (err) {
      console.warn('[jobService.getPublicPlatformStats] Backend request failed, falling back:', err);
    }

    // 2. Fallback (counts from mock fallback)
    return {
      totalJobs: fallbackJobs.filter((j) => j.status === 'ACTIVE').length,
      totalCompanies: 0,
      totalJobSeekers: 0,
      totalApplications: 0,
    };
  },
};
