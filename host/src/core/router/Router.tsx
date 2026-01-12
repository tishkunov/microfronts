import React from 'react';
import { BrowserRouter } from 'react-router-dom';

interface RouterProps {
  children: React.ReactNode;
}

export const Router: React.FC<RouterProps> = ({ children }) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

