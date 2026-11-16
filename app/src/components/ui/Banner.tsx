import React, { useEffect } from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export interface BannerProps {
  type: 'danger' | 'info' | 'success';
  title: string;
  message?: string;
  guidelineSource?: string;
  actionText?: string;
  onAction?: () => void;
  vibrate?: boolean;
}

export const Banner: React.FC<BannerProps> = ({
  type,
  title,
  message,
  guidelineSource,
  actionText,
  onAction,
  vibrate = true,
}) => {
  useEffect(() => {
    if (type === 'danger' && vibrate && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {
        // Ignore vibration errors if unsupported
      }
    }
  }, [type, vibrate]);

  const configs = {
    danger: {
      container: 'bg-danger text-white border-danger shadow-md',
      icon: <AlertTriangle size={24} className="stroke-[2.5] text-white shrink-0 mt-0.5" />,
      tag: 'bg-white/20 text-white border border-white/30',
      btn: 'bg-white text-danger hover:bg-cream active:scale-95',
    },
    info: {
      container: 'bg-teal-100 text-teal-900 border-teal-700/30',
      icon: <Info size={24} className="text-teal-900 shrink-0 mt-0.5" />,
      tag: 'bg-teal-700/10 text-teal-900 border border-teal-700/20',
      btn: 'bg-teal-900 text-white hover:bg-teal-700 active:scale-95',
    },
    success: {
      container: 'bg-success/15 text-success border-success/40',
      icon: <CheckCircle2 size={24} className="text-success shrink-0 mt-0.5" />,
      tag: 'bg-success/20 text-success border border-success/30',
      btn: 'bg-success text-white hover:bg-success/90 active:scale-95',
    },
  };

  const cfg = configs[type];

  return (
    <div
      role={type === 'danger' ? 'alert' : 'status'}
      className={`w-full rounded-card p-4 border flex items-start gap-3 transition-all duration-200 ${cfg.container}`}
    >
      {cfg.icon}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-bold text-base tracking-wide leading-snug">{title}</h4>
          {guidelineSource && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.tag}`}>
              {guidelineSource}
            </span>
          )}
        </div>
        {message && <p className="text-sm mt-1 opacity-90 leading-relaxed">{message}</p>}
        {actionText && onAction && (
          <button
            type="button"
            onClick={onAction}
            className={`mt-3 px-4 py-2 text-sm font-semibold rounded-btn shadow-sm transition-transform ${cfg.btn}`}
          >
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

