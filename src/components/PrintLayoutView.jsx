import React, { useState, useEffect } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { 
  Printer, 
  GripVertical, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Check 
} from 'lucide-react';

export default function PrintLayoutView() {
  const { 
    products, 
    filteredProducts, 
    masterPricesMap, 
    selectedCategory, 
    categories, 
    setSelectedCategory,
    updateProductsOrder 
  } = useCatalog();

  // Local state for items in current view to enable immediate drag-and-drop & button reordering
  const [localOrderedProducts, setLocalOrderedProducts] = useState(filteredProducts);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Header display mode for print layout: 'none' (solo productos), 'title' (solo título corto), 'full' (encabezado completo)
  const [headerMode, setHeaderMode] = useState('none');

  // Sync local ordered products when filteredProducts or category changes
  useEffect(() => {
    setLocalOrderedProducts(filteredProducts);
  }, [filteredProducts, selectedCategory]);

  const handlePrint = () => {
    window.print();
  };

  // Reorder helper: move item from index 'from' to index 'to'
  const moveCard = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= localOrderedProducts.length) return;
    const updated = [...localOrderedProducts];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    setLocalOrderedProducts(updated);
    setIsSaved(false);

    // Synchronize to global products state
    persistReorder(updated);
  };

  // Persist current order to global context and localStorage
  const persistReorder = (newOrderedList) => {
    if (selectedCategory === 'Todas las Categorías') {
      updateProductsOrder(newOrderedList);
    } else {
      // Reorder items belonging to the selected category within the main products array
      const otherCategoryProducts = products.filter(p => p.category !== selectedCategory);
      updateProductsOrder([...newOrderedList, ...otherCategoryProducts]);
    }
  };

  const handleManualSaveOrder = () => {
    persistReorder(localOrderedProducts);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      moveCard(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  const formatPrice = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '-';
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Toolbar (Hidden on print) */}
      <div className="no-print print:hidden bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Maquetador de Impresión & Exportador PDF
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Arrastra las fichas o usa las flechas para <strong>acomodar y guardar el orden de impresión</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Header Mode Selector */}
          <div className="flex items-center space-x-1 bg-blue-50/70 dark:bg-slate-800 p-1 rounded-xl border border-blue-100 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-2 pr-1">Encabezado PDF:</span>
            <select
              value={headerMode}
              onChange={(e) => setHeaderMode(e.target.value)}
              className="px-2.5 py-1 text-xs font-bold bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none"
            >
              <option value="none">Solo Productos (Sin Título)</option>
              <option value="title">Solo Título Corto</option>
              <option value="full">Encabezado Completo</option>
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-blue-50/70 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Save Order Button */}
          <button
            onClick={handleManualSaveOrder}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
              isSaved 
                ? 'bg-emerald-600 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}
            title="Guardar este orden de tarjetas permanentemente"
          >
            {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            <span>{isSaved ? '¡Orden Guardado!' : 'Guardar Orden'}</span>
          </button>

          {/* Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition transform active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="print-page bg-white text-slate-900 p-6 sm:p-10 rounded-xl shadow-lg border border-slate-200 mx-auto max-w-5xl transition-all print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        
        {/* Printable Header: Optional based on headerMode */}
        {headerMode === 'full' && (
          <div className="border-b-4 border-blue-600 pb-4 mb-6">
            <h1 className="font-black text-xl sm:text-2xl tracking-tight text-blue-950 uppercase">
              CATÁLOGO TÉCNICO DE CONEXIONES E INSTALACIONES
            </h1>
            <h2 className="text-xs sm:text-sm font-bold text-blue-700 uppercase tracking-wide mt-1">
              LISTA COMPLETA: {selectedCategory === 'Todas las Categorías' ? 'TODOS LOS MATERIALES Y CONEXIONES' : selectedCategory.toUpperCase()}
            </h2>
          </div>
        )}

        {headerMode === 'title' && (
          <div className="border-b-2 border-blue-600 pb-2 mb-5">
            <h1 className="font-black text-lg sm:text-xl tracking-tight text-blue-950 uppercase">
              {selectedCategory === 'Todas las Categorías' ? 'CATÁLOGO TÉCNICO DE PRODUCTOS' : `CATÁLOGO TÉCNICO - ${selectedCategory.toUpperCase()}`}
            </h1>
          </div>
        )}

        {/* Catalog Items Grid */}
        <div className="print-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {localOrderedProducts.map((product, index) => (
            <div 
              key={product.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              className="group border border-slate-300 hover:border-blue-400 rounded-xl p-3 flex flex-col justify-between bg-slate-50/50 break-inside-avoid shadow-2xs transition relative"
            >
              
              {/* Card Header with Reorder Controls (Hidden on Print) */}
              <div className="no-print print:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-200 bg-blue-50/50 px-2 py-1 rounded-lg">
                <div className="flex items-center space-x-1 text-slate-400 cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Posición #{index + 1}</span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => moveCard(index, index - 1)}
                    disabled={index === 0}
                    className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-500 hover:bg-blue-100 rounded"
                    title="Mover a la izquierda / arriba"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => moveCard(index, index + 1)}
                    disabled={index === localOrderedProducts.length - 1}
                    className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-slate-500 hover:bg-blue-100 rounded"
                    title="Mover a la derecha / abajo"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div>
                {/* Catalog Code */}
                <div className="text-xs font-black text-blue-700 uppercase tracking-tight">
                  {product.catalogCode}
                </div>
                
                {/* Product Title */}
                <div className="text-xs font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                  {product.title}
                </div>

                {/* Photo */}
                <div className="my-2 h-32 w-full bg-white border border-slate-200 rounded-lg overflow-hidden flex items-center justify-center p-2">
                  <img src={product.imageUrl} alt={product.title} className="max-h-full max-w-full object-contain" />
                </div>
              </div>

              {/* Variants & Prices List */}
              <div className="mt-2 text-[11px] pt-2 border-t border-slate-200">
                <div className="font-bold text-[9px] uppercase text-slate-400 mb-1 flex justify-between">
                  <span>Medida / Variante</span>
                  <span>Precio Lista</span>
                </div>
                
                <div className="space-y-0.5">
                  {(product.variants || []).map((v, idx) => {
                    const masterItem = masterPricesMap[v.sku];
                    const price = v.price !== undefined && v.price !== null && v.price !== '' 
                      ? parseFloat(v.price) 
                      : (masterItem ? masterItem.price : null);

                    return (
                      <div key={idx} className="flex justify-between items-center py-0.5 border-b border-dashed border-slate-200 last:border-0">
                        <span className="font-medium text-slate-700">{v.label}</span>
                        <span className="font-mono font-bold text-slate-900">{formatPrice(price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
