import { Users, Building2, Briefcase, ClipboardList, UserCheck } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import {
  adminDashboardStats,
  userGrowthSeries,
  jobsPostedSeries,
  applicationsSeries,
  userDistribution,
} from '../../data/mock/dashboard';

function MiniBarChart({ data, dataKey, labelKey, color }: { data: any[]; dataKey: string; labelKey: string; color: string }) {
  const max = Math.max(...data.map((d) => d[dataKey]));
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

function DistributionBar() {
  const total = userDistribution.reduce((sum, d) => sum + d.value, 0);
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden">
        {userDistribution.map((d) => (
          <div key={d.label} style={{ width: `${(d.value / total) * 100}%`, backgroundColor: d.color }} />
        ))}
      </div>
      <div className="mt-4 space-y-2.5">
        {userDistribution.map((d) => (
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
  return (
    <DashboardLayout title="Admin Dashboard">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Platform-wide overview and statistics.</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Total Users" value={adminDashboardStats.totalUsers.toLocaleString()} icon={Users} accent="primary" />
        <StatCard label="Employers" value={adminDashboardStats.totalEmployers.toLocaleString()} icon={Building2} accent="secondary" />
        <StatCard label="Job Seekers" value={adminDashboardStats.totalJobSeekers.toLocaleString()} icon={UserCheck} accent="success" />
        <StatCard label="Active Jobs" value={adminDashboardStats.activeJobs.toLocaleString()} icon={Briefcase} accent="warning" />
        <StatCard label="Applications" value={adminDashboardStats.totalApplications.toLocaleString()} icon={ClipboardList} accent="danger" />
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
          <DistributionBar />
        </Card>
      </div>
    </DashboardLayout>
  );
}
