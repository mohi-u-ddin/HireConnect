import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../utils/format';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  trend?: { value: string; positive: boolean };
}

const accentClasses = {
  primary: 'bg-primary-light text-primary-700 dark:bg-primary/15 dark:text-primary-100',
  secondary: 'bg-secondary-light text-sky-700 dark:bg-secondary/15 dark:text-sky-300',
  success: 'bg-success-light text-success dark:bg-success/15 dark:text-green-300',
  warning: 'bg-warning-light text-warning dark:bg-warning/15 dark:text-amber-300',
  danger: 'bg-danger-light text-danger dark:bg-danger/15 dark:text-red-300',
};

export function StatCard({ label, value, icon: Icon, accent = 'primary', trend }: StatCardProps) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        {trend && (
          <p className={cn('mt-1 text-xs font-medium', trend.positive ? 'text-success' : 'text-danger')}>
            {trend.positive ? '\u2191' : '\u2193'} {trend.value}
          </p>
        )}
      </div>
      <div className={cn('flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0', accentClasses[accent])}>
        <Icon size={20} />
      </div>
    </Card>
  );
}
