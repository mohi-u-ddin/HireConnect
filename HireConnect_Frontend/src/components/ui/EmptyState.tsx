import type { LucideIcon } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-5">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong.',
  description = "We couldn't load this information. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="flex items-center justify-center w-14 h-14 rounded-full bg-danger-light text-danger mb-4">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-5">
          Try Again
        </Button>
      )}
    </div>
  );
}
