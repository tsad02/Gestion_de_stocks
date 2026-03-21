import React from 'react';

/**
 * Composant MovementStats - Visualisation de l'activité des 7 derniers jours
 * Design épuré avec barres de progression et indicateurs de volume.
 */
const MovementStats = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center h-full flex flex-col justify-center">
        <div className="text-5xl mb-4">📈</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Pas de données</h3>
        <p className="text-gray-500">Données insuffisantes pour générer les graphiques.</p>
      </div>
    );
  }

  // Grouper par date
  const grouped = {};
  data.forEach(item => {
    const date = item.date ? item.date.split('T')[0] : new Date().toISOString().split('T')[0];
    if (!grouped[date]) {
      grouped[date] = { ENTREE: 0, SORTIE: 0, PERTE: 0 };
    }
    grouped[date][item.type] = (grouped[date][item.type] || 0) + (item.quantity || 0);
  });

  // Array trié (7 derniers jours)
  const sorted = Object.entries(grouped)
    .sort(([a], [b]) => new Date(b) - new Date(a))
    .slice(0, 7)
    .reverse();

  const maxValue = Math.max(1, ...sorted.flatMap(([, t]) => [t.ENTREE, t.SORTIE, t.PERTE]));

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric' }).format(date);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="p-2 bg-white rounded-lg shadow-sm">📈</span>
          Activité (7j)
        </h2>
        <div className="flex gap-4">
          <Legend item="Entrée" color="bg-emerald-500" />
          <Legend item="Sortie" color="bg-blue-500" />
          <Legend item="Perte" color="bg-rose-500" />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between gap-6">
        {sorted.map(([date, t]) => {
          const total = t.ENTREE + t.SORTIE + t.PERTE;
          return (
            <div key={date} className="flex items-center gap-4 group">
              <div className="w-16 text-right">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{formatDate(date)}</span>
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex gap-0.5 h-6 bg-gray-50 rounded-md overflow-hidden border border-gray-100 shadow-inner group-hover:scale-[1.01] transition-transform">
                  {t.ENTREE > 0 && <Bar val={t.ENTREE} max={maxValue} color="bg-emerald-500" />}
                  {t.SORTIE > 0 && <Bar val={t.SORTIE} max={maxValue} color="bg-blue-500" />}
                  {t.PERTE > 0 && <Bar val={t.PERTE} max={maxValue} color="bg-rose-500" />}
                </div>
              </div>
              <div className="w-12 text-left">
                <span className="text-xs font-bold text-gray-500">{total}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-5 bg-gray-50/30 border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
        <SummaryItem label="Entrées" val={sorted.reduce((s, [, t]) => s + t.ENTREE, 0)} color="text-emerald-600" />
        <SummaryItem label="Sorties" val={sorted.reduce((s, [, t]) => s + t.SORTIE, 0)} color="text-blue-600" />
        <SummaryItem label="Pertes" val={sorted.reduce((s, [, t]) => s + t.PERTE, 0)} color="text-rose-600" />
      </div>
    </div>
  );
};

const Legend = ({ item, color }) => (
  <div className="flex items-center gap-1.5">
    <div className={`w-2 h-2 rounded-full ${color}`} />
    <span className="text-[10px] font-bold text-gray-400 uppercase">{item}</span>
  </div>
);

const Bar = ({ val, max, color }) => (
  <div 
    className={`${color} h-full transition-all duration-700 ease-out flex items-center justify-center`}
    style={{ width: `${(val / max) * 100}%` }}
    title={val}
  >
    {val > (max * 0.1) && <span className="text-[9px] font-bold text-white opacity-80">{val}</span>}
  </div>
);

const SummaryItem = ({ label, val, color }) => (
  <div className="text-center px-2">
    <p className={`text-sm font-black ${color}`}>{val}</p>
    <p className="text-[9px] font-bold text-gray-400 uppercase">{label}</p>
  </div>
);

export default MovementStats;
