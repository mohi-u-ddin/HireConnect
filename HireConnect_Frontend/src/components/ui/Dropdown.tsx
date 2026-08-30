import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../utils/format';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-40 mt-2 w-56 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card-hover py-1.5 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              role="menuitem"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                item.danger ? 'text-danger' : 'text-slate-700 dark:text-slate-200'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
