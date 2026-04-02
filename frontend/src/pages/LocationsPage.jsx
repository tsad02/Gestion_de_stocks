import React, { useState, useEffect } from 'react';
import locationsAPI from '../services/locationsAPI';
import { useToast } from '../components/Toast';
import ZoneProductsModal from '../components/ZoneProductsModal';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const [zoneProductsModal, setZoneProductsModal] = useState({ open: false, location: null });
  const { success, error } = useToast();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationsAPI.getLocations();
      setLocations(data);
    } catch (err) {
      error('Erreur lors du chargement des localisations');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingId(loc.id);
    setFormData({ name: loc.name, description: loc.description || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette localisation ?")) return;
    try {
      await locationsAPI.deleteLocation(id);
      success('Localisation supprimée');
      fetchLocations();
    } catch (err) {
      error(err.response?.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await locationsAPI.updateLocation(editingId, formData);
        success('Localisation modifiée');
      } else {
        await locationsAPI.createLocation(formData);
        success('Localisation créée');
      }
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      error(err.response?.data?.error || 'Une erreur est survenue');
    }
  };

  if (loading) return <div className="p-8"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-6"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Localisations</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez les zones de stockage de votre établissement.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <span>➕ Nouvelle Zone</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">Nom de la Zone</th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">Description</th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {locations.length > 0 ? locations.map(loc => (
                <tr key={loc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 font-bold text-gray-900 dark:text-white">{loc.name}</td>
                  <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{loc.description || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => setZoneProductsModal({ open: true, location: loc })} className="text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 p-2 rounded-lg transition-colors" title="Gérer les produits">📦</button>
                    <button onClick={() => handleOpenEdit(loc)} className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors" title="Modifier">✏️</button>
                    <button onClick={() => handleDelete(loc.id)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors" title="Supprimer">🗑️</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-400 dark:text-gray-500">Aucune localisation configurée.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">{editingId ? 'Modifier la zone' : 'Nouvelle zone'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nom de la Zone *</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Chambre Froide..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description (Optionnelle)</label>
                <textarea 
                  className="w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows="3"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Détails supplémentaires..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                  {editingId ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {zoneProductsModal.open && zoneProductsModal.location && (
        <ZoneProductsModal
          location={zoneProductsModal.location}
          onClose={() => setZoneProductsModal({ open: false, location: null })}
          onSuccess={() => {
            setZoneProductsModal({ open: false, location: null });
          }}
        />
      )}
    </div>
  );
}
