import React from 'react';

/**
 * Composant Recent Movements - Style Delisas
 */
const RecentMovements = ({ movements = [], isEmbedded = false }) => {
  const getStatusBadge = (type) => {
    switch (type) {
      case 'ENTREE':
        return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">Stock In</span>;
      case 'SORTIE':
        return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-semibold">Ordered</span>;
      case 'PERTE':
        return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-semibold">Loss</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-semibold">{type}</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const content = (
    <table className="w-full text-sm text-left whitespace-nowrap">
      <thead>
        <tr className="text-gray-400 font-medium">
          <th className="py-3 px-4 w-10"><input type="checkbox" className="rounded text-blue-500 border-gray-300 pointer-events-none" /></th>
          <th className="py-3 px-4">Tracking ID</th>
          <th className="py-3 px-4">Category</th>
          <th className="py-3 px-4">Product Name</th>
          <th className="py-3 px-4">Delivery Time</th>
          <th className="py-3 px-4">Requested By</th>
          <th className="py-3 px-4">Quantity</th>
          <th className="py-3 px-4 text-center">Status</th>
          <th className="py-3 px-4 w-10"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {!movements || movements.length === 0 ? (
          <tr>
            <td colSpan="9" className="text-center py-8 text-gray-500">Aucun mouvement récent</td>
          </tr>
        ) : (
          movements.slice(0, 10).map((m) => (
            <tr key={m.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4"><input type="checkbox" className="rounded text-blue-500 border-gray-300" /></td>
              <td className="py-4 px-4 text-gray-500">#TRK-{m.id.toString().padStart(5, '0')}</td>
              <td className="py-4 px-4 text-gray-900 flex items-center">
                <span className="text-lg mr-2">{m.type === 'ENTREE' ? '🇨🇦' : '🇺🇸'}</span> 
                {m.type === 'PERTE' ? 'Waste' : 'Standard'}
              </td>
              <td className="py-4 px-4 font-medium text-gray-900">{m.product_name}</td>
              <td className="py-4 px-4 text-gray-500">{formatDate(m.timestamp)}</td>
              <td className="py-4 px-4 text-gray-700 flex items-center">
                 <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mr-2">
                   {m.username.charAt(0).toUpperCase()}
                 </div>
                 {m.username}
              </td>
              <td className="py-4 px-4 font-semibold text-gray-900">{m.quantity}</td>
              <td className="py-4 px-4 text-center">{getStatusBadge(m.type)}</td>
              <td className="py-4 px-4 text-gray-400 cursor-pointer hover:text-gray-600">⋮</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  if (isEmbedded) {
    return content;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Liste des Expéditions</h2>
      <div className="overflow-x-auto">
        {content}
      </div>
    </div>
  );
};

export default RecentMovements;
