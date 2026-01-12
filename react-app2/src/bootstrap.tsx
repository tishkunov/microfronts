import React from 'react';
import ReactDOM from 'react-dom/client';
import CartComponent from './components/CartComponent';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <CartComponent />
  </React.StrictMode>
);
