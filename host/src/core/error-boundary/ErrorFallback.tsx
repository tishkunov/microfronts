import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <div className="error-boundary">
      <div className="error-boundary-content">
        <h2>⚠️ Произошла ошибка</h2>
        <p className="error-message">
          {error?.message || 'Неизвестная ошибка'}
        </p>
        <button onClick={resetError} className="error-reset-button">
          Попробовать снова
        </button>
      </div>
    </div>
  );
};

