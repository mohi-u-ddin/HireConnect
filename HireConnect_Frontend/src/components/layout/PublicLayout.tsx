import type { ReactNode } from 'react';
import { PublicNavbar } from './PublicNavbar';
import { Footer } from './Footer';

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg dark:bg-bg-dark">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
