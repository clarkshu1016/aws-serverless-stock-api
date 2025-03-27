import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">StockTrack</Link>
        </div>
        
        {isAuthenticated && (
          <nav className="nav">
            <ul className="nav-list">
              <li className="nav-item">
                <Link 
                  to="/" 
                  className={location.pathname === '/' ? 'active' : ''}
                >
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  to="/favorites" 
                  className={location.pathname === '/favorites' ? 'active' : ''}
                >
                  Favorites
                </Link>
              </li>
            </ul>
          </nav>
        )}
        
        <div className="auth-buttons">
          {isAuthenticated ? (
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          ) : (
            <Link to="/login" className="btn btn-primary">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
