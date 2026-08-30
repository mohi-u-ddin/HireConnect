import { Link } from 'react-router-dom';
import { MapPin, Bookmark, BadgeCheck, Clock, Briefcase } from 'lucide-react';
import type { Job } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { formatSalary, formatRelativeTime, formatEmploymentType, formatExperienceLevel, formatWorkArrangement, cn } from '../../utils/format';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  compact?: boolean;
}

export function JobCard({ job, isSaved, onToggleSave, compact }: JobCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-shadow duration-150 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/jobs/${job.id}`} className="flex items-start gap-3 min-w-0 flex-1">
          <Avatar name={job.companyName} imageUrl={job.companyLogoUrl} shape="square" size="lg" />
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
              {job.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              <span className="truncate">{job.companyName}</span>
              {job.companyVerified && (
                <span title="Verified company">
                  <BadgeCheck size={14} className="text-secondary flex-shrink-0" />
                </span>
              )}
            </div>
          </div>
        </Link>
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(job.id)}
            aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
            aria-pressed={isSaved}
            className={cn(
              'p-2 rounded-lg flex-shrink-0 transition-colors',
              isSaved ? 'text-primary bg-primary-light' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            <Bookmark size={18} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {job.location} • {formatWorkArrangement(job.workArrangement)}
        </span>
      </div>

      <p className="mt-2 font-semibold text-slate-800 dark:text-slate-100 text-sm">
        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
      </p>

      {!compact && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge color="primary" icon={<Briefcase size={11} />}>
            {formatEmploymentType(job.employmentType)}
          </Badge>
          <Badge color="neutral">{formatExperienceLevel(job.experienceLevel)}</Badge>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <span className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} />
          Posted {formatRelativeTime(job.postedAt)}
        </span>
        <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-primary hover:underline">
          View details
        </Link>
      </div>
    </div>
  );
}
