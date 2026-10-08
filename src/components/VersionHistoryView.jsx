import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { History, Save, Download, RotateCcw, Trash2, Printer, FileText } from 'lucide-react';

export default function VersionHistoryView() {
  const { 
    versions, 
    createVersionSnapshot, 
    restoreVersionSnapshot, 
    deleteVersionSnapshot,
    products,
    masterPrices,
    setActiveTab,
    showToast
  } = useCatalog();

  const [versionName, setVersionName] = useState('');
  const [versionNotes, setVersionNotes] = useState('');

  const handleCreateSnapshot = (e) => {
    e.preventDefault();
    if (!versionName.trim()) {
      showToast('Por favor asigna un nombre a la versión (ej. Versión 2.0 - Nuevos Precios CPVC).', 'warning');
      return;
    }
    createVersionSnapshot(versionName, versionNotes);
    setVersionName('');
    setVersionNotes('');
  };

  const handlePrintVersionPDF = (version) => {
    restoreVersionSnapshot(version.id);
    setActiveTab('print-layout');
  };

  const handleDownloadVersionJSON = (version) => {
    const blob = new Blob([JSON.stringify(version, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${version.versionName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Historial de Versiones & Respaldos en PDF / JSON
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Guarda una copia de seguridad congelada de tu catálogo en cada etapa. Puedes descargar el PDF o restaurar cualquier versión anterior con un clic.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-mono text-xs font-bold border border-blue-200 dark:border-blue-800">
            {versions.length} versión(es) guardada(s)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Create Version Snapshot Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-blue-100 dark:border-slate-800 pb-2">
              <Save className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                Guardar Copia de la Versión Actual
              </h3>
            </div>

            <form onSubmit={handleCreateSnapshot} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Versión: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Versión 2.0 - Lista Cobre, CPVC y Tuboplus"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notas / Observaciones:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej. Se actualizaron precios de conexiones de PVC Ced 40 y se agregaron codos Tuboplus."
                  value={versionNotes}
                  onChange={(e) => setVersionNotes(e.target.value)}
                  className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="p-3 bg-blue-50/50 dark:bg-[#080d1a] rounded-xl border border-blue-100 dark:border-slate-800 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Fichas de productos a congelar:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Precios SKU maestros:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{masterPrices.length}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center space-x-1.5 transition shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Congelar & Guardar Versión</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Version History List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Historial de Copias Registradas</span>
              </h3>
            </div>

            <div className="space-y-3">
              {versions.map((ver) => (
                <div 
                  key={ver.id}
                  className="p-4 rounded-2xl bg-blue-50/40 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-400 dark:hover:border-blue-500/50 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {ver.versionName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                        {new Date(ver.timestamp).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                      "{ver.notes}"
                    </p>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{ver.productsCount} Fichas</span>
                      <span>•</span>
                      <span>{ver.pricesCount} Precios SKU</span>
                    </div>
                  </div>

                  {/* Actions for this version */}
                  <div className="flex items-center space-x-1.5 self-start sm:self-center">
                    <button
                      onClick={() => handlePrintVersionPDF(ver)}
                      title="Generar PDF de esta versión"
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => handleDownloadVersionJSON(ver)}
                      title="Descargar JSON de respaldo"
                      className="p-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-700 border border-blue-100 dark:border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => restoreVersionSnapshot(ver.id)}
                      title="Restaurar esta versión al catálogo activo"
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restaurar</span>
                    </button>

                    {versions.length > 1 && (
                      <button
                        onClick={() => deleteVersionSnapshot(ver.id)}
                        title="Eliminar esta copia del historial"
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-blue-50 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

