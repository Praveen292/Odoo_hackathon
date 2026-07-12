import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  const btnClass = variant === 'danger' ? 'btn-danger' : variant === 'warning' ? 'btn bg-warning-600 text-white hover:bg-warning-700' : 'btn-primary';
  const iconColor = variant === 'danger' ? 'text-error-500' : variant === 'warning' ? 'text-warning-500' : 'text-primary-500';

  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-4">
        <AlertTriangle className={`h-6 w-6 shrink-0 ${iconColor}`} />
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">{cancelText}</button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={btnClass}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}
