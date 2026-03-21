import React from 'react';

/**
 * Composant KPI Card - Affiche une métrique clé avec icône et style moderne
 * Props: title, value, icon, color (blue, green, red, orange, purple)
 */
const KPICard = ({ title, value, icon = '📊', color = 'blue', trend = null, trendUp = true }) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', icon: 'bg-blue-100' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', icon: 'bg-green-100' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', icon: 'bg-red-100' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', icon: 'bg-orange-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', icon: 'bg-purple-100' }
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-tight">{title}</h3>
        <div className={`${colors.icon} rounded-xl p-2.5 text-xl shadow-inner`}>
          {icon}
        </div>
      </div>

      <div className="flex items-end justify-between relative z-10">
        <div className="flex-1">
          <p className={`text-4xl font-black tracking-tighter ${colors.text} leading-none`}>
            {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-3 px-2 py-1 bg-white/50 rounded-lg w-fit border border-white/80 shadow-sm">
              <span className={`text-xs ${trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trendUp ? '↑' : '↓'}
              </span>
              <p className={`text-[10px] font-black ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                {trend}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
