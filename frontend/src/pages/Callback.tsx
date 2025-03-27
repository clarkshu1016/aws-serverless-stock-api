import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { config } from '../config';

const Callback: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const exchangeCodeForToken = async () => {
      try {
        // Get authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('No authorization code found in the callback URL');
        }

        // Get the code verifier from localStorage
        const codeVerifier = localStorage.getItem('code_verifier');
        if (!codeVerifier) {
          throw new Error('No code verifier found in local storage');
        }

        // Exchange the authorization code for tokens
        const tokenEndpoint = `https://${config.cognito.domain}/oauth2/token`;
        const params = new URLSearchParams();
        params.append('grant_type', 'authorization_code');
        params.append('client_id', config.cognito.clientId);
        params.append('code', code);
        params.append('redirect_uri', config.cognito.redirectUri);
        params.append('code_verifier', codeVerifier);

        const response = await axios.post(tokenEndpoint, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        // Store tokens in localStorage
        const { id_token, access_token, refresh_token, expires_in } = response.data;
        
        localStorage.setItem('id_token', id_token);
        localStorage.setItem('access_token', access_token);
        
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }
        
        // Calculate expiration time
        const expiresAt = new Date().getTime() + expires_in * 1000;
        localStorage.setItem('expires_at', expiresAt.toString());

        // Clear the code verifier as it's no longer needed
        localStorage.removeItem('code_verifier');

        // Redirect to the dashboard
        navigate('/');
      } catch (err) {
        console.error('Error during token exchange:', err);
        setError('Authentication failed. Please try again.');
      }
    };

    exchangeCodeForToken();
  }, [navigate]);

  if (error) {
    return (
      <div className="callback-error">
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="callback-loading">
      <h2>Completing authentication...</h2>
      <div className="spinner"></div>
    </div>
  );
};

export default Callback;
