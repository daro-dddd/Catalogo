import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { Edit2, Trash2, ZoomIn, Copy, Check, Info, Layers, CopyPlus, Tag } from 'lucide-react';

export default function ProductCard({ product }) {
  const { masterPricesMap, openEditProductModal, deleteProduct, duplicateProduct, setLightboxImage } = useCatalog();
  const [copied, setCopied] = useState(false);

  const formatPrice = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '$ --.--';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`${product.catalogCode} - ${product.title}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prices list from Master Price List
  const prices = product.variants
    .map(v => masterPricesMap[v.sku]?.price)
    .filter(p => p !== undefined && p !== null);
  
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return (
    <div className="group relative bg-white dark:bg-[#0f172a] border-2 border-blue-100 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-xl hover:border-blue-400 dark:hover:border-blue-500/50 transition-all duration-200 flex flex-col h-full overflow-hidden">
      
      {/* Encapsulated Header Box with Soft Pastel Blue in Light Mode, Deep Blue-Dark in Dark Mode */}
      <div className="p-3 pb-2.5 bg-blue-50/70 dark:bg-[#090e17] border-b border-blue-100 dark:border-slate-800 space-y-2">
        
        {/* Row 1: Code Badge + Category on Left (Pointer Scrollable), Complete 4-Icon Action Bar on Right */}
        <div className="flex items-center justify-between gap-2">
          {/* Left Container: Pointer Scrollable Horizontally without Clipping */}
          <div className="flex items-center space-x-1.5 min-w-0 flex-1 overflow-x-auto scrollbar-none py-0.5">
            {/* Soft Pastel Blue Catalog Code Badge */}
            <span 
              title={product.catalogCode}
              className="inline-flex items-center px-2.5 py-1 rounded-lg font-black text-xs tracking-tight bg-blue-600 text-white shadow-2xs whitespace-nowrap flex-shrink-0 cursor-pointer transition hover:bg-blue-700"
            >
              <Tag className="w-3 h-3 mr-1 opacity-80" />
              {product.catalogCode}
            </span>

            {/* Category Tag (Click to edit) */}
            <span 
              onClick={() => openEditProductModal(product)}
              title="Clic para editar categoría del producto"
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 uppercase tracking-wide whitespace-nowrap border border-blue-200 dark:border-blue-800 flex-shrink-0 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900 transition"
            >
              {product.category}
            </span>
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-0.5 bg-white dark:bg-[#0f172a] p-1 rounded-xl border border-blue-100 dark:border-slate-800 shadow-2xs flex-shrink-0">
            <button
              onClick={handleCopyCode}
              title="Copiar código al portapapeles"
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            
            <button
              onClick={() => duplicateProduct(product.id)}
              title="Duplicar Instancia Autónoma"
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition flex-shrink-0"
            >
              <CopyPlus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => openEditProductModal(product)}
              title="Editar Ficha de la Caja"
              className="p-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition flex-shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => deleteProduct(product.id)}
              title="Eliminar Instancia"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition flex-shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Row 2: Full Product Title with pointer scroll capability if long */}
        <h3 
          title={product.title}
          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:line-clamp-none overflow-x-auto scrollbar-none leading-snug pt-0.5 cursor-pointer"
        >
          {product.title}
        </h3>

      </div>

      {/* Central Dedicated Photo Box Frame (Light pastel blue in light mode, dark in dark mode) */}
      <div className="p-3">
        <div className="relative aspect-square w-full rounded-xl bg-blue-50/40 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 overflow-hidden shadow-inner flex items-center justify-center group/img">
          
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-contain p-3 transition-transform duration-300 group-hover/img:scale-105"
            loading="lazy"
          />

          {/* Zoom Lightbox Trigger Button */}
          <button
            onClick={() => setLightboxImage({ url: product.imageUrl, title: `${product.catalogCode} - ${product.title}` })}
            className="absolute right-2 bottom-2 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white opacity-0 group-hover/img:opacity-100 transition shadow-md"
            title="Ampliar diagrama técnico"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Technical Material Badge */}
          {product.material && (
            <span className="absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {product.material.split(' ')[0]}
            </span>
          )}
        </div>
      </div>

      {/* Norm & Spec Strip */}
      {product.normStandard && (
        <div className="px-3.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center space-x-1.5 bg-blue-50/50 dark:bg-[#090e17] border-y border-blue-100 dark:border-slate-800">
          <Info className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <span className="truncate">{product.normStandard}</span>
        </div>
      )}

      {/* Lower Sub-Box: Compact Measures Table & Dynamic Master Prices */}
      <div className="p-3 flex-grow flex flex-col justify-start">
        <div className="bg-blue-50/40 dark:bg-[#080d1a] p-2.5 rounded-xl border border-blue-100 dark:border-slate-800 flex-grow flex flex-col justify-between space-y-2">
          
          {/* TEMPLATE A: Conexiones (Tabla de medidas compacta en 1 o 2 columnas) */}
          {product.templateType === 'template-a' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pb-1 border-b border-blue-100 dark:border-slate-800">
                <span>Medida / Variante</span>
                <span>Precio Lista</span>
              </div>
              
              <div className={`grid ${product.variants.length > 5 ? 'grid-cols-2 gap-x-3 gap-y-1' : 'grid-cols-1 gap-1'} max-h-48 overflow-y-auto pr-1`}>
                {product.variants.map((v, idx) => {
                  const masterItem = masterPricesMap[v.sku];
                  const displayPrice = masterItem ? masterItem.price : null;
                  const isUnlinked = !masterItem;

                  return (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1 px-1.5 rounded-lg hover:bg-blue-100/60 dark:hover:bg-blue-950/40 transition text-xs border-b border-dashed border-blue-100 dark:border-slate-800 last:border-0"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-1" title={v.label}>
                        {v.label}
                      </span>
                      <span className={`font-mono font-bold whitespace-nowrap ${isUnlinked ? 'text-blue-600 dark:text-blue-400 italic text-[11px]' : 'text-slate-900 dark:text-white'}`}>
                        {isUnlinked ? 'Sin SKU' : formatPrice(displayPrice)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEMPLATE B: Equipos / Calentadores */}
          {product.templateType === 'template-b' && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1 pb-1 border-b border-blue-100 dark:border-slate-800">
                Servicios y Capacidad
              </div>

              <div className="space-y-1.5">
                {product.variants.map((v, idx) => {
                  const masterItem = masterPricesMap[v.sku];
                  const displayPrice = masterItem ? masterItem.price : null;

                  return (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-white dark:bg-[#0f172a] border border-blue-100 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white">
                          {v.label}
                        </div>
                        {v.capacity && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {v.capacity}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                          {formatPrice(displayPrice)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEMPLATE C: Medida Única / Genérica */}
          {product.templateType === 'template-c' && (
            <div className="space-y-2">
              {product.variants.map((v, idx) => {
                const masterItem = masterPricesMap[v.sku];
                const displayPrice = masterItem ? masterItem.price : null;

                return (
                  <div key={idx} className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-center">
                    <span className="text-[10px] font-extrabold uppercase text-blue-800 dark:text-blue-300 block mb-1">
                      {v.label || 'Presentación Única'}
                    </span>
                    <span className="text-xl font-mono font-black text-slate-900 dark:text-white">
                      {formatPrice(displayPrice)}
                    </span>
                  </div>
                );
              })}

              {product.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3 pt-1">
                  "{product.description}"
                </p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Card Footer Box */}
      <div className="px-3.5 py-2 bg-blue-50/60 dark:bg-[#090e17] border-t border-blue-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-1 font-medium">
          <Layers className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          <span>{product.variants.length} {product.variants.length === 1 ? 'medida' : 'medidas'}</span>
        </div>

        <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
          {prices.length > 1 ? (
            <span>{formatPrice(minPrice)} - {formatPrice(maxPrice)}</span>
          ) : (
            <span>{formatPrice(minPrice)}</span>
          )}
        </div>
      </div>

    </div>
  );
}

