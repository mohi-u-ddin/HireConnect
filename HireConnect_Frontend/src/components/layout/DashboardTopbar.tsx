import { Menu, Sun, Moon, Bell, User, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';

export function DashboardTopbar({ onMenuClick, title }: { onMenuClick: () => void; title?: string }) {
  const { currentUser, logout, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const profilePath = role === 'JOB_SEEKER' ? '/seeker/profile' : role === 'EMPLOYER' ? '/employer/company' : '/admin/settings';
  const settingsPath = role === 'JOB_SEEKER' ? '/seeker/settings' : role === 'EMPLOYER' ? '/employer/settings' : '/admin/settings';

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu size={20} />
        </button>
        {title && <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white truncate">{title}</h1>}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger" />
        </button>
        <Dropdown
          align="right"
          trigger={<Avatar name={currentUser?.fullName ?? 'User'} size="sm" />}
          items={[
            { label: 'Profile', icon: <User size={15} />, onClick: () => navigate(profilePath) },
            { label: 'Settings', icon: <Settings size={15} />, onClick: () => navigate(settingsPath) },
            { label: 'Logout', icon: <LogOut size={15} />, onClick: logout, danger: true },
          ]}
        />
      </div>
    </header>
  );
}
