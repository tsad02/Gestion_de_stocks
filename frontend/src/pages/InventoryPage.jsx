import React, { useState, useEffect } from 'react';
import inventoryAPI from '../services/inventoryAPI';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

const InventoryPage = () => {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', category: '', unit: 'unité', min_threshold: 0, target_stock: 0 });
  const [addLoading, setAddLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, productId: null, productName: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'RESPONSABLE';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryAPI.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement produits:', err);
      setError('Erreur lors du chargement des produits.');
      toast.error('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.category.trim()) {
      toast.error('Le nom et la catégorie sont obligatoires');
      return;
    }
    try {
      setAddLoading(true);
      await inventoryAPI.addProduct({
        name: addForm.name.trim(),
        category: addForm.category.trim(),
        unit: addForm.unit || 'unité',
        min_threshold: parseInt(addForm.min_threshold) || 0,
        target_stock: parseInt(addForm.target_stock) || 0
      });
      setShowAddModal(false);
      setAddForm({ name: '', category: '', unit: 'unité', min_threshold: 0, target_stock: 0 });
      toast.success('Produit ajouté avec succès');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setAddLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteModal.productId) return;
    try {
      setDeleteLoading(true);
      await inventoryAPI.deleteProduct(deleteModal.productId);
      toast.success('Produit supprimé avec succès');
      setDeleteModal({ open: false, productId: null, productName: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setDeleteLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['ID,Nom,Catégorie,Stock Actuel,Seuil Minimum,Unité'];
    const rows = products.map(p => 
      `${p.id},"${p.name}","${p.category}",${p.stock_actuel || 0},${p.min_threshold || 0},"${p.unit}"`
    );
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `inventaire_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Export CSV démarré');
  };

  const exportPDF = () => {
    window.print();
  };

  const getStatus = (product) => {
    const stock = parseInt(product.stock_actuel) || 0;
    const threshold = parseInt(product.min_threshold) || 0;
    if (stock === 0) return { label: 'RUPTURE', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-900' };
    if (stock <= threshold) return { label: 'ALERTE', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-900' };
    return { label: 'OK', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' };
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Inventaire</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
            {products.length} produits · {products.filter(p => (parseInt(p.stock_actuel) || 0) <= (parseInt(p.min_threshold) || 0)).length} en alerte
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={exportCSV} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
            📊 CSV
          </button>
          <button onClick={exportPDF} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
            📄 PDF
          </button>
          <button onClick={fetchProducts} className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm">
            🔄
          </button>
          {isAdmin && (
            <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-sm shadow-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all flex items-center gap-2">
              <span>➕</span> Nouveau
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md no-print">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Rechercher un produit ou une catégorie..."
          value={search}
          onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);}}
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500/30 transition-all outline-none shadow-sm"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden no-print">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-6 px-8 py-5 border-b border-gray-50 dark:border-gray-700/50">
              <div className="h-4 w-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-12 bg-gray-100 dark:bg-gray-700 rounded animate-pulse ml-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-12 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-100 dark:border-rose-900/30 text-center no-print">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="font-bold text-lg mb-2">Erreur de chargement</p>
          <button onClick={fetchProducts} className="px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 font-bold shadow-md mt-4">
            Réessayer
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-16 text-center no-print">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{search ? 'Aucun résultat' : 'Aucun produit'}</h3>
          <p className="text-gray-500 dark:text-gray-400">{search ? `Aucun produit ne correspond à "${search}".` : 'Le catalogue est vide. Commencez par ajouter des produits.'}</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-700/30 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                  <th className="px-8 py-5">Produit</th>
                  <th className="px-8 py-5">Catégorie</th>
                  <th className="px-8 py-5">Unité</th>
                  <th className="px-8 py-5 text-right">Cible</th>
                  <th className="px-8 py-5 text-right">Seuil Min</th>
                  <th className="px-8 py-5 text-right">Stock</th>
                  <th className="px-8 py-5 text-center">Statut</th>
                  {isAdmin && <th className="px-8 py-5 text-right no-print">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {currentData.map((p) => {
                  const status = getStatus(p);
                  const stock = parseInt(p.stock_actuel) || 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-8 py-4 font-bold text-gray-900 dark:text-white">{p.name}</td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs font-bold tracking-tight">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-gray-500 dark:text-gray-400 text-sm">{p.unit}</td>
                      <td className="px-8 py-4 text-right font-medium text-gray-400 dark:text-gray-500">{p.target_stock || 0}</td>
                      <td className="px-8 py-4 text-right font-medium text-amber-500 dark:text-amber-400">{p.min_threshold}</td>
                      <td className="px-8 py-4 text-right">
                        <span className={`text-sm font-black ${stock <= (parseInt(p.min_threshold) || 0) ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${status.color} uppercase inline-block`}>
                          {status.label}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-8 py-4 text-right no-print">
                          <button 
                            onClick={() => setDeleteModal({ open: true, productId: p.id, productName: p.name })}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-8 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between no-print">
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

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideIn">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">➕ Ajouter un produit</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Le stock initial sera de 0. Utilisez un mouvement ENTRÉE pour l'ajuster.</p>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nom du produit *</label>
                <input
                  type="text"
                  value={addForm.name}
                  onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Catégorie *</label>
                <input
                  type="text"
                  value={addForm.category}
                  onChange={(e) => setAddForm(f => ({ ...f, category: e.target.value }))}
                  list="categories"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                  required
                />
                <datalist id="categories">
                  {categories.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Unité</label>
                  <input
                    type="text"
                    value={addForm.unit}
                    onChange={(e) => setAddForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Seuil minimal</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.min_threshold}
                    onChange={(e) => setAddForm(f => ({ ...f, min_threshold: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Stock cible</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.target_stock}
                    onChange={(e) => setAddForm(f => ({ ...f, target_stock: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500/30 outline-none"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold transition-all disabled:opacity-50 text-sm shadow-lg"
                >
                  {addLoading ? '⏳...' : '✅ Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        open={deleteModal.open}
        title="Supprimer le produit"
        message={`Êtes-vous sûr de vouloir supprimer définitivement "${deleteModal.productName}" ? Cette action est irréversible.`}
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeleteModal({ open: false, productId: null, productName: '' })}
        loading={deleteLoading}
      />
    </div>
  );
};

export default InventoryPage;
