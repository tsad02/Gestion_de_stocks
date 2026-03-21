import React, { useState, useEffect } from 'react';
import inventoryAPI from '../services/inventoryAPI';
import { useToast } from '../components/Toast';

const MovementsPage = () => {
  const toast = useToast();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_id: '', type: 'ENTREE', quantity: '', reason: '' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [movData, prodData] = await Promise.all([
        inventoryAPI.getMovements({ limit: 5000 }), // Get enough records for client-side pagination
        inventoryAPI.getProducts()
      ]);
      setMovements(Array.isArray(movData.movements) ? movData.movements : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError('Erreur lors du chargement des données.');
      toast.error('Impossible de charger les mouvements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.type || !form.quantity) {
      toast.error('Produit, type et quantité sont obligatoires');
      return;
    }
    if (parseInt(form.quantity) <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }

    try {
      setFormLoading(true);
      await inventoryAPI.addMovement({
        product_id: parseInt(form.product_id),
        type: form.type,
        quantity: parseInt(form.quantity),
        reason: form.reason || null
      });
      toast.success('Mouvement enregistré avec succès');
      setForm({ product_id: '', type: 'ENTREE', quantity: '', reason: '' });
      setShowModal(false);
      fetchData(); // Refresh all data to update stock levels too
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setFormLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Date,Produit,Catégorie,Type,Quantité,Raison,Utilisateur'];
    const rows = filtered.map(m => 
      `"${formatDate(m.created_at)}","${m.product_name}","${m.category || ''}","${m.type}",${m.quantity},"${m.reason || ''}","${m.full_name || ''}"`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mouvements_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Export CSV démarré');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const typeConfig = {
    ENTREE: { label: '📥 ENTRÉE', color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', sign: '+' },
    SORTIE: { label: '📤 SORTIE', color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800', sign: '-' },
    PERTE:  { label: '🗑️ PERTE', color: 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800', sign: '-' }
  };

  const filtered = movements.filter(m => {
    const matchSearch = !search ||
      m.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.reason?.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || m.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Mouvements</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Suivi détaillé de tous les flux de stock.</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportCSV} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
            📊 Exporter CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2"
          >
            <span>📑</span> Nouveau Mouvement
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Rechercher produit, utilisateur, raison..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500/30 transition-all outline-none shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'ENTREE', 'SORTIE', 'PERTE'].map(t => (
            <button
              key={t}
              onClick={() => {setTypeFilter(t); setCurrentPage(1);}}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                typeFilter === t 
                  ? 'bg-gray-900 dark:bg-amber-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 border hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {t === '' ? 'Tous' : t === 'ENTREE' ? '📥 Entrées' : t === 'SORTIE' ? '📤 Sorties' : '🗑️ Pertes'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-8 py-5 border-b border-gray-50 dark:border-gray-700/50">
              <div className="h-4 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-12 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="font-bold text-lg mb-2">Erreur de chargement</p>
          <button onClick={fetchData} className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-bold shadow-md mt-4">
            Réessayer
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{search || typeFilter ? 'Aucun résultat' : 'Aucun mouvement'}</h3>
          <p className="text-gray-500 dark:text-gray-400">{search || typeFilter ? 'Essayez avec d\'autres critères.' : 'L\'historique des mouvements apparaîtra ici.'}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/30 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                  <th className="px-8 py-5">Date</th>
                  <th className="px-8 py-5">Produit</th>
                  <th className="px-8 py-5 text-center">Type</th>
                  <th className="px-8 py-5 text-right">Quantité</th>
                  <th className="px-8 py-5">Raison</th>
                  <th className="px-8 py-5">Par</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {currentData.map((m) => {
                  const config = typeConfig[m.type] || typeConfig.ENTREE;
                  return (
                    <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-8 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400">{formatDate(m.created_at)}</td>
                      <td className="px-8 py-4">
                        <span className="font-bold text-gray-900 dark:text-white">{m.product_name}</span>
                        {m.category && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 rounded text-[10px] font-bold">
                            {m.category}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${config.color}`}>
                          {m.type}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right font-black text-gray-900 dark:text-white">
                        {config.sign}{m.quantity}
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-400 dark:text-gray-500 italic font-medium">{m.reason || '-'}</td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-300">
                            {(m.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{m.full_name || 'Utilisateur'}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                Page {currentPage} sur {totalPages}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Précédent
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Movement Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideIn">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">📑 Nouveau Mouvement</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enregistrer une entrée, une sortie ou une perte de stock.</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* Product Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Produit *</label>
                <select
                  value={form.product_id}
                  onChange={(e) => setForm(f => ({ ...f, product_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                  required
                >
                  <option value="">-- Sélectionner un produit --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category}) — Stock: {p.stock_actuel || 0}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type de mouvement *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'ENTREE', label: '📥 Entrée', color: 'emerald' },
                    { value: 'SORTIE', label: '📤 Sortie', color: 'blue' },
                    { value: 'PERTE', label: '🗑️ Perte', color: 'rose' }
                  ].map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t.value }))}
                      className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                        form.type === t.value
                          ? `bg-${t.color}-50 dark:bg-${t.color}-900/40 text-${t.color}-700 dark:text-${t.color}-400 border-${t.color}-300 dark:border-${t.color}-700 shadow-md`
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quantité *</label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))}
                  placeholder="ex: 25"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                  required
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Raison (optionnel)</label>
                <input
                  type="text"
                  value={form.reason}
                  onChange={(e) => setForm(f => ({ ...f, reason: e.target.value }))}
                  placeholder="ex: Livraison fournisseur, Vente..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold transition-all disabled:opacity-50 text-sm shadow-lg"
                >
                  {formLoading ? '⏳...' : '✅ Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovementsPage;
