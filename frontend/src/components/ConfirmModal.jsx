import React from 'react';

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, loading = false, danger = true }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">{danger ? '⚠️' : '❓'}</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title || 'Confirmation'}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{message || 'Êtes-vous sûr de vouloir continuer ?'}</p>
        </div>
        <div className="flex gap-3 px-8 pb-8">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3 rounded-xl font-bold transition-all disabled:opacity-50 text-sm shadow-lg ${
              danger
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {loading ? '⏳...' : 'Confirmer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
