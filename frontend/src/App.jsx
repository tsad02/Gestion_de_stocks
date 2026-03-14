import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Layout from './components/Layout';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <Login setAuth={(auth) => {
          setIsAuthenticated(auth);
          const userData = localStorage.getItem('user');
          if (userData) setUser(JSON.parse(userData));
        }} />
      ) : (
        <Layout onLogout={handleLogout} user={user}>
          <Dashboard onLogout={handleLogout} />
        </Layout>
      )}
    </div>
  );
}

export default App;
