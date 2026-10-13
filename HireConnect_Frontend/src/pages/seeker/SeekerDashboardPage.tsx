import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Bookmark, CalendarCheck, Star, ArrowRight } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { applicationService } from '../../services/applicationService';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/format';
import type { ApplicationStatus, JobApplication } from '../../types';

const statusOrder: ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'REJECTED'];

export function SeekerDashboardPage() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setIsLoading(true);
    Promise.all([
      applicationService.getMyApplications(currentUser.id),
      userService.getSavedJobIds(currentUser.id),
    ])
      .then(([data, savedIds]) => {
        setApplications(data);
        setSavedJobsCount(savedIds.length);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, [currentUser]);

  const firstName = currentUser?.fullName.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const statusCounts: Record<ApplicationStatus, number> = {
    APPLIED: applications.filter((a) => a.status === 'APPLIED').length,
    SHORTLISTED: applications.filter((a) => a.status === 'SHORTLISTED').length,
    INTERVIEW: applications.filter((a) => a.status === 'INTERVIEW').length,
    ACCEPTED: applications.filter((a) => a.status === 'ACCEPTED').length,
    REJECTED: applications.filter((a) => a.status === 'REJECTED').length,
  };

  const maxStatusCount = Math.max(...statusOrder.map((s) => statusCounts[s]), 1);

  return (
    <DashboardLayout title="Dashboard">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">
        {greeting}, {firstName}
      </h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here is what&apos;s happening with your job search.</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Applications" value={applications.length} icon={FileText} accent="primary" />
            <StatCard label="Saved Jobs" value={savedJobsCount} icon={Bookmark} accent="secondary" />
            <StatCard label="Shortlisted" value={statusCounts.SHORTLISTED} icon={Star} accent="warning" />
            <StatCard label="Interviews" value={statusCounts.INTERVIEW} icon={CalendarCheck} accent="success" />
          </>
        )}
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Application Status</h2>
          <div className="space-y-4">
            {statusOrder.map((status) => {
              const value = statusCounts[status];
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <StatusBadge status={status} kind="application" />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(value / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="lg:col-span-2" padded={false}>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Applications</h2>
            <Link to="/seeker/applications" className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="mt-4">
            {!isLoading && applications.length === 0 && (
              <div className="px-5 pb-5">
                <EmptyState
                  icon={FileText}
                  title="No applications yet"
                  description="Start applying to jobs to see your applications here."
                  actionLabel="Find Jobs"
                  onAction={() => (window.location.href = '/jobs')}
                />
              </div>
            )}
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 first:border-t-0"
              >
                <div className="min-w-0">
                  <Link to={`/jobs/${app.jobId}`} className="text-sm font-medium text-slate-800 dark:text-slate-100 hover:text-primary truncate block">
                    {app.jobTitle}
                  </Link>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {app.companyName} &middot; Applied {formatDate(app.appliedAt)}
                  </p>
                </div>
                <StatusBadge status={app.status} kind="application" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
