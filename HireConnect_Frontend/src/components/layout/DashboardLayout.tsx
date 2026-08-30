import { useState, type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { DashboardTopbar } from './DashboardTopbar';
import { getNavItemsForRole } from './navConfig';
import { useAuth } from '../../context/AuthContext';

export function DashboardLayout({ children, title }: { children: ReactNode; title?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { role } = useAuth();
  const items = getNavItemsForRole(role);

  return (
    <div className="min-h-screen flex bg-bg dark:bg-bg-dark">
      <Sidebar items={items} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <DashboardTopbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
