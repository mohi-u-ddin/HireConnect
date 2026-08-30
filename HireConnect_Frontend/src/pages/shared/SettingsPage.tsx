import { useState } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [jobAlerts, setJobAlerts] = useState(true);

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPassword('');
    setNewPassword('');
    showToast('Password updated.', 'success');
  };

  return (
    <DashboardLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Dark mode</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes.</p>
            </div>
            <button
              onClick={toggleTheme}
              role="switch"
              aria-checked={theme === 'dark'}
              className={`relative w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Notifications</h2>
          <div className="space-y-4">
            <ToggleRow
              label="Email notifications"
              description="Receive important account updates via email."
              checked={emailNotifs}
              onChange={setEmailNotifs}
            />
            <ToggleRow
              label="Job alerts"
              description="Get notified about new jobs matching your profile."
              checked={jobAlerts}
              onChange={setJobAlerts}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Change Password</h2>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input label="New password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <div className="flex justify-end">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </Card>

        <Card className="border-danger/20">
          <h2 className="text-sm font-semibold text-danger mb-2">Danger Zone</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Deleting your account is permanent and cannot be undone.
          </p>
          <Button variant="danger" onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          logout();
        }}
        title="Delete your account?"
        description={`This will permanently delete ${currentUser?.email}. This action cannot be undone.`}
        confirmLabel="Delete Account"
      />
    </DashboardLayout>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}
