import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <Link 
        to="/" 
        className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
      >
        Главная
      </Link>
      <Link 
        to="/chart" 
        className={location.pathname === '/chart' ? 'nav-link active' : 'nav-link'}
      >
        График (React App 1)
      </Link>
      <Link 
        to="/counter" 
        className={location.pathname === '/counter' ? 'nav-link active' : 'nav-link'}
      >
        Счетчик (React App 2)
      </Link>
      <Link 
        to="/form" 
        className={location.pathname === '/form' ? 'nav-link active' : 'nav-link'}
      >
        Форма (Vue App)
      </Link>
    </nav>
  );
};

export default Navigation;

