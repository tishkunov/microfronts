import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <h1>Microfrontends Host Application</h1>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;

