import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { Logo } from '../../components/layout/Logo';
import { Button } from '../../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg dark:bg-bg-dark text-center">
      <Logo className="mb-10" />
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-light text-primary-700 mb-5">
        <Compass size={28} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
