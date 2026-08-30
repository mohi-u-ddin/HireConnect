import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Logo } from './Logo';
import type { NavItem } from './navConfig';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/format';

interface SidebarProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ items, isOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-16 flex items-center px-5 border-b border-slate-200 dark:border-slate-800">
          <Logo />
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split('/').length <= 2}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-light text-primary-700 dark:bg-primary/15 dark:text-primary-100'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 w-full transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
