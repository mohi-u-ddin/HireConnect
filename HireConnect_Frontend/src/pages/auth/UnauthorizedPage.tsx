import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { Button } from '../../components/ui/Button';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg dark:bg-bg-dark text-center">
      <Logo className="mb-10" />
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-light text-danger mb-5">
        <ShieldAlert size={28} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Access denied</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        You don&apos;t have permission to view this page. Try returning to your dashboard or the homepage.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button variant="outline">Go Home</Button>
        </Link>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    </div>
  );
}
