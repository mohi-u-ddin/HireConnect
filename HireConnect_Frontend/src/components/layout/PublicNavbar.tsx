import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard } from 'lucide-react';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/format';

const publicLinks = [
  { label: 'Jobs', to: '/jobs' },
  { label: 'Companies', to: '/companies' },
  { label: 'About', to: '/about' },
];

const dashboardPathByRole: Record<string, string> = {
  JOB_SEEKER: '/seeker/dashboard',
  EMPLOYER: '/employer/dashboard',
  ADMIN: '/admin/dashboard',
};

export function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, currentUser, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <div className="container-page h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden md:flex items-center gap-6">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'text-sm font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-slate-600 dark:text-slate-300 hover:text-primary'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAuthenticated && currentUser ? (
            <Dropdown
              align="right"
              trigger={<Avatar name={currentUser.fullName} size="sm" />}
              items={[
                {
                  label: 'Go to Dashboard',
                  icon: <LayoutDashboard size={15} />,
                  onClick: () => navigate(dashboardPathByRole[role ?? '']),
                },
                { label: 'Logout', icon: <LogOut size={15} />, onClick: logout, danger: true },
              ]}
            />
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary px-3 py-2">
                Login
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
          className="md:hidden p-2 text-slate-600 dark:text-slate-300"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 space-y-3 animate-fade-in">
          {publicLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-slate-700 dark:text-slate-200 py-2"
            >
              {link.label}
            </NavLink>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 py-2"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
          {isAuthenticated && currentUser ? (
            <div className="space-y-2 pt-2">
              <Button
                fullWidth
                variant="outline"
                onClick={() => {
                  setMobileOpen(false);
                  navigate(dashboardPathByRole[role ?? '']);
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                fullWidth
                variant="ghost"
                onClick={() => {
                  setMobileOpen(false);
                  logout();
                }}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button fullWidth variant="outline">
                  Login
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>
                <Button fullWidth>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
