import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { generateCodeVerifier, generateCodeChallenge } from '../utils/pkce';
import { config } from '../config';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is logged in (has a valid token)
    const checkAuth = async () => {
      const idToken = localStorage.getItem('id_token');
      const expiresAt = localStorage.getItem('expires_at');

      if (idToken && expiresAt) {
        // Check if token is still valid
        if (new Date().getTime() < parseInt(expiresAt, 10)) {
          setToken(idToken);
          setIsAuthenticated(true);
        } else {
          // Token expired, clear storage
          localStorage.removeItem('id_token');
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('expires_at');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async () => {
    // Generate PKCE code verifier and challenge
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Store code verifier in localStorage for later use
    localStorage.setItem('code_verifier', codeVerifier);

    // Build authorization URL
    const authUrl = new URL(`https://${config.cognito.domain}/login`);
    authUrl.searchParams.append('client_id', config.cognito.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', config.cognito.redirectUri);
    authUrl.searchParams.append('scope', 'openid email profile');
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);

    // Redirect to authorization URL
    window.location.href = authUrl.toString();
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_at');
    localStorage.removeItem('code_verifier');

    setToken(null);
    setIsAuthenticated(false);

    // Redirect to logout URL
    const logoutUrl = new URL(`https://${config.cognito.domain}/logout`);
    logoutUrl.searchParams.append('client_id', config.cognito.clientId);
    logoutUrl.searchParams.append('logout_uri', config.cognito.logoutUri);

    window.location.href = logoutUrl.toString();
  };

  const getToken = () => {
    return token;
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};
