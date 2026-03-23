import React from 'react';

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading = false, danger = true }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <div className="p-10 text-center">
          <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center text-3xl shadow-inner ${
            danger ? 'bg-rose-50 dark:bg-rose-950/30' : 'bg-blue-50 dark:bg-blue-950/30'
          }`}>
            {danger ? '⚠️' : '❓'}
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight leading-none uppercase">{title || 'Attention'}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-bold leading-relaxed">{message || 'Êtes-vous sûr de vouloir continuer ?'}</p>
        </div>
        <div className="flex gap-4 px-10 pb-10">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl font-black text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-xs uppercase tracking-widest"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-4 rounded-2xl font-black transition-all disabled:opacity-50 text-xs uppercase tracking-widest shadow-xl ${
              danger
                ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20'
                : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:scale-105 active:scale-95'
            }`}
          >
            {loading ? '⏳' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
