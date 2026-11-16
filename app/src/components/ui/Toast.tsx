import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'danger' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-success shrink-0" />,
    danger: <AlertCircle size={18} className="text-danger shrink-0" />,
    info: <Info size={18} className="text-teal-900 shrink-0" />,
  };

  const borderColors = {
    success: 'border-success/30 bg-surface',
    danger: 'border-danger/40 bg-surface',
    info: 'border-teal-700/30 bg-surface',
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div
        className={`pointer-events-auto max-w-sm w-full p-3.5 rounded-card border shadow-card flex items-center justify-between gap-3 text-sm font-medium text-ink transition-all animate-bounce ${borderColors[type]}`}
        style={{ animationIterationCount: 1 }}
      >
        <div className="flex items-center gap-2.5">
          {icons[type]}
          <span>{message}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted hover:text-ink rounded-full"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

