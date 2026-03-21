import React, { useState, useEffect } from 'react';
import dashboardAPI from '../services/dashboardAPI';
import KPICard from './KPICard';
import CriticalProducts from './CriticalProducts';
import MovementStats from './MovementStats';
import RecentMovements from './RecentMovements';

/**
 * Dashboard principal - Gestion de stocks
 * Affiche KPI, produits critiques, statistiques mouvements et derniers mouvements
 * UI moderne, responsive, et visuellement aboutie
 */
const Dashboard = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const dashboardData = await dashboardAPI.getSummary();
      setData(dashboardData);
    } catch (err) {
      console.error('Erreur Dashboard:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        if (onLogout) onLogout();
        return;
      }
      const errorMsg = err.response?.data?.error || err.message || 'Erreur de chargement du dashboard';
      setError(errorMsg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchDashboardData();
  };

  // État de chargement
  if (loading && !data) {
    return <LoadingState />;
  }

  // État d'erreur
  if (error && !data) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  const summary = data?.summary || {};
  const critical = data?.critical_products || [];
  const recent = data?.recent_movements || [];
  const movements7days = data?.movements_7days || {};

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <HeaderDashboard onRefresh={handleRefresh} refreshing={refreshing} />

      {/* KPI Cards Row - 5 colonnes sur desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Produits Total"
          value={summary.total_produits || 0}
          icon="📦"
          color="blue"
        />
        <KPICard
          title="En Alerte"
          value={summary.produits_en_alerte || 0}
          icon="⚠️"
          color={summary.produits_en_alerte > 0 ? 'red' : 'green'}
        />
        <KPICard
          title="Entrées (7j)"
          value={movements7days.entries?.quantity || 0}
          icon="📥"
          color="green"
        />
        <KPICard
          title="Sorties (7j)"
          value={movements7days.exits?.quantity || 0}
          icon="📤"
          color="orange"
        />
        <KPICard
          title="Pertes (7j)"
          value={movements7days.losses?.quantity || 0}
          icon="🗑️"
          color="red"
        />
      </div>

      {/* Charts & Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MovementStats data={data?.movements_by_day || []} />
        </div>
        <div>
          <StatisticsCard movements7days={movements7days} />
        </div>
      </div>

      {/* Critical Products Section */}
      {critical && critical.length > 0 && (
        <div>
          <CriticalProducts products={critical} />
        </div>
      )}

      {/* Recent Movements Section */}
      {recent && recent.length > 0 && (
        <div>
          <RecentMovements movements={recent} />
        </div>
      )}

      {/* Empty State - No Data */}
      {(!critical || critical.length === 0) && (!recent || recent.length === 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <div className="text-7xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune donnée disponible</h3>
          <p className="text-gray-600 mb-6">Commencez par ajouter des produits et des mouvements de stock</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Actualiser les données
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================
// Composants utilitaires
// ============================================

const HeaderDashboard = ({ onRefresh, refreshing }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">📊 Dashboard</h1>
          <p className="text-sm text-gray-600 mt-2">Gestion de stocks - TTDJAPP</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>🔄</span>
          <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
        </button>
      </div>
    </div>
  );
};

const StatisticsCard = ({ movements7days }) => {
  const entries = movements7days.entries || {};
  const exits = movements7days.exits || {};
  const losses = movements7days.losses || {};

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-2xl mr-2">📈</span>
        Résumé - 7 Jours
      </h3>
      <div className="space-y-4">
        <StatRow
          label="Entrées"
          count={entries.count || 0}
          quantity={entries.quantity || 0}
          icon="📥"
          bgColor="bg-green-50"
          textColor="text-green-700"
          borderColor="border-green-200"
        />
        <StatRow
          label="Sorties"
          count={exits.count || 0}
          quantity={exits.quantity || 0}
          icon="📤"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-200"
        />
        <StatRow
          label="Pertes"
          count={losses.count || 0}
          quantity={losses.quantity || 0}
          icon="🗑️"
          bgColor="bg-red-50"
          textColor="text-red-700"
          borderColor="border-red-200"
        />
      </div>
    </div>
  );
};

const StatRow = ({ label, count, quantity, icon, bgColor, textColor, borderColor }) => {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 flex items-center">
          <span className="text-lg mr-2">{icon}</span>
          {label}
        </span>
      </div>
      <div className="flex justify-between items-baseline gap-4">
        <div>
          <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
          <p className="text-xs text-gray-600 mt-1">mouvements</p>
        </div>
        <div className="text-right">
          <p className={`text-xl font-bold ${textColor}`}>{quantity}</p>
          <p className="text-xs text-gray-600 mt-1">articles</p>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header skeleton */}
      <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />

      {/* KPI Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Bottom sections skeleton */}
      <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />
      <div className="h-80 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
};

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="text-7xl">⚠️</div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-xs text-gray-500 mb-6">Veuillez vérifier votre connexion et réessayer.</p>
        </div>
        <button
          onClick={onRetry}
          className="mt-4 px-8 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          🔄 Réessayer
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

