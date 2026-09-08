import React from 'react';
import { useShop } from '../context/ShopContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useShop();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 border shadow-xl flex items-center justify-between text-xs font-medium animate-in slide-in-from-bottom-3 duration-200 ${
            t.type === 'success'
              ? 'bg-[#121316] text-white border-neutral-700'
              : t.type === 'error'
              ? 'bg-red-900 text-white border-red-800'
              : 'bg-white text-neutral-900 border-neutral-300'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />}
            <span className="leading-snug">{t.message}</span>
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="ml-3 text-neutral-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
