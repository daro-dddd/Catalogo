import React, { useState, useEffect, useMemo } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { 
  X, 
  Upload, 
  Plus, 
  Trash2, 
  Image, 
  Layers, 
  Link2, 
  LayoutTemplate, 
  Info, 
  HelpCircle,
  Wand2,
  Check
} from 'lucide-react';

export default function ProductModal() {
  const { 
    isProductModalOpen, 
    setIsProductModalOpen, 
    editingProduct, 
    saveProduct,
    masterPrices,
    masterPricesMap,
    addMasterPriceRow,
    updateMasterPriceValue,
    updateMasterPriceRow,
    categories,
    showToast 
  } = useCatalog();

  const [formData, setFormData] = useState({
    catalogCode: '',
    title: '',
    category: 'Conexiones de Cobre',
    templateType: 'template-a',
    imageUrl: '',
    normStandard: '',
    material: '',
    description: '',
    variants: []
  });

  const [imagePreview, setImagePreview] = useState('');
  const [showHelpGuide, setShowHelpGuide] = useState(true);

  // Populate form when editing or resetting for create
  useEffect(() => {
    if (editingProduct) {
      const populatedVariants = (editingProduct.variants || []).map(v => {
        const masterItem = masterPricesMap[v.sku];
        return {
          ...v,
          price: v.price !== undefined && v.price !== null ? v.price : (masterItem ? masterItem.price : ''),
          book: v.book || v.category || (masterItem ? masterItem.category : editingProduct.category || 'Conexiones de Cobre')
        };
      });

      setFormData({
        catalogCode: editingProduct.catalogCode || '',
        title: editingProduct.title || '',
        category: editingProduct.category || 'Conexiones de Cobre',
        templateType: editingProduct.templateType || 'template-a',
        imageUrl: editingProduct.imageUrl || '',
        normStandard: editingProduct.normStandard || '',
        material: editingProduct.material || '',
        description: editingProduct.description || '',
        variants: populatedVariants
      });
      setImagePreview(editingProduct.imageUrl || '');
    } else {
      setFormData({
        catalogCode: 'CATÁLOGO ',
        title: '',
        category: 'Conexiones de Cobre',
        templateType: 'template-a',
        imageUrl: '',
        normStandard: 'Norma SAE / ASTM / NOM',
        material: 'Latón Extruido / Cobre / PVC',
        description: '',
        variants: [
          { label: '13 mm', price: 17.50, book: 'Conexiones de Cobre', sku: '' },
          { label: '19 mm', price: 28.00, book: 'Conexiones de Cobre', sku: '' }
        ]
      });
      setImagePreview('');
    }
  }, [editingProduct, isProductModalOpen, masterPricesMap]);

  // Group Master Prices by Category / Libro cleanly (without cluttered measures or prices in labels)
  const pricesByCategory = useMemo(() => {
    const map = {};
    masterPrices.forEach(mp => {
      const cat = mp.category || 'Conexiones de Cobre';
      if (!map[cat]) map[cat] = [];
      map[cat].push(mp);
    });
    return map;
  }, [masterPrices]);

  // Compute Suggested SKUs for the current product to show at top of dropdown
  const { suggestedMasterPrices, otherMasterPrices } = useMemo(() => {
    if (!formData.catalogCode && !formData.category) {
      return { suggestedMasterPrices: [], otherMasterPrices: masterPrices };
    }

    const cleanCode = (formData.catalogCode || '').replace(/catá?logo\s*/i, '').trim().toLowerCase();
    const cleanCategory = (formData.category || '').trim().toLowerCase();

    const suggested = [];
    const others = [];

    masterPrices.forEach(mp => {
      const mpCode = (mp.code || '').trim().toLowerCase();
      const mpCategory = (mp.category || '').trim().toLowerCase();
      const mpName = (mp.name || '').trim().toLowerCase();

      const isMatch = (cleanCode && (mpCode.includes(cleanCode) || cleanCode.includes(mpCode))) ||
                      (cleanCategory && mpCategory.includes(cleanCategory)) ||
                      (formData.title && mpName.includes(formData.title.toLowerCase()));

      if (isMatch) {
        suggested.push(mp);
      } else {
        others.push(mp);
      }
    });

    return { suggestedMasterPrices: suggested, otherMasterPrices: others };
  }, [masterPrices, formData.catalogCode, formData.category, formData.title]);

  if (!isProductModalOpen) return null;

  // Handle Template Type Change with smart variant presets
  const handleTemplateTypeChange = (newTemplate) => {
    let updatedVariants = [...formData.variants];
    let updatedDescription = formData.description;

    if (newTemplate === 'template-b' && updatedVariants.length === 0) {
      updatedVariants = [
        { label: '1 Servicio', capacity: '38 Lts / Min', sku: '' },
        { label: '2 Servicios', capacity: '75 Lts / Min', sku: '' }
      ];
    } else if (newTemplate === 'template-c') {
      if (updatedVariants.length === 0) {
        updatedVariants = [{ label: 'Medida Única / Presentación Fija', sku: '' }];
      }
      if (!updatedDescription) {
        updatedDescription = 'Válvula de bola con sellos de PTFE para corte rápido en redes hidráulicas.';
      }
    }

    setFormData(prev => ({
      ...prev,
      templateType: newTemplate,
      variants: updatedVariants,
      description: updatedDescription
    }));
  };

  // Smart Auto-Link & Auto-Create SKUs for New Users
  const handleAutoLinkPrices = () => {
    let linkedCount = 0;
    let createdCount = 0;

    const cleanCode = (formData.catalogCode || 'GEN').replace(/catá?logo\s*/i, '').trim();

    const updatedVariants = formData.variants.map((v) => {
      if (v.sku) return v; // already linked

      const labelClean = (v.label || '').trim().toLowerCase();
      const codeClean = cleanCode.toLowerCase();

      // 1. Try to find existing master price with matching code and variant label
      const foundExisting = masterPrices.find((mp) => {
        const mpCode = (mp.code || '').trim().toLowerCase();
        const mpVar = (mp.variant || '').trim().toLowerCase();

        const codeMatches = mpCode.includes(codeClean) || codeClean.includes(mpCode);
        const varMatches = mpVar.includes(labelClean) || labelClean.includes(mpVar);

        return (codeMatches && varMatches) || mpVar === labelClean;
      });

      if (foundExisting) {
        linkedCount++;
        return { ...v, sku: foundExisting.sku };
      } else {
        // 2. Auto-create a brand new SKU in Master Price List so user doesn't have to do it manually
        const cleanSkuTag = `${cleanCode}-${v.label || 'VAR'}`.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
        const generatedSku = `SKU-${cleanSkuTag}`;
        
        const newMasterRow = {
          sku: generatedSku,
          code: cleanCode || 'CAT-GEN',
          name: formData.title || 'Producto Genérico',
          variant: v.label || 'Medida Estándar',
          price: 15.00, // base default price
          unit: 'pz',
          category: formData.category || 'General'
        };

        addMasterPriceRow(newMasterRow);
        createdCount++;
        return { ...v, sku: generatedSku };
      }
    });

    setFormData(prev => ({ ...prev, variants: updatedVariants }));

    if (createdCount > 0 || linkedCount > 0) {
      showToast(`Asociación completada: ${linkedCount} SKUs vinculados y ${createdCount} nuevos creados en Lista Maestra.`, 'success');
    } else {
      showToast('Todas las medidas ya están correctamente asociadas.', 'info');
    }
  };

  // Local File Photo Upload -> Convert to Base64
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setImagePreview(url);
  };

  // Add Variant Row
  const handleAddVariantRow = () => {
    const defaultLabel = formData.templateType === 'template-b' 
      ? `${formData.variants.length + 1} Servicios`
      : '';
    const defaultCapacity = formData.templateType === 'template-b' 
      ? '50 Lts / Min' 
      : '';

    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          label: defaultLabel,
          capacity: defaultCapacity,
          price: 15.00,
          book: formData.category || 'Conexiones de Cobre',
          sku: ''
        }
      ]
    }));
  };

  // Update Variant Row
  const handleUpdateVariantRow = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: updated }));
  };

  // Remove Variant Row
  const handleRemoveVariantRow = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.catalogCode.trim() || !formData.title.trim()) {
      showToast('Por favor completa el código de catálogo y título de la ficha.', 'warning');
      return;
    }
    saveProduct(formData);
    showToast('Ficha técnica guardada con éxito', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-blue-100 dark:border-slate-800 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-blue-100 dark:border-slate-800 flex items-center justify-between bg-blue-50/70 dark:bg-[#080d1a]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editingProduct ? 'Editar Ficha Técnica de Producto' : 'Agregar Nueva Ficha Técnica al Catálogo'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Panel técnico para administrar cajas de productos y sincronización con la Lista Maestra de Precios.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProductModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formal Quick Help Banner */}
        {showHelpGuide && (
          <div className="bg-blue-100 dark:bg-blue-950/90 text-blue-900 dark:text-blue-200 px-4 py-2.5 flex items-center justify-between text-xs border-b border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span>
                <strong>Guía de Uso:</strong> Ingrese los datos del producto y presione el botón <strong>"Auto-Vincular Precios"</strong> para asociar automáticamente las claves con la Lista Maestra.
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setShowHelpGuide(false)}
              className="text-blue-700 dark:text-blue-300 hover:text-blue-900 text-xs font-bold pl-2"
            >
              Cerrar ×
            </button>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs flex-grow">
          
          {/* Row 1: Catalog Code, Category & Template Type Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Código de Catálogo: *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. CATÁLOGO 20-F"
                value={formData.catalogCode}
                onChange={(e) => setFormData({ ...formData, catalogCode: e.target.value })}
                className="w-full p-2.5 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl font-black text-blue-700 dark:text-blue-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Categoría / Tipo de Material:
              </label>
              <input
                type="text"
                list="category-suggestions"
                placeholder="Escribe o selecciona categoría..."
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="category-suggestions">
                {categories.filter(c => c !== 'Todas las Categorías').map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Plantilla Visual de la Caja: *
              </label>
              <select
                value={formData.templateType}
                onChange={(e) => handleTemplateTypeChange(e.target.value)}
                className="w-full p-2.5 bg-white dark:bg-[#080d1a] border-2 border-blue-500 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="template-a">Plantilla A: Conexiones (Tabla Medidas Compactas)</option>
                <option value="template-b">Plantilla B: Equipos (Por Servicio / Capacidad Lts)</option>
                <option value="template-c">Plantilla C: Medida Única / Genérica + Notas</option>
              </select>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre de Ficha / Descripción Técnica Corta: *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Cople con ranura cobre a cobre o Calentador de Depósito Gas"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-2.5 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description textarea specifically featured for Template C or detailed notes */}
            {formData.templateType === 'template-c' && (
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción Detallada / Notas Técnicas de la Presentación:
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej. Válvula de bola paso total con palanca de acero inscripta y sellos de PTFE puro para agua y gas."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Specs: Norm & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Norma / Estándar Técnico:
              </label>
              <input
                type="text"
                placeholder="Ej. Norma NMX-W-018 / ASTM B-88"
                value={formData.normStandard}
                onChange={(e) => setFormData({ ...formData, normStandard: e.target.value })}
                className="w-full p-2.5 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Material / Aleación:
              </label>
              <input
                type="text"
                placeholder="Ej. Cobre C12200 / Latón C36000 / CPVC"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                className="w-full p-2.5 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Product Image Section */}
          <div className="p-3 bg-blue-50/40 dark:bg-[#080d1a] rounded-xl border border-blue-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                <Image className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Fotografía / Diagrama Técnico del Producto</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* Image Box Preview */}
              <div className="aspect-square w-full rounded-xl bg-white dark:bg-[#0f172a] border border-blue-100 dark:border-slate-800 flex items-center justify-center p-2 overflow-hidden relative shadow-inner">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-center text-slate-400 text-[10px]">
                    <Image className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <span>Sin imagen cargada</span>
                  </div>
                )}
              </div>

              {/* Upload & URL Controls */}
              <div className="sm:col-span-2 space-y-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Opción A: Subir imagen desde la computadora (JPG/PNG)
                  </label>
                  <label className="flex items-center justify-center space-x-2 p-2.5 border border-dashed border-blue-400 hover:border-blue-600 rounded-xl cursor-pointer bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 transition">
                    <Upload className="w-4 h-4" />
                    <span className="font-bold">Seleccionar archivo local</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Opción B: Pegar enlace URL de imagen web
                  </label>
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/foto.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    className="w-full p-2 bg-white dark:bg-[#0f172a] border border-blue-100 dark:border-slate-800 rounded-lg text-xs"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Dynamic Variant Rows with AUTO-LINK & SMART GROUPING */}
          <div className="space-y-3 pt-3 border-t border-blue-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center space-x-1.5 text-xs">
                  <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>
                    {formData.templateType === 'template-a' && 'Medidas & Precios (Plantilla A)'}
                    {formData.templateType === 'template-b' && 'Servicios / Capacidad & Precios (Plantilla B)'}
                    {formData.templateType === 'template-c' && 'Presentación Única & Precio (Plantilla C)'}
                  </span>
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Usa "Auto-Vincular Precios" para que el sistema asocie los SKUs de la Lista Maestra automáticamente.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* AUTO-LINK & AUTO-CREATE SKUs BUTTON */}
                <button
                  type="button"
                  onClick={handleAutoLinkPrices}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition transform active:scale-95"
                  title="Auto-vincular SKUs existentes o auto-crear los precios que falten"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Vincular Precios</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddVariantRow}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {formData.templateType === 'template-b' ? 'Agregar Servicio' : 'Agregar Medida'}
                  </span>
                </button>
              </div>
            </div>

            {/* List of Variant Rows with Direct Price Input & Book Association */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {formData.variants.map((v, index) => {
                const masterItem = masterPricesMap[v.sku];
                const displayPrice = v.price !== undefined && v.price !== null && v.price !== '' 
                  ? v.price 
                  : (masterItem ? masterItem.price : '');
                const displayBook = v.book || v.category || (masterItem ? masterItem.category : formData.category || 'Conexiones de Cobre');

                return (
                  <div 
                    key={index}
                    className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 p-2.5 bg-blue-50/60 dark:bg-[#080d1a] rounded-xl border border-blue-100 dark:border-slate-800 shadow-2xs"
                  >
                    {/* 1. Medida / Variante Label */}
                    <div className="w-full xl:w-1/4">
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                        {formData.templateType === 'template-b' ? 'Servicio / Nombre' : 'Medida / Variante'}
                      </label>
                      <input
                        type="text"
                        placeholder={formData.templateType === 'template-b' ? 'Ej. 1 Servicio' : 'Ej. 13 mm'}
                        value={v.label || ''}
                        onChange={(e) => handleUpdateVariantRow(index, 'label', e.target.value)}
                        className="w-full p-1.5 bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-slate-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    {/* Capacity Input for Template B */}
                    {formData.templateType === 'template-b' && (
                      <div className="w-full xl:w-1/5">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                          Capacidad (Lts)
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. 38 Lts / Min"
                          value={v.capacity || ''}
                          onChange={(e) => handleUpdateVariantRow(index, 'capacity', e.target.value)}
                          className="w-full p-1.5 bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-slate-700 rounded-lg font-medium text-xs text-slate-900 dark:text-white"
                        />
                      </div>
                    )}

                    {/* 2. Direct Price Input ($) */}
                    <div className="w-full xl:w-1/5">
                      <label className="block text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-0.5 flex justify-between">
                        <span>Precio Producto ($)</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-2 text-blue-600 dark:text-blue-400 font-bold text-xs">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={displayPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateVariantRow(index, 'price', val);
                            if (v.sku) {
                              updateMasterPriceValue(v.sku, val);
                            }
                          }}
                          className="w-full pl-5 pr-1.5 py-1.5 bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-slate-700 rounded-lg font-mono font-bold text-xs text-blue-700 dark:text-blue-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* 3. Libro / Categoría Select & Custom Input */}
                    <div className="w-full xl:w-1/4">
                      <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                        ¿A qué Libro se asocia?
                      </label>
                      <input
                        type="text"
                        list={`book-suggestions-${index}`}
                        placeholder="Escribe o elige Libro..."
                        value={displayBook}
                        onChange={(e) => {
                          const selectedBook = e.target.value;
                          handleUpdateVariantRow(index, 'book', selectedBook);
                          if (v.sku) {
                            updateMasterPriceRow(v.sku, { category: selectedBook });
                          }
                        }}
                        className="w-full p-1.5 bg-white dark:bg-[#0f172a] border border-blue-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                      <datalist id={`book-suggestions-${index}`}>
                        {categories.filter(c => c !== 'Todas las Categorías').map(cat => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>

                    {/* 4. SKU Lista Maestra Sync Select */}
                    <div className="w-full xl:flex-1">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">
                        Vínculo SKU (Maestra)
                      </label>
                      <select
                        value={v.sku || ''}
                        onChange={(e) => {
                          const selectedSku = e.target.value;
                          const targetMaster = masterPricesMap[selectedSku];
                          if (targetMaster) {
                            handleUpdateVariantRow(index, 'sku', selectedSku);
                            handleUpdateVariantRow(index, 'price', targetMaster.price);
                            handleUpdateVariantRow(index, 'book', targetMaster.category);
                          } else {
                            handleUpdateVariantRow(index, 'sku', '');
                          }
                        }}
                        className="w-full p-1.5 bg-white dark:bg-[#0f172a] border border-blue-100 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        <option value="">-- Sin vínculo o Auto-crear --</option>
                        {Object.entries(pricesByCategory).map(([catName, items]) => (
                          <optgroup key={catName} label={`Libro: ${catName}`}>
                            {items.map(mp => (
                              <option key={mp.sku} value={mp.sku}>
                                [{catName}] {mp.sku} - ${mp.price.toFixed(2)}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Remove Action Button */}
                    <div className="flex items-center justify-end pt-1 xl:pt-4">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantRow(index)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-slate-800 transition"
                        title="Eliminar esta fila"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-3 border-t border-blue-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md transition transform active:scale-95"
            >
              {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
