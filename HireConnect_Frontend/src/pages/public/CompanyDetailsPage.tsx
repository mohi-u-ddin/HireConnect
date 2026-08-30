import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Globe, MapPin, Users, Calendar, BadgeCheck } from 'lucide-react';
import type { Company, Job } from '../../types';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState, EmptyState } from '../../components/ui/EmptyState';
import { JobCard } from '../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../components/ui/Skeleton';
import { companyService } from '../../services/companyService';
import { jobService } from '../../services/jobService';
import { Briefcase } from 'lucide-react';

export function CompanyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [jobsLoading, setJobsLoading] = useState(true);

  const load = () => {
    if (!id) return;
    setStatus('loading');
    companyService
      .getCompanyById(id)
      .then((data) => {
        setCompany(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));

    setJobsLoading(true);
    jobService.getJobs({ pageSize: 50 }).then((res) => {
      setJobs(res.items.filter((j) => j.companyId === id));
      setJobsLoading(false);
    });
  };

  useEffect(load, [id]);

  if (status === 'loading') {
    return (
      <PublicLayout>
        <div className="container-page py-10 space-y-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PublicLayout>
    );
  }

  if (status === 'error' || !company) {
    return (
      <PublicLayout>
        <div className="container-page py-10">
          <ErrorState onRetry={load} />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container-page py-6">
        <Breadcrumbs items={[{ label: 'Companies', to: '/companies' }, { label: company.name }]} />
      </div>

      <div className="container-page pb-16">
        <Card>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <Avatar name={company.name} imageUrl={company.logoUrl} shape="square" size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{company.name}</h1>
                {company.verified && (
                  <span title="Verified company">
                    <BadgeCheck size={18} className="text-secondary" />
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{company.industry}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {company.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {company.companySize}
                </span>
                {company.foundedYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} /> Founded {company.foundedYear}
                  </span>
                )}
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <Globe size={14} /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">About {company.name}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{company.description}</p>
        </Card>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Open Positions {!jobsLoading && `(${jobs.length})`}
          </h2>
          {jobsLoading && (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          )}
          {!jobsLoading && jobs.length === 0 && (
            <EmptyState icon={Briefcase} title="No open positions" description="This company doesn't have any active job listings right now." />
          )}
          {!jobsLoading && jobs.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
