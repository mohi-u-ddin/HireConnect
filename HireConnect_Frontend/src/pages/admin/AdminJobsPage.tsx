import { useEffect, useState } from 'react';
import { Briefcase, Eye, Ban, Trash2, MoreVertical } from 'lucide-react';
import type { Job } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Dropdown } from '../../components/ui/Dropdown';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { jobService } from '../../services/jobService';
import { useToast } from '../../context/ToastContext';
import { formatRelativeTime } from '../../utils/format';

export function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [closeTarget, setCloseTarget] = useState<Job | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setStatus('loading');
    jobService
      .getAllJobsForAdmin()
      .then((data) => {
        setJobs(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsProcessing(true);
    try {
      await jobService.deleteJob(deleteTarget.id);
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      showToast('Job deleted.', 'success');
      setDeleteTarget(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = async () => {
    if (!closeTarget) return;
    setIsProcessing(true);
    try {
      const updated = await jobService.updateJob(closeTarget.id, { status: 'CLOSED' });
      setJobs((prev) => prev.map((j) => (j.id === closeTarget.id ? updated : j)));
      showToast('Job closed.', 'success');
      setCloseTarget(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: Column<Job>[] = [
    { header: 'Job', accessor: (j) => <span className="font-medium text-slate-800 dark:text-slate-100">{j.title}</span> },
    { header: 'Company', accessor: (j) => <span className="text-slate-600 dark:text-slate-300">{j.companyName}</span> },
    { header: 'Applications', accessor: (j) => <span className="text-slate-600 dark:text-slate-300">{j.applicationsCount}</span> },
    { header: 'Status', accessor: (j) => <StatusBadge status={j.status} kind="job" /> },
    { header: 'Posted', accessor: (j) => <span className="text-slate-500 dark:text-slate-400">{formatRelativeTime(j.postedAt)}</span> },
    {
      header: 'Actions',
      accessor: (j) => (
        <Dropdown
          trigger={
            <span className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex">
              <MoreVertical size={16} />
            </span>
          }
          items={[
            { label: 'View', icon: <Eye size={14} />, onClick: () => window.open(`/jobs/${j.id}`, '_blank') },
            ...(j.status !== 'CLOSED' ? [{ label: 'Close', icon: <Ban size={14} />, onClick: () => setCloseTarget(j) }] : []),
            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => setDeleteTarget(j), danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <DashboardLayout title="Jobs">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Moderate all job postings across the platform.</p>

      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'success' && jobs.length === 0 && (
        <EmptyState icon={Briefcase} title="No jobs found" description="No jobs have been posted yet." />
      )}
      {(status === 'loading' || jobs.length > 0) && (
        <DataTable columns={columns} data={jobs} isLoading={status === 'loading'} keyExtractor={(j) => j.id} />
      )}

      <ConfirmDialog
        isOpen={!!closeTarget}
        onClose={() => setCloseTarget(null)}
        onConfirm={handleClose}
        title="Close this job?"
        description={`"${closeTarget?.title}" will no longer accept new applications.`}
        confirmLabel="Close Job"
        isDanger={false}
        isLoading={isProcessing}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this job?"
        description={`"${deleteTarget?.title}" and its applications will be permanently removed.`}
        confirmLabel="Delete Job"
        isLoading={isProcessing}
      />
    </DashboardLayout>
  );
}
