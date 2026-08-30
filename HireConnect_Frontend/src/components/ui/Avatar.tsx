import { initials, cn } from '../../utils/format';

interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'square';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const palette = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
];

function colorFor(name: string): string {
  const idx = name.charCodeAt(0) % palette.length;
  return palette[idx];
}

export function Avatar({ name, imageUrl, size = 'md', shape = 'circle', className }: AvatarProps) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={cn(sizeClasses[size], shapeClass, 'object-cover flex-shrink-0', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        shapeClass,
        colorFor(name),
        'flex items-center justify-center font-semibold flex-shrink-0 select-none',
        className
      )}
      aria-label={name}
    >
      {initials(name) || '?'}
    </div>
  );
}
