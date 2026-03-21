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
      <div className="fixed bottom-6 right-6 z-[100] space-y-3 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto px-5 py-3.5 rounded-2xl shadow-2xl border backdrop-blur-xl text-sm font-bold flex items-center gap-3 animate-slideIn min-w-[280px] max-w-[420px] ${
              t.type === 'success' ? 'bg-emerald-50/95 text-emerald-800 border-emerald-200' :
              t.type === 'error' ? 'bg-rose-50/95 text-rose-800 border-rose-200' :
              'bg-blue-50/95 text-blue-800 border-blue-200'
            }`}
          >
            <span className="text-lg flex-shrink-0">
              {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="flex-1">{t.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
              className="opacity-50 hover:opacity-100 text-lg flex-shrink-0"
            >×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
