import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const icons: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: 'border-success/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
  error: 'border-danger/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
  info: 'border-primary/20 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100',
};

const iconColors: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-primary',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] sm:w-auto sm:max-w-sm">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              role="status"
              className={`flex items-start gap-3 rounded-lg border shadow-card-hover px-4 py-3 animate-slide-in-right ${styles[toast.type]}`}
            >
              <Icon size={18} className={`mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`} />
              <p className="text-sm flex-1">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
