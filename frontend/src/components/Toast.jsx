import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border backdrop-blur-3xl text-sm font-black flex items-center gap-4 animate-in slide-in-from-right-full fade-in duration-500 min-w-[320px] max-w-[480px] group transition-all hover:scale-[1.02] ${
              t.type === 'success' ? 'bg-white/90 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800' :
              t.type === 'error' ? 'bg-white/90 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 border-rose-100 dark:border-rose-800' :
              'bg-white/90 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100 border-blue-100 dark:border-blue-800'
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm ${
              t.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300' :
              t.type === 'error' ? 'bg-rose-100 dark:bg-rose-800 text-rose-600 dark:text-rose-300' :
              'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
            }`}>
              {t.type === 'success' ? '✨' : t.type === 'error' ? '🚫' : '💡'}
            </div>
            <span className="flex-1 leading-tight tracking-tight uppercase text-[11px]">{t.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-gray-400 dark:text-gray-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
