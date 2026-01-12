import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Generic ErrorMessage component для Shell
 * Используется для отображения ошибок
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Произошла ошибка',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`error-message ${className}`.trim()}>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="error-message__retry">
          Попробовать снова
        </button>
      )}
    </div>
  );
};

