import type { ReactNode } from 'react';
import { cn } from '../../utils/format';

type BadgeColor = 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'secondary';

interface BadgeProps {
  children: ReactNode;
  color?: BadgeColor;
  icon?: ReactNode;
  className?: string;
}

const colorClasses: Record<BadgeColor, string> = {
  primary: 'bg-primary-light text-primary-700 dark:bg-primary/15 dark:text-primary-100',
  success: 'bg-success-light text-success dark:bg-success/15 dark:text-green-300',
  warning: 'bg-warning-light text-warning dark:bg-warning/15 dark:text-amber-300',
  danger: 'bg-danger-light text-danger dark:bg-danger/15 dark:text-red-300',
  neutral: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  secondary: 'bg-secondary-light text-sky-700 dark:bg-secondary/15 dark:text-sky-300',
};

export function Badge({ children, color = 'neutral', icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        colorClasses[color],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

const applicationStatusColor: Record<string, BadgeColor> = {
  APPLIED: 'primary',
  SHORTLISTED: 'secondary',
  INTERVIEW: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'danger',
};

const jobStatusColor: Record<string, BadgeColor> = {
  ACTIVE: 'success',
  DRAFT: 'neutral',
  CLOSED: 'danger',
};

const userStatusColor: Record<string, BadgeColor> = {
  ACTIVE: 'success',
  BLOCKED: 'danger',
};

export function StatusBadge({ status, kind }: { status: string; kind: 'application' | 'job' | 'user' }) {
  const map = kind === 'application' ? applicationStatusColor : kind === 'job' ? jobStatusColor : userStatusColor;
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return <Badge color={map[status] ?? 'neutral'}>{label}</Badge>;
}
