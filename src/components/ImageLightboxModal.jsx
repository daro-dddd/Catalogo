import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { X, ZoomIn, Download } from 'lucide-react';

export default function ImageLightboxModal() {
  const { lightboxImage, setLightboxImage } = useCatalog();

  if (!lightboxImage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ZoomIn className="w-5 h-5 text-amber-500" />
            <h3 className="font-extrabold text-sm truncate">
              {lightboxImage.title || 'Inspección de Imagen Técnica'}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href={lightboxImage.url}
              download="diagrama_tecnico.png"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Descargar Imagen"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => setLightboxImage(null)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content View with object-contain */}
        <div className="p-6 bg-slate-950 flex-grow flex items-center justify-center min-h-[350px] overflow-hidden">
          <img
            src={lightboxImage.url}
            alt={lightboxImage.title}
            className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-900 text-center text-xs text-slate-400 border-t border-slate-800">
          Ajuste dinámico con proporción conservada (object-contain).
        </div>

      </div>
    </div>
  );
}
