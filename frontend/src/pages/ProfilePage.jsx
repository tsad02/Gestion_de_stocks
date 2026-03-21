import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../components/Toast';

const ProfilePage = ({ user, onUpdate }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'password'
  
  // Info Form
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  // Password Form
  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put('/api/auth/me', 
        { full_name: form.full_name, phone: form.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdate && onUpdate(updatedUser);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    try {
      setPwdLoading(true);
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/me', 
        { 
          current_password: pwdForm.current_password,
          new_password: pwdForm.new_password 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Mot de passe modifié avec succès');
      setPwdForm({ current_password: '', new_password: '', confirm_password: '' });
      setActiveTab('info');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setPwdLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Mon Profil</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Gérez vos informations personnelles et votre sécurité.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column - User Card */}
        <div className="w-full md:w-1/3 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-amber-400 to-amber-600 opacity-20 dark:opacity-40"></div>
            <div className="relative w-24 h-24 mx-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-3xl flex items-center justify-center text-4xl font-black shadow-xl mb-4">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white relative z-10">{user.full_name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-4 relative z-10">{user.email}</p>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-lg text-xs font-black uppercase tracking-wider relative z-10">
              {user.role}
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button 
              onClick={() => setActiveTab('info')}
              className={`w-full px-6 py-4 text-left font-bold transition-colors ${activeTab === 'info' ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border-l-4 border-amber-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
            >
              👤 Informations
            </button>
            <button 
              onClick={() => setActiveTab('password')}
              className={`w-full px-6 py-4 text-left font-bold transition-colors border-t border-gray-100 dark:border-gray-700 ${activeTab === 'password' ? 'bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white border-l-4 border-amber-500' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
            >
              🔒 Sécurité
            </button>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="w-full md:w-2/3">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            {activeTab === 'info' ? (
              <div className="p-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Informations Personnelles</h3>
                <form onSubmit={handleUpdateInfo} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nom Complet</label>
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email (Lecture seule)</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 font-medium cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="ex: 514-555-0199"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50"
                    >
                      {loading ? '⏳...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Changer de Mot de Passe</h3>
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mot de passe actuel</label>
                    <input
                      type="password"
                      required
                      value={pwdForm.current_password}
                      onChange={(e) => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    />
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nouveau mot de passe</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={pwdForm.new_password}
                      onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={pwdForm.confirm_password}
                      onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                    />
                  </div>
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={pwdLoading}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                    >
                      {pwdLoading ? '⏳...' : 'Mettre à jour le mot de passe'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
