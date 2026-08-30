import { useEffect, useState } from 'react';
import { Building2, Eye, Trash2, MoreVertical } from 'lucide-react';
import type { Company } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Dropdown } from '../../components/ui/Dropdown';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { companyService } from '../../services/companyService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';

export function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setStatus('loading');
    companyService
      .getCompanies()
      .then((data) => {
        setCompanies(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await companyService.deleteCompany(deleteTarget.id);
      setCompanies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      showToast('Company deleted.', 'success');
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Company>[] = [
    {
      header: 'Company',
      accessor: (c) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={c.name} shape="square" size="sm" />
          <span className="font-medium text-slate-800 dark:text-slate-100">{c.name}</span>
        </div>
      ),
    },
    { header: 'Employer ID', accessor: (c) => <span className="text-slate-500 dark:text-slate-400">{c.employerId}</span> },
    { header: 'Jobs', accessor: (c) => <span className="text-slate-600 dark:text-slate-300">{c.jobsCount ?? 0}</span> },
    {
      header: 'Status',
      accessor: (c) => <Badge color={c.status === 'ACTIVE' ? 'success' : c.status === 'PENDING' ? 'warning' : 'danger'}>{c.status}</Badge>,
    },
    { header: 'Created', accessor: (c) => <span className="text-slate-500 dark:text-slate-400">{formatDate(c.createdAt)}</span> },
    {
      header: 'Actions',
      accessor: (c) => (
        <Dropdown
          trigger={
            <span className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex">
              <MoreVertical size={16} />
            </span>
          }
          items={[
            { label: 'View', icon: <Eye size={14} />, onClick: () => window.open(`/companies/${c.id}`, '_blank') },
            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => setDeleteTarget(c), danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <DashboardLayout title="Companies">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Manage all companies registered on the platform.</p>

      {status === 'error' && <ErrorState onRetry={load} />}
      {status === 'success' && companies.length === 0 && (
        <EmptyState icon={Building2} title="No companies found" description="No companies have been registered yet." />
      )}
      {(status === 'loading' || companies.length > 0) && (
        <DataTable columns={columns} data={companies} isLoading={status === 'loading'} keyExtractor={(c) => c.id} />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this company?"
        description={`"${deleteTarget?.name}" and its job postings will be permanently removed.`}
        confirmLabel="Delete Company"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
