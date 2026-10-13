



import type { ApplicationStatus, ApplyPayload, JobApplication } from '../types';
import { mockApplications } from '../data/mock/applications';
import { apiClient, simulateLatency, ApiError } from './apiClient';
import { jobService } from './jobService';
import { mapBackendApplicationToApplication } from './adapters';

const fallbackApplications: JobApplication[] = [...mockApplications];

export const applicationService = {
  async apply(
    payload: ApplyPayload,
    candidate: { id: string; name: string; email: string }
  ): Promise<JobApplication> {
    // 1. Try real backend
    try {
      const jobIdNumeric = Number(payload.jobId.replace(/\D/g, '')) || Number(payload.jobId) || 1;
      const body = {
        jobId: jobIdNumeric,
        resumeUrl: payload.resumeFileName || 'resume.pdf',
        coverLetter: payload.coverLetter || '',
        portfolioUrl: payload.portfolioUrl || '',
        linkedInUrl: payload.linkedinUrl || '',
      };

      const res = await apiClient.post<any>('/applications', body);
      if (res && res.id) {
        const mapped = mapBackendApplicationToApplication(res);
        fallbackApplications.unshift(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('[applicationService.apply] Backend apply failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();

    const alreadyApplied = fallbackApplications.some(
      (a) => a.jobId === payload.jobId && a.candidateId === candidate.id
    );
    if (alreadyApplied) {
      throw new ApiError('You have already applied to this job.', 409);
    }

    const job = await jobService.getJobById(payload.jobId);

    const newApplication: JobApplication = {
      id: `a${fallbackApplications.length + 1}`,
      jobId: payload.jobId,
      jobTitle: job.title,
      companyName: job.companyName,
      companyLogoUrl: job.companyLogoUrl,
      candidateId: candidate.id,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      resumeFileName: payload.resumeFileName,
      coverLetter: payload.coverLetter,
      portfolioUrl: payload.portfolioUrl,
      linkedinUrl: payload.linkedinUrl,
      status: 'APPLIED',
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackApplications.unshift(newApplication);
    job.applicationsCount += 1;
    return newApplication;
  },

  async getMyApplications(candidateId: string): Promise<JobApplication[]> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>('/applications/my?page=0&size=50');
      if (res && Array.isArray(res.content)) {
        return res.content.map(mapBackendApplicationToApplication);
      }
      if (Array.isArray(res)) {
        return res.map(mapBackendApplicationToApplication);
      }
    } catch (err) {
      console.warn('[applicationService.getMyApplications] Backend request failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return fallbackApplications
      .filter((a) => a.candidateId === candidateId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  async hasApplied(jobId: string, candidateId: string): Promise<boolean> {
    // 1. Try checking real backend applications
    try {
      const myApps = await this.getMyApplications(candidateId);
      if (myApps.some((a) => String(a.jobId) === String(jobId))) {
        return true;
      }
    } catch {
      // ignore and check fallback
    }

    // 2. Fallback
    await simulateLatency(50, 100);
    return fallbackApplications.some((a) => String(a.jobId) === String(jobId) && a.candidateId === candidateId);
  },

  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    // 1. Try real backend
    try {
      const jobIdNumeric = Number(jobId.replace(/\D/g, '')) || Number(jobId);
      const res = await apiClient.get<any>(`/applications/job/${jobIdNumeric}?page=0&size=50`);
      if (res && Array.isArray(res.content)) {
        return res.content.map(mapBackendApplicationToApplication);
      }
      if (Array.isArray(res)) {
        return res.map(mapBackendApplicationToApplication);
      }
    } catch (err) {
      console.warn(`[applicationService.getApplicationsForJob] Backend request for job ${jobId} failed, falling back to mock:`, err);
    }

    // 2. Fallback
    await simulateLatency();
    return fallbackApplications.filter((a) => String(a.jobId) === String(jobId));
  },

  async getApplicationsForEmployer(jobIds: string[]): Promise<JobApplication[]> {
    if (jobIds.length === 0) {
      return [];
    }

    // 1. Try real backend by fetching each job's applications
    try {
      const promises = jobIds.map(async (id) => {
        const jobIdNumeric = Number(id.replace(/\D/g, '')) || Number(id);
        const res = await apiClient.get<any>(`/applications/job/${jobIdNumeric}?page=0&size=50`);
        if (res && Array.isArray(res.content)) {
          return res.content.map(mapBackendApplicationToApplication);
        }
        if (Array.isArray(res)) {
          return res.map(mapBackendApplicationToApplication);
        }
        return [];
      });

      const results = await Promise.all(promises);
      const collected: JobApplication[] = results.flat();
      return collected.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    } catch (err) {
      console.warn('[applicationService.getApplicationsForEmployer] Failed real backend calls, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return fallbackApplications
      .filter((a) => jobIds.includes(String(a.jobId)))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  async updateStatus(id: string, status: ApplicationStatus): Promise<JobApplication> {
    // 1. Try real backend
    try {
      const res = await apiClient.patch<any>(`/applications/${id}/status`, { status });
      if (res && res.id) {
        return mapBackendApplicationToApplication(res);
      }
    } catch (err) {
      console.warn(`[applicationService.updateStatus] Backend request for application ${id} failed, falling back to mock:`, err);
    }

    // 2. Fallback
    await simulateLatency();
    const idx = fallbackApplications.findIndex((a) => String(a.id) === String(id));
    if (idx === -1) throw new ApiError('Application not found.', 404);
    fallbackApplications[idx] = { ...fallbackApplications[idx], status, updatedAt: new Date().toISOString() };
    return fallbackApplications[idx];
  },

  async getAllApplicationsForAdmin(): Promise<JobApplication[]> {
    // 1. Try real backend by fetching all jobs and their applications
    try {
      const allJobs = await jobService.getAllJobsForAdmin();
      if (allJobs.length === 0) {
        return [];
      }
      return await this.getApplicationsForEmployer(allJobs.map((j) => j.id));
    } catch (err) {
      console.warn('[applicationService.getAllApplicationsForAdmin] Backend request failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return [...fallbackApplications];
  },
};
