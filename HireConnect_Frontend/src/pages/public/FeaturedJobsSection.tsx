import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Job } from '../../types';
import { jobService } from '../../services/jobService';
import { JobCard } from '../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';

export function FeaturedJobsSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

  const load = () => {
    setStatus('loading');
    jobService
      .getFeaturedJobs(8)
      .then((data) => {
        setJobs(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  return (
    <section className="container-page py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Featured Jobs</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hand-picked opportunities from top companies</p>
        </div>
        <Link to="/jobs" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline flex-shrink-0">
          View all jobs <ArrowRight size={14} />
        </Link>
      </div>

      {status === 'error' && <ErrorState onRetry={load} />}

      {status !== 'error' && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {status === 'loading' && Array.from({ length: 8 }).map((_, i) => <JobCardSkeleton key={i} />)}
          {status === 'success' && jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      )}

      <div className="mt-8 flex sm:hidden justify-center">
        <Link to="/jobs" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all jobs <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
