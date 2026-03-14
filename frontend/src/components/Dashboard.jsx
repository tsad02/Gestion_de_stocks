import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dashboardAPI from '../services/dashboardAPI';
import KPICard from './KPICard';
import RecentMovements from './RecentMovements';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await dashboardAPI.getSummary();
      setData(dashboardData);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        if (onLogout) onLogout();
        return;
      }
      setError(err.response?.data?.error || 'Erreur de chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin text-4xl text-blue-500">⏳</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">⚠️ Erreur</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <button onClick={fetchDashboardData} className="bg-blue-600 text-white px-4 py-2 rounded shadow">
          Réessayer
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const recent = data?.recent_movements || [];
  
  // Transform movements_7days for Bar Chart
  const mov = data?.movements_7days || [];
  const daysMap = {};
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    daysMap[d.toISOString().split('T')[0]] = { entree: 0, sortie: 0 };
  }
  mov.forEach(m => {
    const dateStr = m.date.substring(0, 10);
    if (daysMap[dateStr]) {
      if (m.type === 'ENTREE') daysMap[dateStr].entree += parseInt(m.total_quantity);
      if (m.type === 'SORTIE') daysMap[dateStr].sortie += parseInt(m.total_quantity);
    }
  });

  const labels = Object.keys(daysMap).map(d => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  });

  const barChartData = {
    labels,
    datasets: [
      {
        label: 'Entrées',
        data: Object.values(daysMap).map(d => d.entree),
        backgroundColor: '#3b82f6', // blue-500
        borderRadius: 4,
      },
      {
        label: 'Sorties',
        data: Object.values(daysMap).map(d => d.sortie),
        backgroundColor: '#bfdbfe', // blue-200
        borderRadius: 4,
      }
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { border: { display: false }, grid: { color: '#f3f4f6' } }
    }
  };

  // Top Consumption for Horizontal Bar
  const topCons = data?.top_consumption || [];
  const hBarData = {
    labels: topCons.length ? topCons.map(t => t.name.substring(0, 15)) : ['Item A', 'Item B', 'Item C'],
    datasets: [
      {
        label: 'Consommation',
        data: topCons.length ? topCons.map(t => parseInt(t.total_qty)) : [30, 20, 10],
        backgroundColor: '#3b82f6',
        borderRadius: 4,
        barThickness: 16,
      }
    ]
  };

  const hBarOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { grid: { display: false }, border: { display: false } }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex justify-between items-center bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center text-sm text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
            <span className="mr-2">📥</span> Export CSV
          </button>
          <button className="flex items-center text-sm text-white bg-gray-900 px-4 py-1.5 rounded-lg hover:bg-black shadow">
            <span className="mr-2">➕</span> Créer Commande
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Stock Total (Valeur approx.)"
          value={`$${(summary.stock_total * 3.5).toLocaleString()}`}
          icon="💲"
          trendLabel="12%"
          trendUp={true}
        />
        <KPICard
          title="Mouvements (7 jours)"
          value={mov.reduce((acc, m) => acc + parseInt(m.total_quantity), 0)}
          icon="📦"
          trendLabel="24%"
          trendUp={false}
        />
        <KPICard
          title="Total Commandes"
          value={summary.stock_total || 0}
          icon="🛒"
          trendLabel="12%"
          trendUp={true}
        />
        <KPICard
          title="Délai Moyen Livraison"
          value="4.5 Jours"
          icon="⏱️"
          trendLabel="16%"
          trendUp={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Mouvements de Vente</h3>
            <select className="text-sm border-gray-200 rounded-lg text-gray-500 bg-gray-50 px-2 py-1">
              <option>Hebdomadaire</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px]">
            <Bar data={barChartData} options={barOptions} />
          </div>
        </div>

        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 text-lg">Produits les plus vendus</h3>
            <span className="text-gray-400 cursor-pointer">⋮</span>
          </div>
          <div className="flex-1 min-h-[250px]">
             <Bar data={hBarData} options={hBarOptions} />
          </div>
        </div>
      </div>

      {/* Table Row */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-900 text-lg">Liste des Expéditions (Récents)</h3>
          <div className="flex items-center space-x-3 text-sm">
            <div className="flex items-center text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <span className="mr-2">🔍</span> Search
            </div>
            <button className="text-gray-500 hover:text-gray-700 font-medium">
              Filtrer ▽
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <RecentMovements movements={recent} isEmbedded={true} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
