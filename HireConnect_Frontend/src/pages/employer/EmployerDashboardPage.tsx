import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ClipboardList, Star, CalendarCheck, ArrowRight, Plus } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { employerDashboardStats } from '../../data/mock/dashboard';
import { formatDate } from '../../utils/format';
import type { Job, JobApplication } from '../../types';

export function EmployerDashboardPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    jobService.getJobsByEmployer(currentUser.id).then((jobsData) => {
      setJobs(jobsData);
      applicationService.getApplicationsForEmployer(jobsData.map((j) => j.id)).then((apps) => {
        setApplications(apps);
        setIsLoading(false);
      });
    });
  }, [currentUser]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Welcome back, {currentUser?.fullName.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here&apos;s how your job postings are performing.</p>
        </div>
        <Link to="/employer/jobs/create">
          <Button>
            <Plus size={16} className="mr-1.5" /> Post New Job
          </Button>
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Active Jobs" value={jobs.filter((j) => j.status === 'ACTIVE').length || employerDashboardStats.activeJobs} icon={Briefcase} accent="primary" />
            <StatCard label="Total Applications" value={applications.length || employerDashboardStats.totalApplications} icon={ClipboardList} accent="secondary" />
            <StatCard label="Shortlisted" value={applications.filter((a) => a.status === 'SHORTLISTED').length || employerDashboardStats.shortlisted} icon={Star} accent="warning" />
            <StatCard label="Interviews" value={applications.filter((a) => a.status === 'INTERVIEW').length || employerDashboardStats.interviews} icon={CalendarCheck} accent="success" />
          </>
        )}
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card padded={false}>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
            <Link to="/employer/applications" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-4">
            {!isLoading && applications.length === 0 && (
              <div className="px-5 pb-5">
                <EmptyState icon={ClipboardList} title="No applications yet" description="Applications will appear here once candidates apply." />
              </div>
            )}
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 first:border-t-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{app.candidateName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {app.jobTitle} &middot; {formatDate(app.appliedAt)}
                  </p>
                </div>
                <StatusBadge status={app.status} kind="application" />
              </div>
            ))}
          </div>
        </Card>

        <Card padded={false}>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Your Job Postings</h2>
            <Link to="/employer/jobs" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-4">
            {!isLoading && jobs.length === 0 && (
              <div className="px-5 pb-5">
                <EmptyState icon={Briefcase} title="No jobs posted yet" description="Post your first job to start receiving applications." actionLabel="Post a Job" onAction={() => (window.location.href = '/employer/jobs/create')} />
              </div>
            )}
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 first:border-t-0">
                <div className="min-w-0">
                  <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-slate-800 dark:text-slate-100 hover:text-primary truncate block">
                    {job.title}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">{job.applicationsCount} applications</p>
                </div>
                <StatusBadge status={job.status} kind="job" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
