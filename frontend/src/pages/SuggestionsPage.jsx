import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token')}`
});

/**
 * Configuration visuelle des niveaux de sévérité.
 */
const SEVERITY_CONFIG = {
  HIGH:   { bg: 'bg-rose-50 dark:bg-rose-950/30',   border: 'border-rose-200 dark:border-rose-900/50',   badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400',   dot: 'bg-rose-500',   label: '🔴 Critique' },
  MEDIUM: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900/50', badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', label: '🟡 Attention' },
  LOW:    { bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-900/50',   badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400',   dot: 'bg-blue-500',   label: '🔵 Info' }
};

/**
 * Mappage des types de suggestions vers des icônes et des libellés.
 */
const TYPE_ICONS = {
  RUPTURE_FREQUENTE:   '⚠️',
  PERTES_ELEVEES:      '🗑️',
  STOCK_SURDIMENSIONNE:'📦',
  REDUIRE_COMMANDE:    '📉',
  RUPTURE_PREVUE:      '📅'
};

const TYPE_LABELS = {
  RUPTURE_FREQUENTE:   'Rupture critique',
  PERTES_ELEVEES:      'Pertes élevées',
  STOCK_SURDIMENSIONNE:'Stock excessif',
  REDUIRE_COMMANDE:    'Réduire commande',
  RUPTURE_PREVUE:      'Rupture prévue'
};

/**
 * Page de suggestions et d'aide à la décision.
 * Présente des recommandations automatiques basées sur l'analyse des stocks.
 */
const SuggestionsPage = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState(''); // Filtre par type de suggestion

  useEffect(() => {
    fetchSuggestions();
  }, []);

  /**
   * Récupère les suggestions générées par le backend.
   */
  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/suggestions`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Erreur');
      const data = await res.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      toast.error('Impossible de charger les suggestions');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage local des suggestions
  const filtered = filterType ? suggestions.filter(s => s.type === filterType) : suggestions;

  // Calcul du nombre de suggestions par niveau de sévérité pour le résumé
  const counts = {
    HIGH: suggestions.filter(s => s.severity === 'HIGH').length,
    MEDIUM: suggestions.filter(s => s.severity === 'MEDIUM').length,
    LOW: suggestions.filter(s => s.severity === 'LOW').length
  };

  const allTypes = [...new Set(suggestions.map(s => s.type))];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Suggestions</h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold mt-1 opacity-80">
            Recommandations intelligentes basées sur vos données de stock.
          </p>
        </div>
        <button
          onClick={fetchSuggestions}
          disabled={loading}
          className="px-5 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-black text-sm shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? '⏳' : '🔄'} Actualiser
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">{counts.HIGH}</p>
          <p className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-500 mt-1">Critiques</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">{counts.MEDIUM}</p>
          <p className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-500 mt-1">Attention</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 text-center">
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{counts.LOW}</p>
          <p className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-500 mt-1">Informations</p>
        </div>
      </div>

      {/* Type Filter */}
      {allTypes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
              !filterType
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400'
            }`}
          >
            Toutes ({suggestions.length})
          </button>
          {allTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-black border-2 transition-all ${
                filterType === t
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-transparent'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-400'
              }`}
            >
              {TYPE_ICONS[t]} {TYPE_LABELS[t] || t} ({suggestions.filter(s => s.type === t).length})
            </button>
          ))}
        </div>
      )}

      {/* Suggestions List */}
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400 text-4xl animate-pulse">💡</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border-2 border-dashed border-emerald-200 dark:border-emerald-900">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">
            {suggestions.length === 0 ? 'Aucune anomalie détectée !' : 'Aucune suggestion dans cette catégorie'}
          </p>
          <p className="text-sm text-emerald-600/70 dark:text-emerald-500/70 mt-2 font-medium">
            {suggestions.length === 0 ? 'Votre stock est bien géré. Continuez ainsi !' : 'Essayez un autre filtre.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s, i) => {
            const cfg = SEVERITY_CONFIG[s.severity];
            return (
              <div key={i} className={`rounded-2xl border p-5 ${cfg.bg} ${cfg.border} transition-all hover:scale-[1.01]`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg ${cfg.badge}`}>
                          {TYPE_ICONS[s.type]} {TYPE_LABELS[s.type] || s.type}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg bg-white/60 dark:bg-gray-900/40 ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        {s.category && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {s.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-relaxed">
                        {s.message}
                      </p>

                      {/* Data detail chips */}
                      {s.data && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {Object.entries(s.data).map(([k, v]) => (
                            <span key={k} className="text-[10px] font-bold bg-white/60 dark:bg-gray-900/40 px-2 py-1 rounded-lg text-gray-600 dark:text-gray-400">
                              {k.replace(/_/g, ' ')}: <strong>{v}</strong>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick action */}
                  {(s.type === 'RUPTURE_FREQUENTE' || s.type === 'RUPTURE_PREVUE') && (
                    <button
                      onClick={() => navigate('/purchase-orders')}
                      className="flex-shrink-0 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl text-xs font-black hover:scale-105 transition-all shadow-md"
                    >
                      📋 Commander
                    </button>
                  )}
                  {s.type === 'PERTES_ELEVEES' && (
                    <button
                      onClick={() => navigate('/movements')}
                      className="flex-shrink-0 px-3 py-2 bg-rose-600 text-white rounded-xl text-xs font-black hover:scale-105 transition-all shadow-md"
                    >
                      🗑️ Voir pertes
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info footer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-600 font-medium">
        💡 Les suggestions sont générées automatiquement à partir des 30 derniers jours de données.
      </div>
    </div>
  );
};

export default SuggestionsPage;
