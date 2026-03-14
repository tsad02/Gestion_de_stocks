import React from 'react';

/**
 * Composant Movement Stats - Affiche les statistiques de mouvements (7 jours)
 */
const MovementStats = ({ movements = {} }) => {
  const entries = movements.entries || { count: 0, quantity: 0 };
  const exits = movements.exits || { count: 0, quantity: 0 };
  const losses = movements.losses || { count: 0, quantity: 0 };

  const totalMovements = entries.count + exits.count + losses.count;
  const totalQuantity = entries.quantity + exits.quantity + losses.quantity;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Statistiques (7 derniers jours)</h2>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-gray-600 text-sm">Total Mouvements</p>
            <p className="text-2xl font-bold text-gray-800">{totalMovements}</p>
          </div>
          <div className="border-l border-gray-200"></div>
          <div>
            <p className="text-gray-600 text-sm">Quantité Totale</p>
            <p className="text-2xl font-bold text-gray-800">{totalQuantity}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* ENTREE */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">📥</span>
            <h3 className="font-semibold text-green-800">Entrées</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Mouvements: <span className="font-bold text-green-600">{entries.count}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold text-green-600">{entries.quantity}</span>
            </p>
          </div>
        </div>

        {/* SORTIE */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">📤</span>
            <h3 className="font-semibold text-blue-800">Sorties</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Mouvements: <span className="font-bold text-blue-600">{exits.count}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold text-blue-600">{exits.quantity}</span>
            </p>
          </div>
        </div>

        {/* PERTE */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">⚠️</span>
            <h3 className="font-semibold text-red-800">Pertes</h3>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Mouvements: <span className="font-bold text-red-600">{losses.count}</span>
            </p>
            <p className="text-sm text-gray-600">
              Total: <span className="font-bold text-red-600">{losses.quantity}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovementStats;
