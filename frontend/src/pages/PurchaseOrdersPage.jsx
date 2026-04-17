import React, { useState, useEffect } from 'react';
import purchaseOrderAPI from '../services/purchaseOrderAPI';
import PurchaseOrderModal from '../components/PurchaseOrderModal';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';

/**
 * Page de gestion des Bons de Commande
 * Liste, filtrage, édition et changement d'état
 */
const PurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('TOUS');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [autoGenConfirmOpen, setAutoGenConfirmOpen] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await purchaseOrderAPI.getAll();
      setOrders(data);
    } catch (err) {
      console.error(err);
      error('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (id) => {
    try {
      const data = await purchaseOrderAPI.getById(id);
      setSelectedOrder(data);
      setIsModalOpen(true);
    } catch (err) {
      error('Erreur lors du chargement du détail');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await purchaseOrderAPI.update(id, { status: newStatus });
      success(`Statut mis à jour : ${newStatus}`);
      fetchOrders();
    } catch (err) {
      error('Erreur lors de la mise à jour du statut');
    }
  };

  const handleAutoGenerate = async () => {
    setAutoGenConfirmOpen(false);
    try {
      setLoading(true);
      const res = await purchaseOrderAPI.autoCreate();
      success(res.message || 'Bon de commande généré avec succès');
      fetchOrders();
    } catch (err) {
      error(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de la génération automatique');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (order) => {
    setOrderToDelete(order);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
      await purchaseOrderAPI.delete(orderToDelete.id);
      success('Commande supprimée');
      fetchOrders();
    } catch (err) {
      error('Erreur lors de la suppression');
    } finally {
      setIsConfirmOpen(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'BROUILLON': 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
      'VALIDEE': 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
      'RECUE': 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400',
      'ANNULEE': 'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${styles[status] || styles.BROUILLON}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">📦 Bons de Commande</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Gérez vos réapprovisionnements et vos relations fournisseurs.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setAutoGenConfirmOpen(true)}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white text-xs font-black rounded-xl hover:scale-105 transition-all uppercase tracking-widest shadow-xl shadow-amber-500/30 dark:shadow-none"
          >
            ⚡ Auto-Réap.
          </button>
          <button
            onClick={() => { setSelectedOrder(null); setIsModalOpen(true); }}
            className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black rounded-xl hover:scale-105 transition-all uppercase tracking-widest shadow-xl shadow-gray-200 dark:shadow-none"
          >
            + Nouvelle Commande
          </button>
        </div>
      </div>

      {/* Stats and Filter */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatMiniCard label="En Attente" count={orders.filter(o => o.status === 'VALIDEE').length} color="blue" />
            <StatMiniCard label="Brouillons" count={orders.filter(o => o.status === 'BROUILLON').length} color="gray" />
            <StatMiniCard label="Total (Mois)" count={orders.length} color="green" />
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-100 dark:border-gray-700 flex gap-1 self-end shadow-sm">
            {['TOUS', 'BROUILLON', 'VALIDEE', 'RECUE', 'ANNULEE'].map(f => (
                <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${statusFilter === f ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                >
                    {f === 'TOUS' ? 'Tous' : f}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Référence</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Statut</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Items / Total Est.</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 dark:text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
                    Chargement des commandes...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center text-gray-400 dark:text-gray-500 italic text-sm">
                    Aucune commande enregistrée pour le moment.
                  </td>
                </tr>
              ) : (
                orders
                  .filter(o => statusFilter === 'TOUS' || o.status === statusFilter)
                  .map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-gray-900 dark:text-white">PO-00{order.id}</span>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                    </td>
                    <td className="px-8 py-6 max-w-xs">
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">{order.description}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase">Par {order.author_name}</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-xs font-black text-gray-900 dark:text-white">{order.items_count} produits</span>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mt-1 tracking-wider">{order.total_estimated} $ Est.</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenDetail(order.id)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all font-bold text-xs"
                          title="Voir / Modifier"
                        >
                          👁️
                        </button>
                        
                        {order.status === 'BROUILLON' && user.role === 'RESPONSABLE' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'VALIDEE')}
                            className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-all font-bold text-xs"
                            title="Valider la commande"
                          >
                            ✔️
                          </button>
                        )}

                        {order.status === 'VALIDEE' && user.role === 'RESPONSABLE' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'RECUE')}
                            className="p-2 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 transition-all font-bold text-xs"
                            title="Marquer comme reçue"
                          >
                            📥
                          </button>
                        )}

                        {(order.status === 'BROUILLON') && (
                          <button
                            onClick={() => confirmDelete(order)}
                            className="p-2 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-100 transition-all font-bold text-xs"
                            title="Supprimer"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <PurchaseOrderModal
          initialData={selectedOrder}
          onClose={() => { setIsModalOpen(false); setSelectedOrder(null); }}
          onSuccess={() => { setIsModalOpen(false); setSelectedOrder(null); fetchOrders(); }}
        />
      )}

      {isConfirmOpen && (
        <ConfirmModal
          open={isConfirmOpen}
          title="Supprimer la commande"
          message={`Êtes-vous sûr de vouloir supprimer la commande PO-00${orderToDelete?.id} ?`}
          confirmLabel="Supprimer"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
        />
      )}

      {autoGenConfirmOpen && (
        <ConfirmModal
          open={autoGenConfirmOpen}
          title="Génération Automatique"
          message="Voulez-vous générer un bon de commande brouillon pour tous les produits en dessous de leur seuil minimal ?"
          confirmLabel="Générer"
          onCancel={() => setAutoGenConfirmOpen(false)}
          onConfirm={handleAutoGenerate}
        />
      )}
    </div>
  );
};

const StatMiniCard = ({ label, count, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
        green: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 border-green-100 dark:border-green-500/20',
        gray: 'bg-gray-50 text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-gray-100 dark:border-gray-700'
    };
    return (
        <div className={`p-6 rounded-2xl border ${colors[color] || colors.gray} flex justify-between items-center bg-white dark:bg-gray-800 shadow-sm shadow-gray-100/50 dark:shadow-none`}>
            <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            <span className="text-2xl font-black">{count}</span>
        </div>
    );
};

export default PurchaseOrdersPage;
