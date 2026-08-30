import { Link } from 'react-router-dom';
import { MapPin, BadgeCheck, Briefcase } from 'lucide-react';
import type { Company } from '../../types';
import { Avatar } from '../ui/Avatar';

export function CompanyCard({ company }: { company: Company }) {
  return (
    <Link
      to={`/companies/${company.id}`}
      className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 transition-shadow duration-150 hover:shadow-card-hover"
    >
      <div className="flex items-start gap-3">
        <Avatar name={company.name} imageUrl={company.logoUrl} shape="square" size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
              {company.name}
            </h3>
            {company.verified && (
              <span title="Verified company">
                <BadgeCheck size={14} className="text-secondary flex-shrink-0" />
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{company.industry}</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{company.description}</p>
      <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {company.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={12} />
          {company.jobsCount ?? 0} open jobs
        </span>
      </div>
    </Link>
  );
}
