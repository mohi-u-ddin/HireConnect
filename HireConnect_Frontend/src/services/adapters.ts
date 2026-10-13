import type { Company, Job, JobApplication, PaginatedResult, User } from '../types';

export function parseList(val: unknown): string[] {
  if (Array.isArray(val)) {
    return val.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof val === 'string' && val.trim().length > 0) {
    return val
      .split(/\r?\n|•|- |\t/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [];
}

export function mapBackendUserToUser(dto: any): User {
  if (!dto) throw new Error('Cannot map empty user DTO');
  return {
    id: String(dto.id),
    fullName: dto.fullName ?? dto.name ?? '',
    email: dto.email ?? '',
    role: dto.role ?? 'JOB_SEEKER',
    status: dto.status ?? (dto.enabled === false ? 'BLOCKED' : 'ACTIVE'),
    avatarUrl: dto.avatarUrl ?? dto.profileImage ?? undefined,
    phone: dto.phone ?? undefined,
    location: dto.location ?? undefined,
    headline: dto.headline ?? undefined,
    about: dto.about ?? undefined,
    skills: Array.isArray(dto.skills) ? dto.skills : parseList(dto.skills),
    experience: dto.experience ?? [],
    education: dto.education ?? [],
    resume: dto.resumeUrl
      ? { fileName: dto.resumeUrl, uploadedAt: dto.updatedAt ?? dto.createdAt ?? new Date().toISOString() }
      : dto.resume,
    profileCompletion: dto.profileCompletion ?? 80,
    createdAt: dto.createdAt ? String(dto.createdAt) : new Date().toISOString(),
  };
}

export function mapBackendJobToJob(dto: any): Job {
  if (!dto) throw new Error('Cannot map empty job DTO');
  return {
    id: String(dto.id),
    title: dto.title ?? '',
    companyId: String(dto.companyId ?? ''),
    companyName: dto.companyName ?? 'Company',
    companyLogoUrl: dto.companyLogoUrl ?? undefined,
    companyVerified: dto.companyVerified ?? true,
    category: dto.category ?? 'Other',
    description: dto.description ?? '',
    responsibilities: parseList(dto.responsibilities),
    requirements: parseList(dto.requirements),
    benefits: parseList(dto.benefits),
    skills: parseList(dto.skills ?? dto.requirements),
    employmentType: dto.employmentType ?? 'FULL_TIME',
    experienceLevel: dto.experienceLevel ?? 'MID_LEVEL',
    location: dto.location ?? '',
    workArrangement: dto.workArrangement ?? 'ON_SITE',
    salaryMin: Number(dto.salaryMin ?? 0),
    salaryMax: Number(dto.salaryMax ?? 0),
    currency: dto.currency ?? 'USD',
    status: dto.status ?? 'ACTIVE',
    applicationDeadline: dto.applicationDeadline ? String(dto.applicationDeadline) : undefined,
    applicationEmail: dto.applicationEmail ?? undefined,
    resumeRequired: dto.resumeRequired ?? true,
    applicationsCount: Number(dto.applicationsCount ?? 0),
    postedAt: dto.createdAt ? String(dto.createdAt) : (dto.postedAt ?? new Date().toISOString()),
    employerId: String(dto.employerId ?? ''),
  };
}

export function mapBackendApplicationToApplication(dto: any): JobApplication {
  if (!dto) throw new Error('Cannot map empty application DTO');
  return {
    id: String(dto.id),
    jobId: String(dto.jobId),
    jobTitle: dto.jobTitle ?? 'Job Application',
    companyName: dto.companyName ?? '',
    companyLogoUrl: dto.companyLogoUrl ?? undefined,
    candidateId: String(dto.candidateId ?? dto.applicantId ?? ''),
    candidateName: dto.candidateName ?? dto.applicantName ?? '',
    candidateEmail: dto.candidateEmail ?? dto.applicantEmail ?? undefined,
    resumeFileName: dto.resumeFileName ?? dto.resumeUrl ?? undefined,
    coverLetter: dto.coverLetter ?? undefined,
    portfolioUrl: dto.portfolioUrl ?? undefined,
    linkedinUrl: dto.linkedinUrl ?? dto.linkedInUrl ?? undefined,
    status: dto.status ?? 'APPLIED',
    appliedAt: dto.appliedAt ? String(dto.appliedAt) : new Date().toISOString(),
    updatedAt: dto.updatedAt ? String(dto.updatedAt) : new Date().toISOString(),
  };
}

export function mapBackendCompanyToCompany(dto: any): Company {
  if (!dto) throw new Error('Cannot map empty company DTO');
  return {
    id: String(dto.id),
    name: dto.name ?? '',
    logoUrl: dto.logoUrl ?? undefined,
    description: dto.description ?? '',
    website: dto.website ?? undefined,
    industry: dto.industry ?? '',
    companySize: dto.companySize ?? '',
    location: dto.location ?? '',
    foundedYear: dto.foundedYear ? Number(dto.foundedYear) : undefined,
    verified: dto.verified ?? true,
    employerId: String(dto.employerId ?? ''),
    jobsCount: Number(dto.jobsCount ?? 0),
    status: dto.status ?? 'ACTIVE',
    createdAt: dto.createdAt ? String(dto.createdAt) : new Date().toISOString(),
  };
}

export function mapBackendPageToPaginatedResult<T, R>(
  res: any,
  itemMapper: (item: T) => R,
  page = 1,
  pageSize = 9
): PaginatedResult<R> {
  // If backend returned PageResponseDto: { content, totalElements, pageNumber, pageSize, totalPages }
  if (res && Array.isArray(res.content)) {
    return {
      items: res.content.map(itemMapper),
      total: Number(res.totalElements ?? res.content.length),
      page: Number(res.pageNumber ?? 0) + 1, // backend page is 0-indexed
      pageSize: Number(res.pageSize ?? pageSize),
      totalPages: Math.max(1, Number(res.totalPages ?? 1)),
    };
  }

  // If backend returned a raw array
  if (Array.isArray(res)) {
    const total = res.length;
    const start = (page - 1) * pageSize;
    const items = res.slice(start, start + pageSize).map(itemMapper);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  return {
    items: [],
    total: 0,
    page,
    pageSize,
    totalPages: 1,
  };
}
