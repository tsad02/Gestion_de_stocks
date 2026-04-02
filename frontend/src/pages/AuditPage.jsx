import React, { useState, useEffect } from 'react';
import auditAPI from '../services/auditAPI';
import { useToast } from '../components/Toast';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await auditAPI.getAuditLogs();
      setLogs(data.logs || []);
    } catch (err) {
      error(`Erreur lors du chargement des logs d'audit`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const renderBadge = (action) => {
    const colors = {
      POST: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
      PUT: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
      DELETE: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
    };
    return (
      <span className={`px-2 py-1 text-[10px] font-black rounded-md ${colors[action] || 'bg-gray-100'}`}>
        {action === 'POST' ? 'CRÉATION' : action === 'PUT' ? 'MODIFICATION' : action === 'DELETE' ? 'SUPPRESSION' : action}
      </span>
    );
  };

  if (loading) return <div className="p-8"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/4 mb-6"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Traçabilité</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Journal complet des actions des utilisateurs sur le système.</p>
        </div>
        <button onClick={fetchLogs} className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all">
          🔄 Actualiser
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">Date</th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">Utilisateur</th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">Action</th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">Entité</th>
                <th className="p-4 font-bold border-b border-gray-100 dark:border-gray-800">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {logs.length > 0 ? logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="p-4 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">
                        {log.user_name ? log.user_name.charAt(0) : 'S'}
                      </div>
                      <span className="text-sm font-bold dark:text-white">{log.user_name || 'Système'}</span>
                    </div>
                  </td>
                  <td className="p-4">{renderBadge(log.action)}</td>
                  <td className="p-4">
                    <span className="font-mono text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {log.entity} {log.entity_id ? `#${log.entity_id}` : ''}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="max-w-xs truncate" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details?.body || log.details?.query || '-')}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400 dark:text-gray-500">Aucun journal trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
