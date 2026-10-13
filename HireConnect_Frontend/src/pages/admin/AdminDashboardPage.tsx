import { useEffect, useState } from 'react';
import { Users, Building2, Briefcase, ClipboardList, UserCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { StatCardSkeleton } from '../../components/ui/Skeleton';
import { Card } from '../../components/ui/Card';
import { userService } from '../../services/userService';
import {
  userGrowthSeries,
  jobsPostedSeries,
  applicationsSeries,
} from '../../data/mock/dashboard';

function MiniBarChart({ data, dataKey, labelKey, color }: { data: any[]; dataKey: string; labelKey: string; color: string }) {
  const max = Math.max(...data.map((d) => d[dataKey]), 1);
  return (
    <div className="flex items-end gap-2.5 h-40">
      {data.map((d) => (
        <div key={d[labelKey]} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex items-end h-32 rounded-md overflow-hidden bg-slate-50 dark:bg-slate-800/50">
            <div
              className="w-full rounded-t-md transition-all"
              style={{ height: `${(d[dataKey] / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span className="text-xs text-slate-400">{d[labelKey]}</span>
        </div>
      ))}
    </div>
  );
}

function DistributionBar({ distribution }: { distribution: { label: string; value: number; color: string }[] }) {
  const total = distribution.reduce((sum, d) => sum + d.value, 0);
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {total > 0
          ? distribution.map((d) => (
              <div key={d.label} style={{ width: `${(d.value / total) * 100}%`, backgroundColor: d.color }} />
            ))
          : <div className="w-full bg-slate-200 dark:bg-slate-700" />}
      </div>
      <div className="mt-4 space-y-2.5">
        {distribution.map((d) => (
          <div key={d.label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label}
            </span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{d.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    totalJobSeekers: 0,
    totalEmployers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    userService
      .getAdminStats()
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const totalAdmins = Math.max(0, stats.totalUsers - stats.totalJobSeekers - stats.totalEmployers);
  const userDistribution = [
    { label: 'Job Seekers', value: stats.totalJobSeekers, color: '#4F46E5' },
    { label: 'Employers', value: stats.totalEmployers, color: '#0EA5E9' },
    { label: 'Admins', value: totalAdmins, color: '#94A3B8' },
  ];

  return (
    <DashboardLayout title="Admin Dashboard">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Platform-wide overview and statistics.</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} icon={Users} accent="primary" />
            <StatCard label="Companies" value={stats.totalCompanies.toLocaleString()} icon={Building2} accent="secondary" />
            <StatCard label="Job Seekers" value={stats.totalJobSeekers.toLocaleString()} icon={UserCheck} accent="success" />
            <StatCard label="Active Jobs" value={stats.totalJobs.toLocaleString()} icon={Briefcase} accent="warning" />
            <StatCard label="Applications" value={stats.totalApplications.toLocaleString()} icon={ClipboardList} accent="danger" />
          </>
        )}
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">User Growth</h2>
          <MiniBarChart data={userGrowthSeries} dataKey="users" labelKey="month" color="#4F46E5" />
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Jobs Posted</h2>
          <MiniBarChart data={jobsPostedSeries} dataKey="jobs" labelKey="month" color="#0EA5E9" />
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Applications Over Time</h2>
          <MiniBarChart data={applicationsSeries} dataKey="applications" labelKey="month" color="#16A34A" />
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">User Distribution</h2>
          <DistributionBar distribution={userDistribution} />
        </Card>
      </div>
    </DashboardLayout>
  );
}
