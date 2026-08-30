import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/format';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 text-sm placeholder:text-slate-400 transition-colors resize-y min-h-[100px]',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            error ? 'border-danger' : 'border-slate-300 dark:border-slate-700',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
