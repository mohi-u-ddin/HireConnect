import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  isDanger = true,
  isLoading,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-start">
        <div
          className={`flex items-center justify-center w-11 h-11 rounded-full mb-4 ${
            isDanger ? 'bg-danger-light text-danger' : 'bg-primary-light text-primary-700'
          }`}
        >
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        <div className="mt-6 flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} fullWidth disabled={isLoading}>
            Cancel
          </Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm} fullWidth isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
