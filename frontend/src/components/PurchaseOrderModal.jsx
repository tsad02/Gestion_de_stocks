import React, { useState, useEffect } from 'react';
import inventoryAPI from '../services/inventoryAPI';
import purchaseOrderAPI from '../services/purchaseOrderAPI';
import { useToast } from '../components/Toast';

/**
 * Modal de création/édition de Bon de Commande
 * @param {Object} props - initialData (optional), onClose, onSuccess
 */
const PurchaseOrderModal = ({ initialData, onClose, onSuccess }) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [items, setItems] = useState(initialData?.items || []);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { success, error } = useToast();
  const isReadOnly = initialData?.status === 'RECUE' || initialData?.status === 'ANNULEE';

  useEffect(() => {
    fetchProducts();
    // If no items provided but we have initialData with product IDs (like critical products)
    if (!initialData?.items && initialData?.criticalProducts) {
        const prefilledItems = initialData.criticalProducts.map(p => ({
            product_id: p.id || p.product_id,
            product_name: p.name || p.product_name,
            quantity: Math.max(1, (p.threshold || p.min_threshold) - (p.stock || p.stock_actuel || 0)),
            price_estimated: 0
        }));
        setItems(prefilledItems);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const prods = await inventoryAPI.getProducts();
      setAllProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors du chargement des produits', 'error');
    }
  };

  const addItem = (product) => {
    if (items.find(i => i.product_id === product.id)) {
        showToast('Produit déjà ajouté', 'info');
        return;
    }
    setItems([...items, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        price_estimated: 0
    }]);
    setSearch('');
  };

  const removeItem = (id) => {
    setItems(items.filter(i => i.product_id !== id));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(i => i.product_id === id ? { ...i, [field]: value } : i));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
        error('Veuillez ajouter au moins un produit');
        return;
    }

    setLoading(true);
    try {
      if (initialData?.id) {
        await purchaseOrderAPI.update(initialData.id, { description, items });
        success('Commande mise à jour');
      } else {
        await purchaseOrderAPI.create({ description, items });
        success('Bon de commande créé avec succès');
      }
      onSuccess();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message || 'Erreur lors de l’enregistrement';
      error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) && 
    !items.find(i => i.product_id === p.id)
  ).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center">
              {initialData?.id ? (isReadOnly ? 'Consulter la commande' : 'Modifier la commande') : 'Nouveau Bon de Commande'}
              {initialData?.status && (
                <span className={`ml-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  initialData.status === 'VALIDEE' ? 'bg-blue-100 text-blue-600' : 
                  initialData.status === 'RECUE' ? 'bg-green-100 text-green-600' :
                  initialData.status === 'ANNULEE' ? 'bg-rose-100 text-rose-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {initialData.status}
                </span>
              )}
            </h2>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
              {initialData?.id ? `PO #${initialData.id}` : 'Planification de stock'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-400">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Description / Note</label>
            <input
              type="text"
              className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500/20 outline-none dark:text-white ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}`}
              placeholder="Ex: Commande hebdomadaire grossiste"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isReadOnly}
              required
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Articles à commander</label>
                <div className="relative w-64">
                    {!isReadOnly && (
                        <>
                            <input
                                type="text"
                                placeholder="Rechercher un produit..."
                                className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                                    {filteredProducts.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => addItem(p)}
                                            className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white border-b border-gray-50 dark:border-gray-700 last:border-0"
                                        >
                                            {p.name} <span className="text-[10px] text-gray-400">({p.category})</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100/50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500">
                  <tr>
                    <th className="px-4 py-3 text-left">Produit</th>
                    <th className="px-4 py-3 text-center w-24">Quantité</th>
                    <th className="px-4 py-3 text-right w-32">Prix Est.</th>
                    <th className="px-4 py-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {items.map(item => (
                    <tr key={item.product_id} className="dark:text-white">
                      <td className="px-4 py-3 font-bold text-xs">{item.product_name}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          className={`w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-center text-xs outline-none focus:ring-2 focus:ring-blue-500/20 ${isReadOnly ? 'cursor-not-allowed' : ''}`}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.product_id, 'quantity', parseInt(e.target.value) || 0)}
                          disabled={isReadOnly}
                        />
                      </td>
                      <td className="px-4 py-3">
                         <div className="flex items-center gap-1 justify-end">
                            <input
                            type="number"
                            step="0.01"
                            className={`w-20 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-right text-xs outline-none focus:ring-2 focus:ring-blue-500/20 ${isReadOnly ? 'cursor-not-allowed' : ''}`}
                            value={item.price_estimated}
                            onChange={(e) => updateItem(item.product_id, 'price_estimated', parseFloat(e.target.value) || 0)}
                            disabled={isReadOnly}
                            />
                            <span className="text-[10px] text-gray-400">$</span>
                         </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {!isReadOnly && <button type="button" onClick={() => removeItem(item.product_id)} className="text-gray-400 hover:text-rose-500 transition-colors">×</button>}
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 italic text-xs">
                        Aucun produit sélectionné
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {items.length > 0 && (
                <div className="flex justify-end px-4 py-2 bg-blue-50/50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/10">
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        Total Estimé: {items.reduce((sum, i) => sum + (i.quantity * i.price_estimated), 0).toFixed(2)} $
                    </p>
                </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button
            onClick={handlePrint}
            type="button"
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-200 transition-all no-print"
          >
            🖨️ Imprimer PDF
          </button>
          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-2.5 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 no-print"
            >
              {loading ? '⏳ Enregistrement...' : (initialData?.id ? 'Mettre à jour' : 'Créer le Bon')}
            </button>
          )}
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            .no-print { display: none !important; }
            .bg-black\\/60 { background: white !important; backdrop-filter: none !important; position: relative !important; }
            .fixed { position: relative !important; }
            .max-h-\\[90vh\\] { max-height: none !important; overflow: visible !important; }
            .max-w-2xl { max-width: 100% !important; margin: 0 !important; border: none !important; box-shadow: none !important; }
            body * { visibility: hidden; }
            #root, .fixed, .fixed * { visibility: visible; }
            .fixed { left: 0; top: 0; width: 100%; }
            form { overflow: visible !important; padding: 0 !important; }
            .p-8 { padding: 1rem !important; }
            .divide-y > * { border-color: #eee !important; }
            input { border: none !important; padding: 0 !important; background: transparent !important; }
          }
        `}} />
      </div>
    </div>
  );
};

export default PurchaseOrderModal;
