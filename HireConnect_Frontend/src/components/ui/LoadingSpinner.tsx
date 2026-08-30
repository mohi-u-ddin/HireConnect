import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/format';

export function LoadingSpinner({ size = 24, className, label = 'Loading' }: { size?: number; className?: string; label?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)} role="status" aria-label={label}>
      <Loader2 size={size} className="animate-spin text-primary" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
