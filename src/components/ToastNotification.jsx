import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastNotification({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'success' } = toast;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full sm:w-auto flex items-center space-x-3 px-4 py-3 bg-slate-900/95 dark:bg-[#0f172a]/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 transition-all animate-bounce-short">
      
      {/* Toast Type Icon */}
      {type === 'success' && (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
      )}

      {type === 'error' && (
        <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
      )}

      {type === 'warning' && (
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
      )}

      {type === 'info' && (
        <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
      )}

      {/* Message Text */}
      <span className="text-xs font-semibold text-slate-100 flex-grow pr-2 leading-snug">
        {message}
      </span>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
      >
        <X className="w-4 h-4" />
      </button>

    </div>
  );
}
