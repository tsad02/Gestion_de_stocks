import React from 'react';

/**
 * Composant Critical Products - Affiche les produits en alerte
 */
const CriticalProducts = ({ products = [] }) => {
  if (!products || products.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">⚠️ Produits Critiques</h2>
        <p className="text-gray-500 text-center py-8">Aucun produit en alerte ✅</p>
      </div>
    );
  }

  const getAlertColor = (level) => {
    if (level === 'CRITICAL') return 'bg-red-50 border-red-200';
    return 'bg-orange-50 border-orange-200';
  };

  const getAlertBadge = (level) => {
    if (level === 'CRITICAL') return 'bg-red-100 text-red-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">⚠️ Produits Critiques</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.product_id}
            className={`${getAlertColor(product.alert_level)} border rounded-lg p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <span className={`${getAlertBadge(product.alert_level)} px-2 py-1 rounded text-xs font-semibold`}>
                {product.alert_level}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Stock</p>
                <p className="text-lg font-bold text-red-600">{product.stock}</p>
              </div>
              <div>
                <p className="text-gray-600">Seuil</p>
                <p className="text-lg font-bold text-gray-800">{product.threshold}</p>
              </div>
              <div>
                <p className="text-gray-600">À commander</p>
                <p className="text-lg font-bold text-orange-600">{product.needed}</p>
              </div>
            </div>

            {product.category && (
              <div className="mt-2 text-xs text-gray-500">
                Catégorie: <span className="font-medium">{product.category}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriticalProducts;
