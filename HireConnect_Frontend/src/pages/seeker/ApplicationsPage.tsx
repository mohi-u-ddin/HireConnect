import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { JobApplication } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/format';

export function ApplicationsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');

  const load = () => {
    if (!currentUser) return;
    setStatus('loading');
    applicationService
      .getMyApplications(currentUser.id)
      .then((data) => {
        setApplications(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [currentUser]);

  const columns: Column<JobApplication>[] = [
    {
      header: 'Job',
      accessor: (a) => (
        <Link to={`/jobs/${a.jobId}`} className="font-medium text-slate-800 dark:text-slate-100 hover:text-primary">
          {a.jobTitle}
        </Link>
      ),
    },
    { header: 'Company', accessor: (a) => <span className="text-slate-600 dark:text-slate-300">{a.companyName}</span> },
    { header: 'Applied', accessor: (a) => <span className="text-slate-500 dark:text-slate-400">{formatDate(a.appliedAt)}</span> },
    { header: 'Last Updated', accessor: (a) => <span className="text-slate-500 dark:text-slate-400">{formatDate(a.updatedAt)}</span> },
    { header: 'Status', accessor: (a) => <StatusBadge status={a.status} kind="application" /> },
    {
      header: '',
      accessor: (a) => (
        <Link to={`/jobs/${a.jobId}`} className="text-sm font-medium text-primary hover:underline">
          View Job
        </Link>
      ),
    },
  ];

  return (
    <DashboardLayout title="My Applications">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Track the status of every job you&apos;ve applied to.</p>

      {status === 'error' && <ErrorState onRetry={load} />}

      {status === 'success' && applications.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No applications yet"
          description="You haven't applied to any jobs. Start browsing to find your next opportunity."
          actionLabel="Find Jobs"
          onAction={() => navigate('/jobs')}
        />
      )}

      {(status === 'loading' || applications.length > 0) && (
        <DataTable columns={columns} data={applications} isLoading={status === 'loading'} keyExtractor={(a) => a.id} />
      )}
    </DashboardLayout>
  );
}
