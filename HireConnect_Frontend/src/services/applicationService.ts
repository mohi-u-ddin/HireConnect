import type { ApplicationStatus, ApplyPayload, JobApplication } from '../types';
import { mockApplications } from '../data/mock/applications';
import { simulateLatency, ApiError } from './apiClient';
import { jobService } from './jobService';

const applications: JobApplication[] = [...mockApplications];

export const applicationService = {
  async apply(
    payload: ApplyPayload,
    candidate: { id: string; name: string; email: string }
  ): Promise<JobApplication> {
    await simulateLatency();

    const alreadyApplied = applications.some(
      (a) => a.jobId === payload.jobId && a.candidateId === candidate.id
    );
    if (alreadyApplied) {
      throw new ApiError('You have already applied to this job.', 409);
    }

    const job = await jobService.getJobById(payload.jobId);

    const newApplication: JobApplication = {
      id: `a${applications.length + 1}`,
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
    applications.unshift(newApplication);
    job.applicationsCount += 1;
    return newApplication;
  },

  async getMyApplications(candidateId: string): Promise<JobApplication[]> {
    await simulateLatency();
    return applications
      .filter((a) => a.candidateId === candidateId)
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  async hasApplied(jobId: string, candidateId: string): Promise<boolean> {
    await simulateLatency(80, 150);
    return applications.some((a) => a.jobId === jobId && a.candidateId === candidateId);
  },

  async getApplicationsForJob(jobId: string): Promise<JobApplication[]> {
    await simulateLatency();
    return applications.filter((a) => a.jobId === jobId);
  },

  async getApplicationsForEmployer(jobIds: string[]): Promise<JobApplication[]> {
    await simulateLatency();
    return applications
      .filter((a) => jobIds.includes(a.jobId))
      .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
  },

  async updateStatus(id: string, status: ApplicationStatus): Promise<JobApplication> {
    await simulateLatency();
    const idx = applications.findIndex((a) => a.id === id);
    if (idx === -1) throw new ApiError('Application not found.', 404);
    applications[idx] = { ...applications[idx], status, updatedAt: new Date().toISOString() };
    return applications[idx];
  },

  async getAllApplicationsForAdmin(): Promise<JobApplication[]> {
    await simulateLatency();
    return [...applications];
  },
};
