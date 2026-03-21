import React, { useState, useEffect } from 'react';
import { createUser, getAllUsers } from '../services/userAPI';

const UserManagement = () => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYE',
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getAllUsers();
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.full_name || !formData.password || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Tous les champs obligatoires sont requis' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setMessage({ type: 'error', text: "L'email n'est pas valide" });
      return false;
    }
    if (formData.full_name.length < 3) {
      setMessage({ type: 'error', text: 'Le nom complet doit contenir au moins 3 caractères' });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères' });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createUser(
        formData.email,
        formData.password,
        formData.full_name,
        formData.role,
        formData.phone
      );

      setMessage({
        type: 'success',
        text: `✅ Utilisateur "${formData.full_name}" créé avec succès`,
      });

      setFormData({ email: '', full_name: '', phone: '', password: '', confirmPassword: '', role: 'EMPLOYE' });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (error) {
      const errorMsg = error.error || error.message || "Erreur lors de la création";
      setMessage({ type: 'error', text: `❌ ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Utilisateurs</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Créez et gérez les comptes du personnel.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Form */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <span className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">👤</span>
                Créer un nouvel utilisateur
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${
                  message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                  {message.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nom complet *</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange}
                    placeholder="ex: Jean Dupont"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    placeholder="ex: jean@timhortons.ca"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    disabled={loading} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    placeholder="ex: 514-555-0123"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    disabled={loading} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Rôle *</label>
                  <select name="role" value={formData.role} onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    disabled={loading}>
                    <option value="EMPLOYE">👥 Employé</option>
                    <option value="RESPONSABLE">👑 Responsable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mot de passe *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    disabled={loading} />
                  <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirmer *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    disabled={loading} />
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 shadow-lg text-sm">
                {loading ? '⏳ Création en cours...' : '✅ Créer l\'utilisateur'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Panels */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span>ℹ️</span> Types de rôles
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-bold text-gray-800 dark:text-gray-200">👥 Employé</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Consulter le stock, enregistrer des mouvements</p>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
                <p className="font-bold text-gray-800 dark:text-gray-200">👑 Responsable</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tout accès + gestion utilisateurs et produits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">👥</span>
            Utilisateurs existants
          </h2>
          <span className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full text-xs font-bold text-gray-600 dark:text-gray-400 shadow-sm">
            {users.length} utilisateur{users.length > 1 ? 's' : ''}
          </span>
        </div>

        {loadingUsers ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Chargement...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">Aucun utilisateur trouvé</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                  <th className="px-8 py-4">Nom</th>
                  <th className="px-8 py-4">Email</th>
                  <th className="px-8 py-4">Téléphone</th>
                  <th className="px-8 py-4">Rôle</th>
                  <th className="px-8 py-4">Inscrit le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-900 dark:bg-gray-700 text-white flex items-center justify-center font-bold text-xs shadow">
                          {u.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-600 dark:text-gray-300">{u.email}</td>
                    <td className="px-8 py-4 text-sm text-gray-500 dark:text-gray-400">{u.phone || '-'}</td>
                    <td className="px-8 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border ${
                        u.role === 'RESPONSABLE' 
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' 
                          : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {u.role === 'RESPONSABLE' ? '👑 Responsable' : '👥 Employé'}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-xs text-gray-500 dark:text-gray-400 font-medium">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
