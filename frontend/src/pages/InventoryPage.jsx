import React, { useState, useEffect, useMemo } from 'react';
import inventoryAPI from '../services/inventoryAPI';
import locationsAPI from '../services/locationsAPI';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import DataTable from '../components/ui/DataTable';
import Badge from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';

const InventoryPage = () => {
  const toast = useToast();
  
  // -- États de Données --
  const [products, setProducts] = useState([]);  // Liste complète des produits avec stock calculé
  const [locations, setLocations] = useState([]); // Liste des zones chargées pour le menu déroulant
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // -- Gestion des Modaux --
  const [showAddModal, setShowAddModal] = useState(false);
  // Initialisation du formulaire avec location_id vide par défaut
  const [addForm, setAddForm] = useState({ 
    name: '', 
    category: '', 
    unit: 'unité', 
    min_threshold: 0, 
    target_stock: 0, 
    location_id: '' 
  });
  const [addLoading, setAddLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, productId: null, productName: '' });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // -- Contrôle d'Accès --
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'RESPONSABLE'; // Détermine si l'utilisateur peut supprimer ou ajouter des produits

  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Récupère les produits et les localisations en parallèle.
   * La vue v_product_stock est utilisée côté serveur pour le stock actuel.
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodData, locData] = await Promise.all([
        inventoryAPI.getProducts(),
        locationsAPI.getLocations()
      ]);
      setProducts(Array.isArray(prodData) ? prodData : []);
      setLocations(Array.isArray(locData) ? locData : []);
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
      // location_id permet de définir la zone par défaut du produit
      await inventoryAPI.addProduct({
        name: addForm.name.trim(),
        category: addForm.category.trim(),
        unit: addForm.unit || 'unité',
        min_threshold: parseInt(addForm.min_threshold) || 0,
        target_stock: parseInt(addForm.target_stock) || 0,
        location_id: addForm.location_id ? parseInt(addForm.location_id) : null
      });
      setShowAddModal(false);
      setAddForm({ name: '', category: '', unit: 'unité', min_threshold: 0, target_stock: 0, location_id: '' });
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

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.category.trim()) {
      toast.error('Le nom et la catégorie sont obligatoires');
      return;
    }
    try {
      setEditLoading(true);
      await inventoryAPI.updateProduct(editForm.id, {
        name: editForm.name.trim(),
        category: editForm.category.trim(),
        unit: editForm.unit,
        min_threshold: parseInt(editForm.min_threshold) || 0,
        target_stock: parseInt(editForm.target_stock) || 0,
        location_id: editForm.location_id ? parseInt(editForm.location_id) : null
      });
      setEditModal(false);
      setEditForm(null);
      toast.success('Produit modifié avec succès');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setEditLoading(false);
    }
  };

  const columns = useMemo(() => [
    { 
      key: 'name', 
      label: 'Produit', 
      sortable: true,
      render: (val) => <span className="font-bold text-gray-900 dark:text-white">{val}</span>
    },
    { 
      key: 'category', 
      label: 'Catégorie', 
      sortable: true,
      render: (val) => <Badge variant="neutral" className="uppercase">{val}</Badge>
    },
    { 
      key: 'location_name', 
      label: 'Zone', 
      sortable: true,
      render: (val) => val ? <Badge variant="blue" className="bg-blue-50 text-blue-600 border-blue-100">{val}</Badge> : <span className="text-gray-300 text-[10px] uppercase font-bold italic">Non défini</span>
    },
    { key: 'unit', label: 'Unité', sortable: true },
    { 
      key: 'target_stock', 
      label: 'Cible', 
      sortable: true, 
      className: 'text-right',
      render: (val) => <span className="text-gray-400 font-bold">{val || 0}</span>
    },
    { 
      key: 'min_threshold', 
      label: 'Seuil Min', 
      sortable: true, 
      className: 'text-right',
      render: (val) => <span className="text-amber-500 font-bold">{val}</span>
    },
    { 
      key: 'stock_actuel', 
      label: 'Stock', 
      sortable: true, 
      className: 'text-right',
      render: (val, row) => {
        const stock = parseInt(val) || 0;
        const low = stock <= (parseInt(row.min_threshold) || 0);
        return (
          <span className={`text-base font-black ${low ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {stock}
          </span>
        );
      }
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: false,
      className: 'text-center',
      render: (_, row) => {
        const stock = parseInt(row.stock_actuel) || 0;
        const threshold = parseInt(row.min_threshold) || 0;
        if (stock === 0) return <Badge variant="error" className="uppercase">Rupture</Badge>;
        if (stock <= threshold) return <Badge variant="warning" className="uppercase">Alerte</Badge>;
        return <Badge variant="success" className="uppercase">Ok</Badge>;
      }
    },
    ...(isAdmin ? [{
      key: 'actions',
      label: 'Actions',
      sortable: false,
      className: 'text-right no-print',
      render: (_, row) => (
        <div className="flex justify-end items-center gap-1">
          <button 
            onClick={() => {
              setEditForm({
                id: row.id,
                name: row.name,
                category: row.category,
                unit: row.unit || '',
                min_threshold: row.min_threshold || 0,
                target_stock: row.target_stock || 0,
                location_id: row.location_id || ''
              });
              setEditModal(true);
            }}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Modifier"
          >
            ✏️
          </button>
          <button 
            onClick={() => setDeleteModal({ open: true, productId: row.id, productName: row.name })}
            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
            title="Supprimer"
          >
            🗑️
          </button>
        </div>
      )
    }] : [])
  ], [isAdmin]);

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Inventaire</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 opacity-80">
            {products.length} produits enregistrés dans le catalogue.
          </p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)} 
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>➕</span> Nouveau Produit
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : error ? (
        <div className="p-20 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-3xl border-2 border-dashed border-rose-200 dark:border-rose-900 text-center">
          <div className="text-6xl mb-6">🏝️</div>
          <p className="font-black text-xl mb-2 uppercase tracking-tight">Erreur de connexion</p>
          <p className="mb-8 opacity-60 font-medium">Impossible de joindre le serveur pour récupérer la liste des produits.</p>
          <button onClick={fetchProducts} className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
            Réessayer
          </button>
        </div>
      ) : (
        <DataTable 
          columns={columns} 
          data={products} 
          searchPlaceholder="Rechercher un produit, une catégorie, une unité ou une zone..."
        />
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 no-print animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="px-10 py-8 border-b border-gray-50 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/30 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">Nouveau Produit</h2>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] font-black uppercase tracking-widest mt-2 ml-0.5 opacity-60">Ajouter au catalogue</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nom du produit</label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => setAddForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="ex: Lait de soja"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Catégorie</label>
                  <input
                    type="text"
                    value={addForm.category}
                    onChange={(e) => setAddForm(f => ({ ...f, category: e.target.value }))}
                    list="categories"
                    placeholder="ex: Boissons"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-inner"
                    required
                  />
                  <datalist id="categories">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Unité de mesure</label>
                  <input
                    type="text"
                    value={addForm.unit}
                    onChange={(e) => setAddForm(f => ({ ...f, unit: e.target.value }))}
                    placeholder="ex: Litre, Kg, Unité"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Seuil minimal (Alerte)</label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.min_threshold}
                    onChange={(e) => setAddForm(f => ({ ...f, min_threshold: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Stock cible idéal</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Stock souhaité après réapprovisionnement"
                    value={addForm.target_stock}
                    onChange={(e) => setAddForm(f => ({ ...f, target_stock: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Zone de stockage (Emplacement)</label>
                  <select
                    value={addForm.location_id}
                    onChange={(e) => setAddForm(f => ({ ...f, location_id: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="">-- Aucune zone principale --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl font-black text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-black transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl shadow-gray-900/20 dark:shadow-none hover:scale-105 active:scale-95"
                >
                  {addLoading ? '⏳' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModal && editForm && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 no-print animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="px-10 py-8 border-b border-gray-50 dark:border-gray-700/50 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/30 sticky top-0 z-10 backdrop-blur-md">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase leading-none">Modifier Produit</h2>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] font-black uppercase tracking-widest mt-2 ml-0.5 opacity-60">Mise à jour du catalogue</p>
              </div>
              <button 
                onClick={() => { setEditModal(false); setEditForm(null); }}
                className="w-10 h-10 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Nom du produit</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Catégorie</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                    list="edit_categories"
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner"
                    required
                  />
                  <datalist id="edit_categories">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Unité de mesure</label>
                  <input
                    type="text"
                    value={editForm.unit}
                    onChange={(e) => setEditForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Seuil minimal (Alerte)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.min_threshold}
                    onChange={(e) => setEditForm(f => ({ ...f, min_threshold: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Stock cible idéal</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.target_stock}
                    onChange={(e) => setEditForm(f => ({ ...f, target_stock: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-1">Zone de stockage</label>
                  <select
                    value={editForm.location_id}
                    onChange={(e) => setEditForm(f => ({ ...f, location_id: e.target.value }))}
                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700/50 rounded-[1.25rem] text-gray-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 outline-none transition-all shadow-inner cursor-pointer"
                  >
                    <option value="">-- Aucune zone principale --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setEditModal(false); setEditForm(null); }}
                  className="flex-1 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl font-black text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs uppercase tracking-widest"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 active:scale-95"
                >
                  {editLoading ? '⏳...' : 'Enregistrer'}
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
