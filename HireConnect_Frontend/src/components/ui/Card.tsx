import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/format';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hoverable?: boolean;
  padded?: boolean;
}

export function Card({ children, hoverable, padded = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-card',
        hoverable && 'transition-shadow duration-150 hover:shadow-card-hover',
        padded && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
