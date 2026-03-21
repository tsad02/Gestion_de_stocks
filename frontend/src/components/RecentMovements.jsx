import React from 'react';

/**
 * Composant RecentMovements - Affiche les derniers mouvements de stock
 * Design moderne, professionnel et robuste.
 */
const RecentMovements = ({ movements = [] }) => {
  const getMovementIcon = (type) => {
    switch (type) {
      case 'ENTREE': return '📥';
      case 'SORTIE': return '📤';
      case 'PERTE': return '🗑️';
      default: return '📦';
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'ENTREE':
        return { 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-700', 
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' 
        };
      case 'SORTIE':
        return { 
          bg: 'bg-blue-50', 
          text: 'text-blue-700', 
          badge: 'bg-blue-100 text-blue-800 border-blue-200' 
        };
      case 'PERTE':
        return { 
          bg: 'bg-rose-50', 
          text: 'text-rose-700', 
          badge: 'bg-rose-100 text-rose-800 border-rose-200' 
        };
      default:
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-700', 
          badge: 'bg-gray-100 text-gray-800 border-gray-200' 
        };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return 'Format invalide';
    }
  };

  if (!movements || movements.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Aucun mouvement</h3>
        <p className="text-gray-500">L'historique des mouvements apparaîtra ici.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <span className="p-2 bg-white rounded-lg shadow-sm">📋</span>
          Mouvements Récents
        </h2>
        <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
          {movements.length} derniers
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/30 text-gray-500 uppercase text-[10px] font-bold tracking-wider divide-x divide-gray-100">
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Produit</th>
              <th className="px-6 py-4">Catégorie</th>
              <th className="px-6 py-4 text-center">Qté</th>
              <th className="px-6 py-4">Utilisateur</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movements.map((m, idx) => {
              const theme = getMovementColor(m.type);
              return (
                <tr key={m.id || idx} className="hover:bg-gray-50/80 transition-all group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-xl opacity-80 group-hover:scale-110 transition-transform">
                        {getMovementIcon(m.type)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${theme.badge} uppercase tracking-tight`}>
                        {m.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 line-clamp-1">{m.product_name}</span>
                    {m.reason && <p className="text-[10px] text-gray-400 mt-0.5 italic">{m.reason}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                      {m.category || m.product_category || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-sm font-bold ${theme.text}`}>
                      {m.type === 'ENTREE' ? '+' : '-'}{m.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 border border-white shadow-sm">
                        {(m.username || m.created_by || 'U').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-700">{m.username || m.created_by || 'Utilisateur'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-500 font-medium">
                      {formatDate(m.timestamp || m.created_at)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-100 text-center">
        <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest">
          Voir tout l'historique --&gt;
        </button>
      </div>
    </div>
  );
};

export default RecentMovements;
