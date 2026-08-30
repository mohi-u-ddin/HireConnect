import type { EmploymentType, ExperienceLevel, WorkArrangement } from '../types';

export function formatSalary(min: number, max: number, currency = 'USD'): string {
  const fmt = (n: number) => `${n.toLocaleString()}`;
  const symbol = currency === 'USD' ? '$' : currency + ' ';
  return `${symbol}${fmt(min)} \u2013 ${symbol}${fmt(max)}/month`;
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const futureDays = Math.abs(diffDays);
    return futureDays === 0 ? 'today' : `in ${futureDays}d`;
  }
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary',
};

export function formatEmploymentType(type: EmploymentType): string {
  return employmentTypeLabels[type];
}

const experienceLevelLabels: Record<ExperienceLevel, string> = {
  ENTRY_LEVEL: 'Entry Level',
  MID_LEVEL: 'Mid Level',
  MID_SENIOR_LEVEL: 'Mid-Senior Level',
  SENIOR_LEVEL: 'Senior Level',
  LEAD: 'Lead',
  DIRECTOR: 'Director',
};

export function formatExperienceLevel(level: ExperienceLevel): string {
  return experienceLevelLabels[level];
}

const workArrangementLabels: Record<WorkArrangement, string> = {
  ON_SITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
};

export function formatWorkArrangement(arrangement: WorkArrangement): string {
  return workArrangementLabels[arrangement];
}

export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
