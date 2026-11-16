import React from 'react';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'teal' | 'saffron' | 'danger' | 'neutral' | 'success';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'teal',
  size = 'md',
  icon,
  removable = false,
  onRemove,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors select-none';

  const variants = {
    teal: 'bg-teal-100 text-teal-900 border border-teal-700/20',
    saffron: 'bg-saffron-100 text-ink border border-saffron-500/30',
    danger: 'bg-danger/10 text-danger border border-danger/30 font-semibold',
    neutral: 'bg-cream text-muted border border-line',
    success: 'bg-success/10 text-success border border-success/30',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-1 -mr-1 p-0.5 hover:bg-black/10 rounded-full"
          aria-label="Remove"
        >
          ✕
        </button>
      )}
    </span>
  );
};

