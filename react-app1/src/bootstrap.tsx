import React from 'react';
import ReactDOM from 'react-dom/client';
import CatalogComponent from './components/CatalogComponent';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <CatalogComponent />
  </React.StrictMode>
);
