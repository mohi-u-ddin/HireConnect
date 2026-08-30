// ---------------------------------------------------------------------------
// Core domain types. These are designed to mirror the future Spring Boot
// DTOs as closely as possible so the service layer can be swapped from
// mock implementations to real REST calls without reshaping the UI.
// ---------------------------------------------------------------------------

export type Role = 'JOB_SEEKER' | 'EMPLOYER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'BLOCKED';

export type JobStatus = 'ACTIVE' | 'DRAFT' | 'CLOSED';

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'REJECTED';

export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'TEMPORARY';

export type ExperienceLevel =
  | 'ENTRY_LEVEL'
  | 'MID_LEVEL'
  | 'SENIOR_LEVEL'
  | 'MID_SENIOR_LEVEL'
  | 'LEAD'
  | 'DIRECTOR';

export type WorkArrangement = 'ON_SITE' | 'REMOTE' | 'HYBRID';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  headline?: string;
  about?: string;
  skills?: string[];
  experience?: WorkExperience[];
  education?: EducationEntry[];
  resume?: ResumeFile;
  profileCompletion?: number;
  createdAt: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear?: string;
}

export interface ResumeFile {
  fileName: string;
  uploadedAt: string;
  sizeKb?: number;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  website?: string;
  industry: string;
  companySize: string;
  location: string;
  foundedYear?: number;
  verified: boolean;
  employerId: string;
  jobsCount?: number;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  companyVerified?: boolean;
  category: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  skills: string[];
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  location: string;
  workArrangement: WorkArrangement;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  status: JobStatus;
  applicationDeadline?: string;
  applicationEmail?: string;
  resumeRequired: boolean;
  applicationsCount: number;
  postedAt: string;
  employerId: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  candidateId: string;
  candidateName: string;
  candidateEmail?: string;
  resumeFileName?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  [key: string]: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface JobFilters {
  keyword?: string;
  location?: string;
  employmentType?: EmploymentType[];
  experienceLevel?: ExperienceLevel[];
  workArrangement?: WorkArrangement[];
  category?: string[];
  salaryMin?: number;
  salaryMax?: number;
  sort?: 'relevant' | 'newest' | 'salary_desc' | 'salary_asc';
  page?: number;
  pageSize?: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  role: Extract<Role, 'JOB_SEEKER' | 'EMPLOYER'>;
}

export interface ApplyPayload {
  jobId: string;
  coverLetter?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  resumeFileName?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
