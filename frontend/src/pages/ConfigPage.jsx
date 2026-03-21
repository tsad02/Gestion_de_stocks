import React, { useState, useEffect } from 'react';
import inventoryAPI from '../services/inventoryAPI';

const ConfigPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const products = await inventoryAPI.getProducts();
      const movData = await inventoryAPI.getMovements({ limit: 1000 });
      const prods = Array.isArray(products) ? products : [];
      const movs = Array.isArray(movData.movements) ? movData.movements : [];
      const alerts = prods.filter(p => (parseInt(p.stock_actuel) || 0) <= (parseInt(p.min_threshold) || 0));
      const categories = [...new Set(prods.map(p => p.category).filter(Boolean))];

      setStats({
        totalProducts: prods.length,
        totalAlerts: alerts.length,
        totalMovements: movData.total || movs.length,
        categories: categories.length,
        categoriesList: categories
      });
    } catch (err) {
      console.error('Erreur stats:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Configuration</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Informations système et paramètres de l'application.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">⚙️</span>
              Informations Système
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow label="Application" value="TTDJAPP — Gestion de Stocks" />
            <InfoRow label="Version" value="1.0.0" />
            <InfoRow label="Backend" value="Node.js + Express (Port 3000)" />
            <InfoRow label="Frontend" value="React 18 + Vite + Tailwind CSS" />
            <InfoRow label="Base de données" value="PostgreSQL" />
            <InfoRow label="Authentification" value="JWT (JSON Web Token)" />
          </div>
        </div>

        {/* User Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">👤</span>
              Mon Compte
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <InfoRow label="Nom" value={user.full_name || 'N/A'} />
            <InfoRow label="Email" value={user.email || 'N/A'} />
            <InfoRow label="Rôle" value={user.role === 'RESPONSABLE' ? '👑 Responsable' : '👥 Employé'} />
            <InfoRow label="Permissions" value={user.role === 'RESPONSABLE' ? 'Accès complet' : 'Consultation + mouvements'} />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <span className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">📊</span>
              Statistiques Base de Données
            </h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">Chargement des statistiques...</div>
          ) : stats ? (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Produits" value={stats.totalProducts} icon="📦" />
                <StatCard label="Alertes" value={stats.totalAlerts} icon="⚠️" />
                <StatCard label="Mouvements" value={stats.totalMovements} icon="🔄" />
                <StatCard label="Catégories" value={stats.categories} icon="🏷️" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Catégories existantes</p>
                <div className="flex flex-wrap gap-2">
                  {stats.categoriesList.map(c => (
                    <span key={c} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 dark:text-gray-500">Impossible de charger les statistiques.</div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
    <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
  </div>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-center">
    <div className="text-2xl mb-1">{icon}</div>
    <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
  </div>
);

export default ConfigPage;
