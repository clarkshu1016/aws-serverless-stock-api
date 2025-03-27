import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Callback from './pages/Callback';
import StockDetails from './pages/StockDetails';
import Favorites from './pages/Favorites';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/callback" element={<Callback />} />
            <Route
              path="/"
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/stock/:symbol"
              element={isAuthenticated ? <StockDetails /> : <Navigate to="/login" />}
            />
            <Route
              path="/favorites"
              element={isAuthenticated ? <Favorites /> : <Navigate to="/login" />}
            />
          </Routes>
        </main>
        <footer className="footer">
          <p>&copy; {new Date().getFullYear()} StockTrack - Real-time Stock Data</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
