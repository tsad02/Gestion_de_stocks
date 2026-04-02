import React, { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

const PERIOD_OPTIONS = [
  { value: 'daily',   label: "Aujourd'hui",    icon: '📅' },
  { value: 'weekly',  label: 'Cette semaine',  icon: '📆' },
  { value: 'monthly', label: 'Ce mois',        icon: '📊' },
  { value: 'annual',  label: 'Cette année',    icon: '📈' }
];

const MOTIF_LABELS = {
  'expiré':              '⏱️ Expiré',
  'cassé':               '💥 Cassé',
  'erreur manipulation': '⚠️ Erreur manipulation',
  'erreur commande client': '🚫 Erreur commande client',
  'invendu':             '📦 Invendu',
  'autre':               '📝 Autre'
};

/**
 * Composant de carte statistique réutilisable.
 */
function StatCard({ icon, label, value, sub, color = 'gray' }) {
  const colors = {
    green:  'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    blue:   'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
    red:    'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/50',
    amber:  'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    gray:   'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-100 dark:border-gray-800'
  };
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-1 ${colors[color]}`}>
      <span className="text-2xl">{icon}</span>
      <p className="text-2xl font-black mt-1">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
      {sub && <p className="text-xs opacity-60 font-medium">{sub}</p>}
    </div>
  );
}

/**
 * Page de rapports périodiques.
 * Affiche des graphiques et des statistiques sur la performance de l'inventaire.
 */
const ReportsPage = () => {
  const toast = useToast();
  const [period, setPeriod] = useState('monthly'); // Période par défaut : ce mois
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  /**
   * Récupère les données du rapport pour une période donnée.
   */
  const fetchReport = async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/reports?period=${p}`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setReport(data);
    } catch (err) {
      toast.error('Impossible de charger le rapport');
    } finally {
      setLoading(false);
    }
  };

  const d = report?.data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Rapports</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 opacity-80">
            Analyse périodique de vos mouvements et pertes de stock.
          </p>
        </div>
        {/* Period Selector */}
        <div className="flex bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 gap-1 shadow-sm">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                period === opt.value
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-4xl animate-pulse">📊</div>
      ) : !d ? null : (
        <>
          {/* KPIs Globaux */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <StatCard icon="📥" label="Entrées" value={d.totaux.entrees}     color="green" />
            <StatCard icon="📤" label="Sorties" value={d.totaux.sorties}     color="blue"  />
            <StatCard icon="🗑️" label="Pertes"  value={d.totaux.pertes}      color="red"   sub={`${d.totaux.taux_perte_pct}% du flux`} />
            <StatCard icon="🏢" label="Transferts"   value={d.totaux.transferts}   color="amber" />
            <StatCard icon="⚖️" label="Ajustements"  value={d.totaux.ajustements}  color="gray"  />
            <StatCard icon="🔄" label="Total mouvements" value={d.totaux.total_mouvements} color="gray" />
            <div className={`rounded-2xl border p-5 flex flex-col gap-1 col-span-1 ${
              d.totaux.taux_perte_pct > 20
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 text-rose-700 dark:text-rose-400'
                : d.totaux.taux_perte_pct > 10
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-100 text-amber-700 dark:text-amber-400'
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 text-emerald-700 dark:text-emerald-400'
            }`}>
              <span className="text-2xl">📉</span>
              <p className="text-2xl font-black mt-1">{d.totaux.taux_perte_pct}%</p>
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">Taux de perte</p>
              <p className="text-xs opacity-60 font-medium">
                {d.totaux.taux_perte_pct > 20 ? '⚠️ Élevé' : d.totaux.taux_perte_pct > 10 ? '⚡ Modéré' : '✅ Acceptable'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Produits Sortis */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                📤 Produits les plus sortis
              </h2>
              {d.top_produits_sortis.length === 0 ? (
                <p className="text-gray-400 text-sm italic">Aucune donnée sur la période.</p>
              ) : (
                <div className="space-y-3">
                  {d.top_produits_sortis.map((p, i) => {
                    const max = d.top_produits_sortis[0]?.total_sorties || 1;
                    const pct = Math.round((p.total_sorties / max) * 100);
                    return (
                      <div key={p.product_id} className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-400 w-5">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{p.product_name}</span>
                            <span className="text-sm font-black text-blue-600">{p.total_sorties} {p.unit}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Produits Perdus */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🗑️ Produits les plus perdus
              </h2>
              {d.top_produits_perdus.length === 0 ? (
                <p className="text-gray-400 text-sm italic">Aucune perte sur la période. 🎉</p>
              ) : (
                <div className="space-y-3">
                  {d.top_produits_perdus.map((p, i) => {
                    const max = d.top_produits_perdus[0]?.total_pertes || 1;
                    const pct = Math.round((p.total_pertes / max) * 100);
                    return (
                      <div key={p.product_id} className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-400 w-5">#{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{p.product_name}</span>
                            <span className="text-sm font-black text-rose-600">{p.total_pertes} {p.unit}</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          {p.motifs && <p className="text-[10px] text-gray-400 mt-0.5 italic">Motifs : {p.motifs}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Causes de Pertes */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                🔍 Causes de pertes
              </h2>
              {d.causes_pertes.length === 0 ? (
                <p className="text-gray-400 text-sm italic">Aucune cause enregistrée.</p>
              ) : (
                <div className="space-y-2">
                  {d.causes_pertes.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/50">
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-400">
                        {MOTIF_LABELS[c.motif] || c.motif}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-rose-600 dark:text-rose-500">
                        <span className="font-black">{c.occurrences}×</span>
                        <span className="font-medium opacity-70">{c.quantite} unités</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Taux de perte par produit */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                📉 Taux de perte par produit
              </h2>
              {d.taux_perte_par_produit.length === 0 ? (
                <p className="text-gray-400 text-sm italic">Aucune donnée.</p>
              ) : (
                <div className="space-y-2">
                  {d.taux_perte_par_produit.map((p, i) => {
                    const taux = p.taux_perte_pct;
                    const color = taux > 30 ? 'rose' : taux > 15 ? 'amber' : 'emerald';
                    const colorMap = { rose: 'bg-rose-500', amber: 'bg-amber-500', emerald: 'bg-emerald-500' };
                    const textMap = { rose: 'text-rose-600', amber: 'text-amber-600', emerald: 'text-emerald-600' };
                    return (
                      <div key={p.product_id} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{p.nom}</span>
                            <span className={`text-sm font-black ${textMap[color]}`}>{taux}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className={`h-full ${colorMap[color]} rounded-full transition-all`} style={{ width: `${Math.min(taux, 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Section Évaluation */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 p-6">
            <h2 className="text-lg font-black text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
              🎯 Évaluation du système
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl">
                <p className="text-3xl font-black text-indigo-700 dark:text-indigo-400">{d.ajustements_frequents.length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-500 mt-1">Produits ajustés</p>
                <p className="text-[10px] text-gray-400 mt-1">Plus c'est élevé, moins le suivi est précis</p>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl">
                <p className={`text-3xl font-black ${d.totaux.taux_perte_pct > 20 ? 'text-rose-600' : d.totaux.taux_perte_pct > 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {d.totaux.taux_perte_pct}%
                </p>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-500 mt-1">Taux de perte global</p>
                <p className="text-[10px] text-gray-400 mt-1">Objectif : {'<'} 10%</p>
              </div>
              <div className="text-center p-4 bg-white/60 dark:bg-gray-900/40 rounded-xl">
                <p className="text-3xl font-black text-indigo-700 dark:text-indigo-400">{d.causes_pertes.length}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-500 mt-1">Causes identifiées</p>
                <p className="text-[10px] text-gray-400 mt-1">Causes tracées sur la période</p>
              </div>
            </div>
          </div>

          {/* Ajustements fréquents */}
          {d.ajustements_frequents.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                ⚖️ Produits les plus ajustés <span className="text-xs font-medium text-amber-500 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-lg">Zone à surveiller</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs font-black uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      <th className="pb-3 text-left">Produit</th>
                      <th className="pb-3 text-left">Catégorie</th>
                      <th className="pb-3 text-right">Ajustements</th>
                      <th className="pb-3 text-right">Quantité totale</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {d.ajustements_frequents.map(a => (
                      <tr key={a.product_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-3 font-bold text-gray-900 dark:text-white">{a.product_name}</td>
                        <td className="py-3 text-gray-500 dark:text-gray-400 text-xs uppercase font-black">{a.category}</td>
                        <td className="py-3 text-right font-black text-amber-600">{a.nb_ajustements}</td>
                        <td className="py-3 text-right font-bold text-gray-700 dark:text-gray-300">{a.quantite_totale}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
