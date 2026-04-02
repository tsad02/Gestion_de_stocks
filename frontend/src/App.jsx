import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/Login';

// Pages principales
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import MovementsPage from './pages/MovementsPage';
import UsersPage from './pages/UsersPage';
import ConfigPage from './pages/ConfigPage';
import ProfilePage from './pages/ProfilePage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import LocationsPage from './pages/LocationsPage';
import AuditPage from './pages/AuditPage';

// Nouvelles pages (Module Restaurant-grade)
import ReportsPage from './pages/ReportsPage';
import SuggestionsPage from './pages/SuggestionsPage';

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
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative">
          <div className="text-6xl animate-bounce mb-4">📦</div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 bg-black/10 dark:bg-white/10 rounded-full blur-sm" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 animate-pulse">Chargement...</p>
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
                  {/* Routes Accessibles à tous les utilisateurs authentifiés */}
                  <Route path="/" element={<DashboardPage onLogout={handleLogout} />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/movements" element={<MovementsPage />} />
                  <Route path="/purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/suggestions" element={<SuggestionsPage />} />
                  <Route path="/config" element={<ConfigPage />} />
                  <Route path="/profile" element={<ProfilePage user={user} onUpdate={handleUpdateUser} />} />
                  
                  {/* Routes Restreintes (Responsable uniquement) */}
                  <Route path="/locations" element={user?.role === 'RESPONSABLE' ? <LocationsPage /> : <Navigate to="/" replace />} />
                  <Route path="/users" element={user?.role === 'RESPONSABLE' ? <UsersPage /> : <Navigate to="/" replace />} />
                  <Route path="/audit" element={user?.role === 'RESPONSABLE' ? <AuditPage /> : <Navigate to="/" replace />} />

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
