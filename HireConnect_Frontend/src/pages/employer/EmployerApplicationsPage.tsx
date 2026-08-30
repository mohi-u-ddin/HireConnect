import { useEffect, useState } from 'react';
import { ClipboardList, ExternalLink, FileText } from 'lucide-react';
import type { ApplicationStatus, JobApplication } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { formatDate } from '../../utils/format';

const statusFlow: ApplicationStatus[] = ['APPLIED', 'SHORTLISTED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'];

export function EmployerApplicationsPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = () => {
    if (!currentUser) return;
    setStatus('loading');
    jobService
      .getJobsByEmployer(currentUser.id)
      .then((jobs) => applicationService.getApplicationsForEmployer(jobs.map((j) => j.id)))
      .then((data) => {
        setApplications(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [currentUser]);

  const handleStatusChange = async (app: JobApplication, newStatus: ApplicationStatus) => {
    setUpdatingId(app.id);
    try {
      const updated = await applicationService.updateStatus(app.id, newStatus);
      setApplications((prev) => prev.map((a) => (a.id === app.id ? updated : a)));
      if (selected?.id === app.id) setSelected(updated);
      showToast('Application status updated.', 'success');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: Column<JobApplication>[] = [
    {
      header: 'Candidate',
      accessor: (app) => (
        <button onClick={() => setSelected(app)} className="flex items-center gap-2.5 text-left">
          <Avatar name={app.candidateName} size="sm" />
          <span className="font-medium text-slate-800 dark:text-slate-100 hover:text-primary">{app.candidateName}</span>
        </button>
      ),
    },
    { header: 'Job', accessor: (app) => <span className="text-slate-600 dark:text-slate-300">{app.jobTitle}</span> },
    { header: 'Applied', accessor: (app) => <span className="text-slate-500 dark:text-slate-400">{formatDate(app.appliedAt)}</span> },
    { header: 'Status', accessor: (app) => <StatusBadge status={app.status} kind="application" /> },
    {
      header: 'Actions',
      accessor: (app) => (
        <Button size="sm" variant="outline" onClick={() => setSelected(app)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout title="Applications">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Review and manage candidates who applied to your jobs.</p>

      {status === 'error' && <ErrorState onRetry={load} />}

      {status === 'success' && applications.length === 0 && (
        <EmptyState icon={ClipboardList} title="No candidates yet" description="Applications will appear here once candidates apply to your jobs." />
      )}

      {(status === 'loading' || applications.length > 0) && (
        <DataTable columns={columns} data={applications} isLoading={status === 'loading'} keyExtractor={(a) => a.id} />
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.candidateName} size="md">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Avatar name={selected.candidateName} size="lg" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{selected.candidateName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selected.candidateEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Job Applied</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{selected.jobTitle}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Applied On</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(selected.appliedAt)}</p>
              </div>
            </div>

            {selected.resumeFileName && (
              <div className="flex items-center gap-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
                <FileText size={16} className="text-primary" />
                <span className="text-sm text-slate-700 dark:text-slate-200 flex-1">{selected.resumeFileName}</span>
                <button className="text-xs font-medium text-primary hover:underline">Download</button>
              </div>
            )}

            {selected.coverLetter && (
              <div>
                <p className="text-xs text-slate-400 mb-1.5">Cover Letter</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{selected.coverLetter}</p>
              </div>
            )}

            <div className="flex gap-4 text-sm">
              {selected.portfolioUrl && (
                <a href={selected.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  Portfolio <ExternalLink size={12} />
                </a>
              )}
              {selected.linkedinUrl && (
                <a href={selected.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                  LinkedIn <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {statusFlow.map((s) => (
                  <button
                    key={s}
                    disabled={updatingId === selected.id}
                    onClick={() => handleStatusChange(selected, s)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50 ${
                      selected.status === s
                        ? 'bg-primary text-white border-primary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
