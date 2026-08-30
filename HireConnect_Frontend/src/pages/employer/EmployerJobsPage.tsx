import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Plus, Eye, Pencil, Users, Trash2 } from 'lucide-react';
import type { Job } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dropdown } from '../../components/ui/Dropdown';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { jobService } from '../../services/jobService';
import { formatDate, formatRelativeTime } from '../../utils/format';
import { MoreVertical } from 'lucide-react';

export function EmployerJobsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => {
    if (!currentUser) return;
    setStatus('loading');
    jobService
      .getJobsByEmployer(currentUser.id)
      .then((data) => {
        setJobs(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [currentUser]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await jobService.deleteJob(deleteTarget.id);
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      showToast('Job deleted successfully.', 'success');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Job>[] = [
    {
      header: 'Job Title',
      accessor: (job) => (
        <div>
          <Link to={`/jobs/${job.id}`} className="font-medium text-slate-800 dark:text-slate-100 hover:text-primary">
            {job.title}
          </Link>
          <p className="text-xs text-slate-400">{job.location}</p>
        </div>
      ),
    },
    { header: 'Status', accessor: (job) => <StatusBadge status={job.status} kind="job" /> },
    { header: 'Applications', accessor: (job) => <span className="text-slate-600 dark:text-slate-300">{job.applicationsCount}</span> },
    { header: 'Posted', accessor: (job) => <span className="text-slate-500 dark:text-slate-400">{formatRelativeTime(job.postedAt)}</span> },
    {
      header: 'Deadline',
      accessor: (job) => <span className="text-slate-500 dark:text-slate-400">{job.applicationDeadline ? formatDate(job.applicationDeadline) : '\u2014'}</span>,
    },
    {
      header: 'Actions',
      accessor: (job) => (
        <Dropdown
          trigger={
            <span className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex">
              <MoreVertical size={16} />
            </span>
          }
          items={[
            { label: 'View', icon: <Eye size={14} />, onClick: () => navigate(`/jobs/${job.id}`) },
            { label: 'Edit', icon: <Pencil size={14} />, onClick: () => navigate(`/employer/jobs/${job.id}/edit`) },
            { label: 'Applications', icon: <Users size={14} />, onClick: () => navigate('/employer/applications') },
            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => setDeleteTarget(job), danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <DashboardLayout title="My Jobs">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage all your job postings in one place.</p>
        <Link to="/employer/jobs/create">
          <Button>
            <Plus size={16} className="mr-1.5" /> Post New Job
          </Button>
        </Link>
      </div>

      {status === 'error' && <ErrorState onRetry={load} />}

      {status === 'success' && jobs.length === 0 && (
        <EmptyState
          icon={Briefcase}
          title="No jobs posted yet"
          description="Create your first job posting to start receiving applications."
          actionLabel="Post a Job"
          onAction={() => navigate('/employer/jobs/create')}
        />
      )}

      {(status === 'loading' || jobs.length > 0) && (
        <DataTable columns={columns} data={jobs} isLoading={status === 'loading'} keyExtractor={(j) => j.id} />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this job posting?"
        description={`"${deleteTarget?.title}" will be permanently removed along with its applications.`}
        confirmLabel="Delete Job"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
