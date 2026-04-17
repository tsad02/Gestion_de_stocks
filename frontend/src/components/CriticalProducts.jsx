import React from 'react';

/**
 * Composant CriticalProducts - Liste des produits en seuil critique ou rupture
 * Design premium, responsive, avec indicateurs visuels forts.
 */
const CriticalProducts = ({ products = [], handleGenerateOrder }) => {
  const getAlertStyles = (level) => {
    if (level === 'CRITIQUE') {
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        accent: 'bg-rose-600',
        text: 'text-rose-700',
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        icon: '🚨'
      };
    }
    return {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      accent: 'bg-amber-500',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: '⚠️'
    };
  };

  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Stock optimal</h3>
        <p className="text-gray-500">Aucun produit ne nécessite d'attention immédiate.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="p-2 bg-white rounded-lg shadow-sm">⚠️</span>
          Alertes Stock
        </h2>
        <span className="px-3 py-1 bg-rose-50 border border-rose-100 rounded-full text-xs font-bold text-rose-600 shadow-sm animate-pulse">
          {products.length} alertes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-gray-100">
        {products.map((p, idx) => {
          const styles = getAlertStyles(p.alert_level);
          const deficit = p.needed || Math.max(0, p.threshold - p.stock);
          const stockPercentage = Math.round((p.stock / (p.threshold || 1)) * 100);

          return (
            <div key={p.product_id || idx} className="p-5 hover:bg-gray-50 transition-all flex flex-col gap-4 relative overflow-hidden group">
              {/* Progress bar background indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2" style={{ backgroundColor: styles.accent.includes('rose') ? '#e11d48' : '#f59e0b' }} />
              
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-900">{p.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles.badge} uppercase tracking-tight`}>
                      {p.alert_level}
                    </span>
                    {p.days_to_rupture !== null && p.days_to_rupture !== undefined && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-gray-100 text-gray-600 border-gray-200" title="Prévision selon la consommation des 30 derniers jours">
                        ⏱️ Rupture J-{p.days_to_rupture}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium">Catégorie: <span className="text-gray-700">{p.category || 'Standard'}</span></p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black ${styles.text}`}>
                    {p.stock}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">Restants</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Cible</p>
                  <p className="text-sm font-bold text-gray-700">{p.target_stock || p.threshold} unités</p>
                </div>
                <div className={`${styles.bg} rounded-xl p-3 border ${styles.border}`}>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">À commander</p>
                  <p className={`text-sm font-black ${styles.text}`}>+{deficit} unités</p>
                </div>
              </div>

              {/* Graphical representation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Niveau de stock</span>
                  <span className={`text-xs font-black ${styles.text}`}>{stockPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200 shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${Math.min(stockPercentage, 100)}%`,
                      backgroundColor: styles.accent.includes('rose') ? '#e11d48' : '#f59e0b'
                    }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <button 
          onClick={handleGenerateOrder}
          className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span>📦</span> Passer une commande groupée
        </button>
      </div>
    </div>
  );
};

export default CriticalProducts;
