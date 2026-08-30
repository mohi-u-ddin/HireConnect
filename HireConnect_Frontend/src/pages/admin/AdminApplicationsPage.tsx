import { useEffect, useMemo, useState } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import type { ApplicationStatus, JobApplication } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { applicationService } from '../../services/applicationService';
import { formatDate } from '../../utils/format';

const statusOptions: { value: ApplicationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'APPLIED', label: 'Applied' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function AdminApplicationsPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');

  const load = () => {
    setStatus('loading');
    applicationService
      .getAllApplicationsForAdmin()
      .then((data) => {
        setApplications(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return applications.filter((a) => {
      const matchesKeyword =
        a.candidateName.toLowerCase().includes(keyword.toLowerCase()) || a.jobTitle.toLowerCase().includes(keyword.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [applications, keyword, statusFilter]);

  const columns: Column<JobApplication>[] = [
    { header: 'Candidate', accessor: (a) => <span className="font-medium text-slate-800 dark:text-slate-100">{a.candidateName}</span> },
    { header: 'Job', accessor: (a) => <span className="text-slate-600 dark:text-slate-300">{a.jobTitle}</span> },
    { header: 'Company', accessor: (a) => <span className="text-slate-600 dark:text-slate-300">{a.companyName}</span> },
    { header: 'Applied', accessor: (a) => <span className="text-slate-500 dark:text-slate-400">{formatDate(a.appliedAt)}</span> },
    { header: 'Status', accessor: (a) => <StatusBadge status={a.status} kind="application" /> },
  ];

  return (
    <DashboardLayout title="Applications">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input icon={<Search size={15} />} placeholder="Search by candidate or job title" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as ApplicationStatus | 'ALL')} className="sm:w-52" />
      </div>

      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'success' && filtered.length === 0 && (
        <EmptyState icon={ClipboardList} title="No applications found" description="Try adjusting your search or filters." />
      )}
      {(status === 'loading' || filtered.length > 0) && (
        <DataTable columns={columns} data={filtered} isLoading={status === 'loading'} keyExtractor={(a) => a.id} />
      )}
    </DashboardLayout>
  );
}
