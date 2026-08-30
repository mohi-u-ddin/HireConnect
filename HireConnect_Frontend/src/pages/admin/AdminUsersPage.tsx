import { useEffect, useMemo, useState } from 'react';
import { Search, Users as UsersIcon, Eye, Ban, CheckCircle, Trash2, MoreVertical } from 'lucide-react';
import type { User, UserStatus } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dropdown } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';

const PAGE_SIZE = 8;

const roleOptions = [
  { value: 'ALL', label: 'All Roles' },
  { value: 'JOB_SEEKER', label: 'Job Seeker' },
  { value: 'EMPLOYER', label: 'Employer' },
  { value: 'ADMIN', label: 'Admin' },
];
const statusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'BLOCKED', label: 'Blocked' },
];

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [viewUser, setViewUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ user: User; action: 'block' | 'unblock' | 'delete' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  const load = () => {
    setStatus('loading');
    userService
      .getAllUsers()
      .then((data) => {
        setUsers(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesKeyword = u.fullName.toLowerCase().includes(keyword.toLowerCase()) || u.email.toLowerCase().includes(keyword.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [users, keyword, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setIsProcessing(true);
    try {
      const { user, action } = confirmAction;
      if (action === 'delete') {
        await userService.deleteUser(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        showToast('User deleted.', 'success');
      } else {
        const newStatus: UserStatus = action === 'block' ? 'BLOCKED' : 'ACTIVE';
        const updated = await userService.setUserStatus(user.id, newStatus);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
        showToast(action === 'block' ? 'User blocked.' : 'User unblocked.', 'success');
      }
      setConfirmAction(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns: Column<User>[] = [
    {
      header: 'User',
      accessor: (u) => (
        <button onClick={() => setViewUser(u)} className="flex items-center gap-2.5 text-left">
          <Avatar name={u.fullName} size="sm" />
          <span className="font-medium text-slate-800 dark:text-slate-100 hover:text-primary">{u.fullName}</span>
        </button>
      ),
    },
    { header: 'Email', accessor: (u) => <span className="text-slate-500 dark:text-slate-400">{u.email}</span> },
    { header: 'Role', accessor: (u) => <Badge color="neutral">{u.role.replace('_', ' ')}</Badge> },
    { header: 'Status', accessor: (u) => <StatusBadge status={u.status} kind="user" /> },
    { header: 'Joined', accessor: (u) => <span className="text-slate-500 dark:text-slate-400">{formatDate(u.createdAt)}</span> },
    {
      header: 'Actions',
      accessor: (u) => (
        <Dropdown
          trigger={
            <span className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex">
              <MoreVertical size={16} />
            </span>
          }
          items={[
            { label: 'View', icon: <Eye size={14} />, onClick: () => setViewUser(u) },
            u.status === 'ACTIVE'
              ? { label: 'Block', icon: <Ban size={14} />, onClick: () => setConfirmAction({ user: u, action: 'block' }), danger: true }
              : { label: 'Unblock', icon: <CheckCircle size={14} />, onClick: () => setConfirmAction({ user: u, action: 'unblock' }) },
            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => setConfirmAction({ user: u, action: 'delete' }), danger: true },
          ]}
        />
      ),
    },
  ];

  return (
    <DashboardLayout title="Users">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input icon={<Search size={15} />} placeholder="Search by name or email" value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} />
        </div>
        <Select options={roleOptions} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} className="sm:w-44" />
        <Select options={statusOptions} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="sm:w-44" />
      </div>

      {status === 'error' && <ErrorState onRetry={load} />}

      {status === 'success' && filtered.length === 0 && (
        <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your search or filters." />
      )}

      {(status === 'loading' || paginated.length > 0) && (
        <>
          <DataTable columns={columns} data={paginated} isLoading={status === 'loading'} keyExtractor={(u) => u.id} />
          <div className="mt-6">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}

      <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title="User Details" size="sm">
        {viewUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={viewUser.fullName} size="lg" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">{viewUser.fullName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{viewUser.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Role</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{viewUser.role.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <StatusBadge status={viewUser.status} kind="user" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Joined</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(viewUser.createdAt)}</p>
              </div>
              {viewUser.location && (
                <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="font-medium text-slate-700 dark:text-slate-200">{viewUser.location}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={
          confirmAction?.action === 'delete'
            ? 'Delete this user?'
            : confirmAction?.action === 'block'
            ? 'Block this user?'
            : 'Unblock this user?'
        }
        description={
          confirmAction?.action === 'delete'
            ? `"${confirmAction?.user.fullName}" will be permanently removed from the platform.`
            : confirmAction?.action === 'block'
            ? `"${confirmAction?.user.fullName}" will no longer be able to log in.`
            : `"${confirmAction?.user.fullName}" will regain access to their account.`
        }
        confirmLabel={confirmAction?.action === 'delete' ? 'Delete' : confirmAction?.action === 'block' ? 'Block' : 'Unblock'}
        isDanger={confirmAction?.action !== 'unblock'}
        isLoading={isProcessing}
      />
    </DashboardLayout>
  );
}
