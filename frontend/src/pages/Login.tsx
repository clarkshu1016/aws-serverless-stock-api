import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to StockTrack</h1>
        <p className="login-description">
          Get real-time stock price information and track your favorite stocks
        </p>
        
        <div className="login-image" style={{
          height: '200px',
          backgroundColor: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          marginBottom: '24px',
          color: '#666',
          fontSize: '18px',
          fontWeight: 500
        }}>
          Stock Market Chart
        </div>
        
        <button onClick={login} className="btn btn-primary login-button">
          Sign in with Cognito
        </button>
        
        <p className="login-info">
          Secure authentication with OAuth 2.0 PKCE flow
        </p>
      </div>
    </div>
  );
};

export default Login;
