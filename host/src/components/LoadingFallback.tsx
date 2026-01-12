import React from 'react';
import './LoadingFallback.css';

export const LoadingFallback: React.FC = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Загрузка...</p>
  </div>
);

