import React from 'react';

/**
 * Composant KPI Card - Style Delisas
 */
const KPICard = ({ title, value, icon, trendLabel, trendUp = true }) => {
  return (
    <div className="bg-white border text-gray-800 border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-2">
        <div className="text-gray-500 font-medium text-sm">{title}</div>
        <div className="text-gray-400 bg-gray-50 p-2 rounded-lg text-lg">
          {icon}
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-2">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {trendLabel && (
          <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trendUp ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
            <span className="mr-1">{trendUp ? '↗' : '↘'}</span>
            {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
