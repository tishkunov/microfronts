import React from 'react';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Generic Spinner component для Shell
 * Используется для loading states
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', className = '' }) => {
  const sizeClass = `spinner--${size}`;
  const classes = `spinner ${sizeClass} ${className}`.trim();

  return (
    <div className={classes} role="status" aria-label="Loading">
      <div className="spinner-circle" />
    </div>
  );
};

