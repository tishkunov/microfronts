import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

interface NavBarProps {
  cartCount: number;
}

export const NavBar: React.FC<NavBarProps> = ({ cartCount }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <h1>🛍️ Маркетплейс</h1>
      </div>
      <ul className="nav-menu">
        <li>
          <Link to="/" className={isActive('/')}>
            📦 Каталог
          </Link>
        </li>
        <li>
          <Link to="/cart" className={isActive('/cart')}>
            🛒 Корзина
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </li>
        <li>
          <Link to="/admin" className={isActive('/admin')}>
            ⚙️ Админка
          </Link>
        </li>
      </ul>
    </nav>
  );
};

