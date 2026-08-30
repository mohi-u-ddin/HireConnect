import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/format';

export function Logo({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2 flex-shrink-0', className)}>
      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
        <Zap size={17} fill="currentColor" strokeWidth={0} />
      </span>
      {!iconOnly && <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">HireConnect</span>}
    </Link>
  );
}
