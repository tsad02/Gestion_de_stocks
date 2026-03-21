import React, { useState, useEffect } from 'react';
import dashboardAPI from '../services/dashboardAPI';
import KPICard from '../components/KPICard';
import CriticalProducts from '../components/CriticalProducts';
import MovementStats from '../components/MovementStats';
import RecentMovements from '../components/RecentMovements';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * DashboardPage - Page d'accueil avec les indicateurs et alertes
 */
const DashboardPage = ({ onLogout }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await dashboardAPI.getSummary();
      setData(res);
      setError(null);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        onLogout && onLogout();
      }
      setError('Impossible de charger les données du dashboard.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-500 animate-pulse text-xl">🚀 Chargement du Dashboard...</div>;
  if (error) return (
    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm">
      <div className="text-5xl mb-4 text-rose-600">⚠️</div>
      <h2 className="text-xl font-bold text-rose-900 mb-2">Erreur</h2>
      <p className="text-rose-600 mb-6 font-medium">{error}</p>
      <button onClick={fetchData} className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all font-bold shadow-md shadow-rose-200">
        Réessayer
      </button>
    </div>
  );

  const { summary = {}, critical_products = [], recent_movements = [], movements_7days = {} } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Bonjour, prêt pour le service ?</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Voici l'état actuel de votre stock TTDJAPP.</p>
        </div>
        <button onClick={fetchData} className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-600 dark:text-gray-300">
          🔄 Actualiser
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Produits" value={summary.total_produits} icon="📦" color="blue" />
        <KPICard title="En Alerte" value={summary.produits_en_alerte} icon="⚠️" color={summary.produits_en_alerte > 0 ? 'red' : 'green'} />
        <KPICard title="Entrées (7j)" value={movements_7days.entries?.quantity} icon="📥" color="green" />
        <KPICard title="Sorties (7j)" value={movements_7days.exits?.quantity} icon="📤" color="orange" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Chart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Activité des 7 derniers jours</h2>
            <div className="h-64">
              <Bar 
                data={{
                  labels: [...new Set(data?.movements_by_day?.map(m => new Date(m.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })))].reverse(),
                  datasets: [
                    {
                      label: 'Entrées',
                      data: [...new Set(data?.movements_by_day?.map(m => m.date))].reverse().map(date => {
                        const rec = data.movements_by_day.find(m => m.date === date && m.type === 'ENTREE');
                        return rec ? rec.quantity : 0;
                      }),
                      backgroundColor: 'rgba(34, 197, 94, 0.8)', // green
                      borderRadius: 4
                    },
                    {
                      label: 'Sorties',
                      data: [...new Set(data?.movements_by_day?.map(m => m.date))].reverse().map(date => {
                        const rec = data.movements_by_day.find(m => m.date === date && m.type === 'SORTIE');
                        return rec ? rec.quantity : 0;
                      }),
                      backgroundColor: 'rgba(59, 130, 246, 0.8)', // blue
                      borderRadius: 4
                    },
                    {
                      label: 'Pertes',
                      data: [...new Set(data?.movements_by_day?.map(m => m.date))].reverse().map(date => {
                        const rec = data.movements_by_day.find(m => m.date === date && m.type === 'PERTE');
                        return rec ? rec.quantity : 0;
                      }),
                      backgroundColor: 'rgba(239, 68, 68, 0.8)', // red
                      borderRadius: 4
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { grid: { display: false } },
                    y: { border: { dash: [4, 4] }, grid: { color: 'rgba(156, 163, 175, 0.1)' } }
                  },
                  plugins: {
                    legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 6 } }
                  }
                }}
              />
            </div>
          </div>
          
          <RecentMovements movements={recent_movements} />
          {/* <MovementStats data={data?.movements_by_day || []} /> */}
        </div>
        <div className="space-y-8">
          <CriticalProducts products={critical_products} />
          {/* Business Logic Widget */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">☕</div>
            <h3 className="text-lg font-bold mb-2 relative z-10">Optimisation</h3>
            <p className="text-gray-400 text-sm mb-4 relative z-10">Vous avez {summary.produits_en_alerte} produits en dessous du seuil de sécurité.</p>
            <button className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-black rounded-xl transition-all relative z-10 shadow-lg shadow-yellow-500/20">
              Générer bon de commande
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
