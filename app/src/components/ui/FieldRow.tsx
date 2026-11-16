import React from 'react';
import { Edit2 } from 'lucide-react';

export interface FieldRowProps {
  label: string;
  value?: string | number | null;
  placeholder?: string;
  isEdited?: boolean;
  isDanger?: boolean;
  isUnknown?: boolean;
  unit?: string;
  onTap?: () => void;
  icon?: React.ReactNode;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  value,
  placeholder = 'Not checked',
  isEdited = false,
  isDanger = false,
  isUnknown = false,
  unit,
  onTap,
  icon,
}) => {
  return (
    <div
      onClick={onTap}
      role={onTap ? 'button' : undefined}
      tabIndex={onTap ? 0 : undefined}
      className={`min-h-[56px] px-4 py-3 flex items-center justify-between rounded-card border transition-all duration-200 ${
        isDanger
          ? 'bg-danger/10 border-danger text-danger'
          : isEdited
          ? 'bg-saffron-100 border-saffron-500/50 text-ink animate-pulse'
          : isUnknown
          ? 'bg-cream/80 border-dashed border-line text-muted'
          : 'bg-surface border-line text-ink'
      } ${onTap ? 'cursor-pointer hover:border-teal-700/50 active:bg-teal-100/30' : ''}`}
    >
      <div className="flex items-center gap-3">
        {icon && <div className="text-muted shrink-0">{icon}</div>}
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </div>
          <div className="text-base font-medium flex items-baseline gap-1 mt-0.5">
            {value !== undefined && value !== null && value !== '' ? (
              <>
                <span className={isDanger ? 'font-bold text-danger' : 'text-ink'}>
                  {value}
                </span>
                {unit && <span className="text-xs text-muted font-normal">{unit}</span>}
              </>
            ) : (
              <span className="text-sm italic text-muted">{placeholder}</span>
            )}
          </div>
        </div>
      </div>

      {onTap && (
        <div className="shrink-0 p-2 text-muted hover:text-teal-700 transition-colors">
          <Edit2 size={18} />
        </div>
      )}
    </div>
  );
};

