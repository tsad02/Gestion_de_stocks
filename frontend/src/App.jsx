import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';

// Pages
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import MovementsPage from './pages/MovementsPage';
import UsersPage from './pages/UsersPage';
import ConfigPage from './pages/ConfigPage';
import ProfilePage from './pages/ProfilePage';

import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token) {
      setIsAuthenticated(true);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error("Could not parse user data");
        }
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogin = (auth) => {
    setIsAuthenticated(auth);
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <div className="text-4xl animate-bounce">☕</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <div className="App dark:bg-slate-900 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200">
            {!isAuthenticated ? (
              <Routes>
                <Route path="/login" element={<Login setAuth={handleLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            ) : (
              <Layout onLogout={handleLogout} user={user}>
                <Routes>
                  <Route path="/" element={<DashboardPage onLogout={handleLogout} />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/movements" element={<MovementsPage />} />
                  <Route path="/users" element={user?.role === 'RESPONSABLE' ? <UsersPage /> : <Navigate to="/" replace />} />
                  <Route path="/config" element={<ConfigPage />} />
                  <Route path="/profile" element={<ProfilePage user={user} onUpdate={handleUpdateUser} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            )}
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
