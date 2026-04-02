import React, { useState, useEffect } from 'react';
import inventoryAPI from '../services/inventoryAPI';
import locationsAPI from '../services/locationsAPI';
import { useToast } from './Toast';

export default function ZoneProductsModal({ location, onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const { success, error } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const allProducts = await inventoryAPI.getProducts();
      setProducts(allProducts);
      // Pré-sélectionner les produits qui sont déjà dans cette zone
      const initialSelected = allProducts
        .filter(p => p.location_id === location.id)
        .map(p => p.id);
      setSelectedIds(initialSelected);
    } catch (err) {
      error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    const filteredIds = filteredProducts.map(p => p.id);
    const allSelected = filteredIds.every(id => selectedIds.includes(id));
    
    if (allSelected) {
      // Déselectionner tous les visibles
      setSelectedIds(prev => prev.filter(id => !filteredIds.includes(id)));
    } else {
      // Sélectionner tous les visibles
      const newSelections = filteredIds.filter(id => !selectedIds.includes(id));
      setSelectedIds(prev => [...prev, ...newSelections]);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await locationsAPI.assignProducts(location.id, selectedIds);
      success(`Produits mis à jour pour la zone ${location.name}`);
      onSuccess();
    } catch (err) {
       error(err.response?.data?.error || 'Erreur lors de la mise à jour des produits');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              📦 Gérer les produits de la zone
            </h3>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-widest text-blue-600 dark:text-blue-400">
              {location.name}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 w-10 h-10 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">✕</button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <input 
                type="text" 
                placeholder="Rechercher par nom ou catégorie..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/30 text-sm font-bold dark:text-white"
            />
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading ? (
            <div className="p-8 flex justify-center"><div className="animate-pulse w-8 h-8 rounded-full bg-blue-500"></div></div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-400 font-bold italic">
              Aucun produit trouvé.
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-4 py-2 opacity-60">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{filteredProducts.length} produits listés</span>
                 <button onClick={handleToggleAll} className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
                    Tout (dé)sélectionner
                 </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredProducts.map(p => {
                    const isSelected = selectedIds.includes(p.id);
                    const isOtherLocation = p.location_id && p.location_id !== location.id;

                    return (
                        <div 
                            key={p.id}
                            onClick={() => handleToggle(p.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                                isSelected 
                                ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500' 
                                : 'bg-white border-transparent hover:border-gray-200 dark:bg-gray-800 dark:hover:border-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1 overflow-hidden">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center border transition-colors ${
                                    isSelected 
                                    ? 'bg-blue-500 border-blue-500 text-white' 
                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400'
                                }`}>
                                    {isSelected && <span>✓</span>}
                                </div>
                                <div className="truncate">
                                    <p className={`font-bold text-sm truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}>
                                        {p.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 font-bold text-gray-500 dark:text-gray-400 uppercase">
                                            {p.category}
                                        </span>
                                        {isOtherLocation && !isSelected && (
                                            <span className="text-[9px] text-amber-500 font-bold uppercase truncate" title={`Actuellement dans: ${p.location_name}`}>
                                                ⚠️ Déjà dans : {p.location_name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
          <div className="text-xs font-black text-gray-500 uppercase tracking-widest">
              <span className="text-blue-600 dark:text-blue-400 text-lg">{selectedIds.length}</span> produits sélectionnés
          </div>
          <div className="flex gap-3">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                disabled={saving}
            >
                Annuler
            </button>
            <button 
                type="button" 
                onClick={handleSave}
                disabled={saving || loading}
                className="px-8 py-2.5 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 hover:scale-105 active:scale-95"
            >
                {saving ? '⏳ Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
