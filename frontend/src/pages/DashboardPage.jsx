import React, { useState, useEffect } from 'react';
import { Skeleton, KPISkeleton } from '../components/ui/Skeleton';
import dashboardAPI from '../services/dashboardAPI';
import KPICard from '../components/KPICard';
import CriticalProducts from '../components/CriticalProducts';
import RecentMovements from '../components/RecentMovements';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
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
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);

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
      setTimeout(() => setLoading(false), 500); // Small delay for visual comfort
    }
  };

  if (loading && !data) return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPISkeleton />
        <KPISkeleton />
        <KPISkeleton />
        <KPISkeleton />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-96 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 rounded-2xl p-12 text-center max-w-2xl mx-auto shadow-sm animate-in zoom-in duration-300">
      <div className="text-6xl mb-6">🏜️</div>
      <h2 className="text-2xl font-black text-rose-900 dark:text-rose-400 mb-2 uppercase tracking-tight">Oups ! Quelque chose a mal tourné</h2>
      <p className="text-rose-600 dark:text-rose-500 mb-8 font-medium">{error}</p>
      <button 
        onClick={fetchData} 
        className="group relative px-8 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 transition-all font-black shadow-lg shadow-rose-600/20 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          <span>🔄 Réessayer</span>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
      </button>
    </div>
  );

  const { summary = {}, critical_products = [], recent_movements = [], movements_7days = {} } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {isPOModalOpen && (
        <PurchaseOrderModal
          initialData={{ criticalProducts: critical_products }}
          onClose={() => setIsPOModalOpen(false)}
          onSuccess={() => {
            setIsPOModalOpen(false);
            fetchData();
          }}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Bonjour, prêt pour le <span className="text-blue-600 dark:text-blue-400">service ?</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-2 flex items-center gap-2 opacity-80">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Voici l'état actuel de votre stock TTDJAPP.
          </p>
        </div>
        <button 
          onClick={fetchData} 
          disabled={loading}
          className={`group p-3 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`}
          title="Actualiser les données"
        >
          <span className="text-xl group-hover:rotate-180 transition-transform duration-500 block">🔄</span>
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Produits" value={summary.total_produits} icon="📦" color="blue" />
        <KPICard title="En Alerte" value={summary.produits_en_alerte} icon="⚠️" color={summary.produits_en_alerte > 0 ? 'red' : 'green'} trend={summary.produits_en_alerte > 0 ? summary.produits_en_alerte : '0'} trendUp={summary.produits_en_alerte > 0} />
        <KPICard title="Entrées (7j)" value={movements_7days.entries?.quantity} icon="📥" color="green" />
        <KPICard title="Sorties (7j)" value={movements_7days.exits?.quantity} icon="📤" color="orange" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Chart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 hover:shadow-xl transition-all duration-300 group">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Flux d'activité</h2>
                <p className="text-sm text-gray-400 font-bold">7 derniers jours</p>
              </div>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Entrées
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Sorties
                </span>
              </div>
            </div>
            <div className="h-72">
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
                      backgroundColor: 'rgba(16, 185, 129, 0.9)', 
                      borderRadius: 12,
                      hoverBackgroundColor: '#059669'
                    },
                    {
                      label: 'Sorties',
                      data: [...new Set(data?.movements_by_day?.map(m => m.date))].reverse().map(date => {
                        const rec = data.movements_by_day.find(m => m.date === date && m.type === 'SORTIE');
                        return rec ? rec.quantity : 0;
                      }),
                      backgroundColor: 'rgba(59, 130, 246, 0.9)', 
                      borderRadius: 12,
                      hoverBackgroundColor: '#2563eb'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' } } },
                    y: { grid: { color: 'rgba(156, 163, 175, 0.05)' }, border: { display: false }, ticks: { font: { weight: 'bold' } } }
                  },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: '#1e293b',
                      titleFont: { size: 12, weight: 'bold' },
                      bodyFont: { size: 12 },
                      padding: 12,
                      cornerRadius: 12,
                      displayColors: false
                    }
                  }
                }}
              />
            </div>
          </div>
          
          <RecentMovements movements={recent_movements} />
        </div>
        <div className="space-y-8">
          <CriticalProducts products={critical_products} handleGenerateOrder={() => setIsPOModalOpen(true)} />
          
          {/* Business Logic Widget */}
          <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-blue-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl group-hover:scale-110 transition-transform duration-700">☕</div>
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-3 uppercase tracking-tighter">Optimisation IA</h3>
              <p className="text-blue-100/60 text-sm font-bold mb-8 leading-relaxed">
                Le système a détecté <span className="text-yellow-400">{summary.produits_en_alerte}</span> produits sous le seuil de sécurité.
              </p>
              <button 
                onClick={() => setIsPOModalOpen(true)}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black rounded-2xl transition-all shadow-xl shadow-yellow-400/20 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>📦</span> Générer bon de commande
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
