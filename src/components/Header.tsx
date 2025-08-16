import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="header-content">
        <h1>{title}</h1>
        <nav className="header-nav">
          <Link to="/view" className={location.pathname === '/view' ? 'active' : ''}>
            情報マップ
          </Link>
          <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
            データ登録
          </Link>
          <Link to="/add-record" className={location.pathname === '/add-record' ? 'active' : ''}>
            記録追加
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
