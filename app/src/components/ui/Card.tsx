import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'cream' | 'danger' | 'saffron';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  interactive = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-card border p-4 transition-all duration-150';

  const variants = {
    surface: 'bg-surface border-line shadow-card text-ink',
    cream: 'bg-cream border-line text-ink',
    danger: 'bg-danger/5 border-danger/30 text-ink',
    saffron: 'bg-saffron-100/50 border-saffron-500/30 text-ink',
  };

  const interactiveStyles = interactive
    ? 'cursor-pointer hover:shadow-md hover:border-teal-700/40 active:scale-[0.99]'
    : '';

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

