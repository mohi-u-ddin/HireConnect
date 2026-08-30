import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Search } from 'lucide-react';
import type { Job } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { JobCard } from '../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { userService } from '../../services/userService';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function SavedJobsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [keyword, setKeyword] = useState('');

  const load = () => {
    if (!currentUser) return;
    setStatus('loading');
    Promise.all([userService.getSavedJobIds(currentUser.id), jobService.getJobs({ pageSize: 100 })])
      .then(([savedIds, allJobs]) => {
        setJobs(allJobs.items.filter((j) => savedIds.includes(j.id)));
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [currentUser]);

  const handleToggleSave = async (jobId: string) => {
    if (!currentUser) return;
    await userService.toggleSavedJob(currentUser.id, jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    showToast('Job removed from saved jobs.', 'success');
  };

  const filtered = jobs.filter((j) => j.title.toLowerCase().includes(keyword.toLowerCase()) || j.companyName.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <DashboardLayout title="Saved Jobs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">Jobs you&apos;ve bookmarked for later.</p>
        {jobs.length > 0 && (
          <div className="w-full sm:w-64">
            <Input icon={<Search size={15} />} placeholder="Search saved jobs" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>
        )}
      </div>

      {status === 'error' && <ErrorState onRetry={load} />}

      {status === 'loading' && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}

      {status === 'success' && jobs.length === 0 && (
        <EmptyState
          icon={Bookmark}
          title="No saved jobs yet."
          description="Start exploring opportunities and save jobs you're interested in."
          actionLabel="Find Jobs"
          onAction={() => navigate('/jobs')}
        />
      )}

      {status === 'success' && jobs.length > 0 && filtered.length === 0 && (
        <EmptyState icon={Search} title="No matches" description="Try a different search term." />
      )}

      {status === 'success' && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <JobCard key={job.id} job={job} isSaved onToggleSave={handleToggleSave} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
