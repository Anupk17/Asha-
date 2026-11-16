import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-btn select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-teal-900 text-white hover:bg-teal-700 focus:ring-teal-900 shadow-soft',
    secondary: 'bg-teal-100 text-teal-900 hover:bg-teal-100/80 focus:ring-teal-700 border border-teal-700/20',
    danger: 'bg-danger text-white hover:bg-danger/90 focus:ring-danger shadow-soft',
    ghost: 'bg-transparent text-ink hover:bg-teal-100/50 focus:ring-teal-900',
  };

  const sizes = {
    sm: 'text-sm h-11 px-4 gap-2',
    md: 'text-base h-14 min-h-[56px] px-6 gap-2.5',
    lg: 'text-lg h-16 min-h-[56px] px-8 gap-3 font-semibold',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

