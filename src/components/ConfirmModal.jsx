import React from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';

export default function ConfirmModal({ config, onClose }) {
  if (!config) return null;

  const { title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger', onConfirm, onCancel } = config;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (onClose) onClose();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 text-slate-900 dark:text-white space-y-4 relative transform transition-all scale-100">
        
        {/* Close Button */}
        <button
          onClick={handleCancel}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Icon */}
        <div className="flex items-center space-x-3">
          {type === 'danger' && (
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
          )}

          {type === 'warning' && (
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}

          {type === 'info' && (
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6" />
            </div>
          )}

          <div>
            <h3 className="font-extrabold text-base leading-snug text-slate-900 dark:text-white">
              {title}
            </h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Confirmación del Catálogo
            </span>
          </div>
        </div>

        {/* Message Body */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-slate-50 dark:bg-[#080d1a] p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
          {message}
        </p>

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className={`px-5 py-2 rounded-xl text-white font-black text-xs shadow-md transition transform active:scale-95 ${
              type === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                : type === 'warning'
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
