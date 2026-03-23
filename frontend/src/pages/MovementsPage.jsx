import React, { useState, useEffect, useMemo } from 'react';
import inventoryAPI from '../services/inventoryAPI';
import locationsAPI from '../services/locationsAPI';
import { useToast } from '../components/Toast';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';

const MovementsPage = () => {
  const toast = useToast();
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_id: '', type: 'ENTREE', quantity: '', reason: '', source_location_id: '', destination_location_id: '' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [movData, prodData, locData] = await Promise.all([
        inventoryAPI.getMovements({ limit: 5000 }), 
        inventoryAPI.getProducts(),
        locationsAPI.getLocations()
      ]);
      setMovements(Array.isArray(movData.movements) ? movData.movements : []);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setLocations(Array.isArray(locData) ? locData : []);
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
        reason: form.reason || null,
        source_location_id: form.source_location_id ? parseInt(form.source_location_id) : null,
        destination_location_id: form.destination_location_id ? parseInt(form.destination_location_id) : null
      });
      toast.success('Mouvement enregistré avec succès');
      setForm({ product_id: '', type: 'ENTREE', quantity: '', reason: '', source_location_id: '', destination_location_id: '' });
      setShowModal(false);
      fetchData(); 
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const columns = useMemo(() => [
    { 
      key: 'created_at', 
      label: 'Date', 
      sortable: true,
      render: (val) => <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{formatDate(val)}</span>
    },
    { 
      key: 'product_name', 
      label: 'Produit', 
      sortable: true,
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white leading-tight">{val}</span>
          {row.category && (
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
              {row.category}
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Type', 
      sortable: true,
      className: 'text-center',
      render: (val) => {
        const variants = {
          'ENTREE': 'success',
          'SORTIE': 'blue',
          'PERTE': 'error',
          'TRANSFERT': 'warning'
        };
        return <Badge variant={variants[val] || 'neutral'} className="uppercase px-4">{val}</Badge>;
      }
    },
    { 
      key: 'quantity', 
      label: 'Quantité', 
      sortable: true, 
      className: 'text-right',
      render: (val, row) => {
        const sign = row.type === 'ENTREE' ? '+' : (row.type === 'TRANSFERT' ? '⇆' : '-');
        return <span className="font-black text-gray-900 dark:text-white">{sign}{val}</span>;
      }
    },
    { 
      key: 'reason', 
      label: 'Raison', 
      sortable: true,
      render: (val) => <span className="text-sm text-gray-400 dark:text-gray-500 italic font-medium">{val || '-'}</span>
    },
    { 
      key: 'full_name', 
      label: 'Par', 
      sortable: true,
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-[10px] font-black border border-blue-100 dark:border-blue-800">
            {(val || 'U').charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{val || 'Utilisateur'}</span>
        </div>
      )
    }
  ], []);

  const filteredMovements = useMemo(() => {
    if (!typeFilter) return movements;
    return movements.filter(m => m.type === typeFilter);
  }, [movements, typeFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Mouvements</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 opacity-80">Suivi en temps réel des flux de stock.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <span>📑</span> Nouveau Mouvement
        </button>
      </div>

      {/* Filters */}
      <div className="flex bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit gap-1 shadow-sm">
        {['', 'ENTREE', 'SORTIE', 'PERTE', 'TRANSFERT'].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all uppercase tracking-wider ${
              typeFilter === t 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
          >
            {t === '' ? 'Tous' : t}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={10} />
      ) : error ? (
        <div className="p-20 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-3xl border-2 border-dashed border-rose-200 dark:border-rose-900 text-center">
          <div className="text-6xl mb-6">🏜️</div>
          <p className="font-black text-xl mb-2 uppercase tracking-tight">Erreur de chargement</p>
          <button onClick={fetchData} className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
            Réessayer
          </button>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={filteredMovements} 
          searchPlaceholder="Rechercher par produit, raison, utilisateur..."
        />
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
                    { value: 'PERTE', label: '🗑️ Perte', color: 'rose' },
                    { value: 'TRANSFERT', label: '🏢 Transfert', color: 'amber' }
                  ].map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t.value }))}
                      className={`py-3 rounded-xl text-xs font-black border-2 transition-all ${
                        form.type === t.value
                          ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700 shadow-md'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transfer Details */}
              {form.type === 'TRANSFERT' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Zone Source *</label>
                    <select
                      value={form.source_location_id}
                      onChange={(e) => setForm(f => ({ ...f, source_location_id: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                      required
                    >
                      <option value="">-- Source --</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Zone Destination *</label>
                    <select
                      value={form.destination_location_id}
                      onChange={(e) => setForm(f => ({ ...f, destination_location_id: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                      required
                    >
                      <option value="">-- Destination --</option>
                      {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

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
                  className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black transition-all disabled:opacity-50 text-sm shadow-lg shadow-gray-900/10 dark:shadow-none"
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
