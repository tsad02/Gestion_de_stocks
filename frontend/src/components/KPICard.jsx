import React from 'react';

/**
 * Composant KPI Card - Affiche une métrique clé avec icône et style moderne
 * Props: title, value, icon, color (blue, green, red, orange, purple)
 */
const KPICard = ({ title, value, icon = '📊', color = 'blue', trend = null, trendUp = true }) => {
  const colorMap = {
    blue: 'from-blue-500 to-indigo-600 shadow-blue-200 dark:shadow-blue-900/20 text-blue-600',
    green: 'from-emerald-500 to-teal-600 shadow-emerald-200 dark:shadow-emerald-900/20 text-emerald-600',
    red: 'from-rose-500 to-pink-600 shadow-rose-200 dark:shadow-rose-900/20 text-rose-600',
    orange: 'from-orange-500 to-amber-600 shadow-orange-200 dark:shadow-orange-900/20 text-orange-600',
    purple: 'from-purple-500 to-violet-600 shadow-purple-200 dark:shadow-purple-900/20 text-purple-600',
  };

  const bgLight = {
    blue: 'bg-blue-50 dark:bg-blue-950/30',
    green: 'bg-emerald-50 dark:bg-emerald-950/30',
    red: 'bg-rose-50 dark:bg-rose-950/30',
    orange: 'bg-orange-50 dark:bg-orange-950/30',
    purple: 'bg-purple-50 dark:bg-purple-950/30',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">
            {title}
          </p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tabular-nums tracking-tighter">
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${bgLight[color] || bgLight.blue} ${colorMap[color].split(' ').pop()} group-hover:scale-110 transition-transform shadow-inner`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-1.5 mt-2 relative z-10">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trendUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">vs dernier mois</span>
        </div>
      )}

      {/* Subtle background decoration */}
      <div className={`absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br ${colorMap[color].split(' ').slice(0,2).join(' ')} opacity-[0.03] rounded-full blur-3xl group-hover:opacity-10 transition-opacity`} />
    </div>
  );
};

export default KPICard;
