import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import ExcelJS from 'exceljs';
import { 
  Search, 
  Plus, 
  Trash2, 
  Sliders, 
  DollarSign, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
  Filter,
  Download
} from 'lucide-react';

export default function MasterPriceTable() {
  const { 
    masterPrices, 
    updateMasterPriceValue, 
    updateMasterPriceRow, 
    addMasterPriceRow, 
    deleteMasterPriceRow,
    applyMassPriceAdjustment,
    products,
    categories
  } = useCatalog();

  const [tableSearch, setTableSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Todas las Categorías');
  const [editingCell, setEditingCell] = useState(null); // { sku, field }
  const [editValue, setEditValue] = useState('');
  const [sortField, setSortField] = useState('code');
  const [sortDirection, setSortDirection] = useState('asc');

  // Mass Adjustment Modal State
  const [isMassAdjustOpen, setIsMassAdjustOpen] = useState(false);
  const [adjustCategory, setAdjustCategory] = useState('Todas las Categorías');
  const [adjustPct, setAdjustPct] = useState('5');
  const [adjustFixed, setAdjustFixed] = useState('0');

  // New Row Modal State
  const [isAddRowOpen, setIsAddRowOpen] = useState(false);
  const [newRow, setNewRow] = useState({
    sku: '',
    code: '20-F',
    name: '',
    variant: '',
    price: 0,
    unit: 'pz',
    category: 'Conexiones de Cobre'
  });

  // Calculate linked products per SKU
  const getLinkedProductsCount = (sku) => {
    return products.filter(p => p.variants.some(v => v.sku === sku)).length;
  };

  // Cell editing handlers
  const handleStartEdit = (sku, field, currentValue) => {
    setEditingCell({ sku, field });
    setEditValue(currentValue.toString());
  };

  const handleSaveCell = (sku, field) => {
    if (!editingCell) return;
    if (field === 'price') {
      const num = parseFloat(editValue);
      if (!isNaN(num)) {
        updateMasterPriceValue(sku, num);
      }
    } else {
      updateMasterPriceRow(sku, { [field]: editValue });
    }
    setEditingCell(null);
  };

  const handleKeyDownCell = (e, sku, field) => {
    if (e.key === 'Enter') {
      handleSaveCell(sku, field);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  // Export Master Price Table to Excel (.xlsx) with custom colors, headers and formatting
  const handleExportToExcel = async () => {
    const rowsToExport = filteredMasterPrices.length > 0 ? filteredMasterPrices : masterPrices;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Catálogo Técnico Centralizado';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Lista Maestra de Precios', {
      views: [{ showGridLines: true }]
    });

    // Define columns & widths
    worksheet.columns = [
      { header: 'Código SKU', key: 'sku', width: 22 },
      { header: 'Catálogo (Código)', key: 'code', width: 18 },
      { header: 'Nombre / Referencia Técnica', key: 'name', width: 44 },
      { header: 'Medida / Variante', key: 'variant', width: 22 },
      { header: 'Precio Lista (MXN)', key: 'price', width: 22 },
      { header: 'Unidad', key: 'unit', width: 12 },
      { header: 'Categoría', key: 'category', width: 28 },
    ];

    // Style Header Row (Royal Blue Fill, White Bold Text, Centered)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;

    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E40AF' } // Deep Royal Blue Header
      };
      cell.font = {
        name: 'Calibri',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' } // White Text
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF1E3A8A' } },
        left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
        bottom: { style: 'medium', color: { argb: 'FF1E3A8A' } },
        right: { style: 'thin', color: { argb: 'FF1E3A8A' } }
      };
    });

    // Populate and Style Data Rows with Zebra Striping & Currency Format
    rowsToExport.forEach((item, index) => {
      const row = worksheet.addRow({
        sku: item.sku || '',
        code: item.code || '',
        name: item.name || '',
        variant: item.variant || '',
        price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0,
        unit: item.unit || 'pz',
        category: item.category || ''
      });

      row.height = 22;
      const isEven = index % 2 === 1;
      const rowBgColor = isEven ? 'FFEFEF6FF' : 'FFFFFFFF'; // Light Pastel Blue Zebra Striping

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Base background fill
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: rowBgColor }
        };

        // Base font
        cell.font = {
          name: 'Calibri',
          size: 10,
          color: { argb: 'FF0F172A' }
        };

        // Light Blue Grid Borders
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFDBEAFE' } },
          left: { style: 'thin', color: { argb: 'FFDBEAFE' } },
          bottom: { style: 'thin', color: { argb: 'FFDBEAFE' } },
          right: { style: 'thin', color: { argb: 'FFDBEAFE' } }
        };

        // Column Specific Formatting
        if (colNumber === 1) { // SKU
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF475569' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (colNumber === 2) { // Catálogo
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1D4ED8' } };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 4) { // Medida / Variante
          cell.font = { name: 'Calibri', size: 10, bold: true };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else if (colNumber === 5) { // Price MXN (Currency Format: $#,##0.00)
          cell.numFmt = '"$"#,##0.00;("$"#,##0.00);"-"';
          cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
          cell.alignment = { vertical: 'middle', horizontal: 'right' };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isEven ? 'FFDBEAFE' : 'FFE0F2FE' } // Highlight Price Cell with Soft Blue
          };
        } else if (colNumber === 6) { // Unidad
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        } else if (colNumber === 7) { // Categoría
          cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF1E40AF' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        } else {
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        }
      });
    });

    // Write to buffer & save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `Lista_Maestra_Precios_${dateStr}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Mass adjustment submit
  const handleApplyMassAdjust = (e) => {
    e.preventDefault();
    applyMassPriceAdjustment({
      category: adjustCategory,
      percentage: adjustPct,
      fixedAmount: adjustFixed
    });
    setIsMassAdjustOpen(false);
  };

  // Add new row submit
  const handleCreateNewRow = (e) => {
    e.preventDefault();
    if (!newRow.sku.trim()) {
      alert('Por favor especifica un código SKU único.');
      return;
    }
    addMasterPriceRow({
      ...newRow,
      price: parseFloat(newRow.price) || 0
    });
    setIsAddRowOpen(false);
    setNewRow({
      sku: '',
      code: '20-F',
      name: '',
      variant: '',
      price: 0,
      unit: 'pz',
      category: 'Conexiones de Cobre'
    });
  };

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort rows
  const filteredMasterPrices = masterPrices
    .filter(item => {
      const categoryMatch = selectedCategoryFilter === 'Todas las Categorías' || item.category === selectedCategoryFilter;
      if (!categoryMatch) return false;

      if (!tableSearch.trim()) return true;
      const q = tableSearch.toLowerCase().trim();
      return (
        item.sku.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.variant.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="space-y-4">
      
      {/* Header Banner & Controls */}
      <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Hoja Maestra Centralizada de Precios (Estilo Excel)
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cualquier modificación de precio en esta lista se sincroniza instantáneamente en todas las fichas del catálogo.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center space-x-2">
          
          <button
            onClick={handleExportToExcel}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-slate-700 font-bold text-xs transition shadow-xs cursor-pointer"
            title="Exportar Lista Maestra de Precios a Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Exportar a Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setIsMassAdjustOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 text-blue-900 dark:text-blue-300 border border-blue-100 dark:border-slate-700 font-bold text-xs transition"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Ajuste Masivo</span>
          </button>

          <button
            onClick={() => setIsAddRowOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Variante / SKU</span>
          </button>

        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/50 dark:bg-[#080d1a] p-3 rounded-xl border border-blue-100 dark:border-slate-800">
        
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Filtrar SKU, código, nombre o medida..."
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-blue-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-blue-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            ({filteredMasterPrices.length} registros)
          </span>
        </div>

      </div>

      {/* Excel Spreadsheet Table */}
      <div className="bg-white dark:bg-[#0f172a] border border-blue-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Header */}
            <thead className="bg-blue-50/80 dark:bg-[#090e17] text-slate-700 dark:text-slate-300 font-bold sticky top-0 z-10 border-b border-blue-100 dark:border-slate-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-2.5 border-r border-blue-100 dark:border-slate-800 cursor-pointer hover:bg-blue-100/60 dark:hover:bg-slate-800" onClick={() => handleSort('sku')}>
                  <div className="flex items-center justify-between">
                    <span>Código SKU</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-400" />
                  </div>
                </th>
                <th className="p-2.5 border-r border-blue-100 dark:border-slate-800 cursor-pointer hover:bg-blue-100/60 dark:hover:bg-slate-800" onClick={() => handleSort('code')}>
                  <div className="flex items-center justify-between">
                    <span>Catálogo</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-400" />
                  </div>
                </th>
                <th className="p-2.5 border-r border-blue-100 dark:border-slate-800 cursor-pointer hover:bg-blue-100/60 dark:hover:bg-slate-800" onClick={() => handleSort('name')}>
                  <div className="flex items-center justify-between">
                    <span>Nombre / Referencia Técnica</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-400" />
                  </div>
                </th>
                <th className="p-2.5 border-r border-blue-100 dark:border-slate-800 cursor-pointer hover:bg-blue-100/60 dark:hover:bg-slate-800" onClick={() => handleSort('variant')}>
                  <div className="flex items-center justify-between">
                    <span>Medida / Variante</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-400" />
                  </div>
                </th>
                <th className="p-2.5 border-r border-blue-100 dark:border-slate-800 text-right cursor-pointer bg-blue-100/70 dark:bg-blue-950/60 hover:bg-blue-200/70" onClick={() => handleSort('price')}>
                  <div className="flex items-center justify-end space-x-1 text-blue-900 dark:text-blue-300 font-black">
                    <DollarSign className="w-3 h-3" />
                    <span>Precio Lista (MXN)</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-600" />
                  </div>
                </th>
                <th className="p-2.5 border-r border-blue-100 dark:border-slate-800 text-center">
                  Unidad
                </th>
                <th className="p-2.5 border-r border-blue-100 dark:border-slate-800">
                  Categoría
                </th>
                <th className="p-2.5 border-r border-blue-100 dark:border-slate-800 text-center">
                  Fichas
                </th>
                <th className="p-2.5 text-center">
                  Acción
                </th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-blue-50 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
              {filteredMasterPrices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    No se encontraron registros de precios en la lista maestra.
                  </td>
                </tr>
              ) : (
                filteredMasterPrices.map((row) => {
                  const linkedCount = getLinkedProductsCount(row.sku);
                  const isEditingPrice = editingCell?.sku === row.sku && editingCell?.field === 'price';
                  const isEditingCode = editingCell?.sku === row.sku && editingCell?.field === 'code';
                  const isEditingName = editingCell?.sku === row.sku && editingCell?.field === 'name';
                  const isEditingVariant = editingCell?.sku === row.sku && editingCell?.field === 'variant';
                  const isEditingCategory = editingCell?.sku === row.sku && editingCell?.field === 'category';

                  return (
                    <tr 
                      key={row.sku}
                      className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition group"
                    >
                      {/* SKU */}
                      <td className="p-2.5 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 border-r border-blue-50 dark:border-slate-800/80 whitespace-nowrap">
                        {row.sku}
                      </td>

                      {/* Catálogo Code (Inline Editable) */}
                      <td 
                        className="p-2.5 font-bold text-blue-700 dark:text-blue-400 border-r border-blue-50 dark:border-slate-800/80 cursor-pointer hover:bg-blue-100/40 dark:hover:bg-blue-950/40 whitespace-nowrap"
                        onClick={() => !isEditingCode && handleStartEdit(row.sku, 'code', row.code)}
                        title="Clic para editar código de catálogo"
                      >
                        {isEditingCode ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveCell(row.sku, 'code')}
                              onKeyDown={(e) => handleKeyDownCell(e, row.sku, 'code')}
                              className="w-20 px-1.5 py-0.5 text-xs bg-blue-50 border border-blue-500 rounded text-slate-900 font-bold focus:outline-none"
                            />
                            <button onClick={() => handleSaveCell(row.sku, 'code')} className="text-blue-600">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span>{row.code}</span>
                        )}
                      </td>

                      {/* Name (Inline editable) */}
                      <td 
                        className="p-2.5 border-r border-blue-50 dark:border-slate-800/80 cursor-pointer hover:bg-blue-100/40 dark:hover:bg-blue-950/40"
                        onClick={() => !isEditingName && handleStartEdit(row.sku, 'name', row.name)}
                        title="Clic para editar nombre"
                      >
                        {isEditingName ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveCell(row.sku, 'name')}
                              onKeyDown={(e) => handleKeyDownCell(e, row.sku, 'name')}
                              className="w-full px-1.5 py-0.5 text-xs bg-blue-50 border border-blue-500 rounded text-slate-900 focus:outline-none"
                            />
                            <button onClick={() => handleSaveCell(row.sku, 'name')} className="text-blue-600">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="line-clamp-1 font-medium">{row.name}</span>
                        )}
                      </td>

                      {/* Variant (Inline editable) */}
                      <td 
                        className="p-2.5 border-r border-blue-50 dark:border-slate-800/80 font-semibold cursor-pointer hover:bg-blue-100/40 dark:hover:bg-blue-950/40 whitespace-nowrap"
                        onClick={() => !isEditingVariant && handleStartEdit(row.sku, 'variant', row.variant)}
                        title="Clic para editar medida"
                      >
                        {isEditingVariant ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveCell(row.sku, 'variant')}
                              onKeyDown={(e) => handleKeyDownCell(e, row.sku, 'variant')}
                              className="w-full px-1.5 py-0.5 text-xs bg-blue-50 border border-blue-500 rounded text-slate-900 focus:outline-none"
                            />
                            <button onClick={() => handleSaveCell(row.sku, 'variant')} className="text-blue-600">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span>{row.variant}</span>
                        )}
                      </td>

                      {/* Price (CRITICAL INLINE EDITED CELL) */}
                      <td 
                        className="p-2.5 border-r border-blue-50 dark:border-slate-800/80 text-right bg-blue-50/70 dark:bg-blue-950/40 group-hover:bg-blue-100/60 cursor-pointer font-mono font-bold"
                        onClick={() => !isEditingPrice && handleStartEdit(row.sku, 'price', row.price)}
                        title="Clic para editar precio"
                      >
                        {isEditingPrice ? (
                          <div className="flex items-center justify-end space-x-1">
                            <span className="text-blue-600">$</span>
                            <input
                              type="number"
                              step="0.10"
                              autoFocus
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveCell(row.sku, 'price')}
                              onKeyDown={(e) => handleKeyDownCell(e, row.sku, 'price')}
                              className="w-24 px-1 py-0.5 text-right font-mono font-bold text-xs bg-blue-100 dark:bg-blue-900 border-2 border-blue-500 rounded text-slate-900 dark:text-white focus:outline-none"
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                            ${row.price.toFixed(2)}
                          </span>
                        )}
                      </td>

                      {/* Unit */}
                      <td className="p-2.5 border-r border-blue-50 dark:border-slate-800/80 text-center font-mono text-[11px]">
                        {row.unit || 'pz'}
                      </td>

                      {/* Category (INLINE EDITABLE INPUT WITH SUGGESTIONS) */}
                      <td 
                        className="p-2.5 border-r border-blue-50 dark:border-slate-800/80 cursor-pointer hover:bg-blue-100/40 dark:hover:bg-blue-950/40 font-semibold"
                        onClick={() => !isEditingCategory && handleStartEdit(row.sku, 'category', row.category || 'Conexiones de Cobre')}
                        title="Clic para editar categoría"
                      >
                        {isEditingCategory ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="text"
                              autoFocus
                              list="category-table-options"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => handleSaveCell(row.sku, 'category')}
                              onKeyDown={(e) => handleKeyDownCell(e, row.sku, 'category')}
                              className="w-full px-1.5 py-0.5 text-xs bg-white dark:bg-slate-900 border-2 border-blue-500 rounded text-slate-900 dark:text-white font-bold focus:outline-none"
                            />
                            <datalist id="category-table-options">
                              {categories.filter(c => c !== 'Todas las Categorías').map(c => (
                                <option key={c} value={c} />
                              ))}
                            </datalist>
                            <button onClick={() => handleSaveCell(row.sku, 'category')} className="text-blue-600">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 text-[11px] font-bold border border-blue-200/60 dark:border-blue-800">
                            {row.category || 'Conexiones de Cobre'}
                          </span>
                        )}
                      </td>

                      {/* Linked Cards Indicator */}
                      <td className="p-2.5 border-r border-blue-50 dark:border-slate-800/80 text-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          linkedCount > 0 
                            ? 'bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800' 
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                        }`}>
                          {linkedCount} ficha(s)
                        </span>
                      </td>

                      {/* Delete */}
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la variante SKU ${row.sku}?`)) {
                              deleteMasterPriceRow(row.sku);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                          title="Eliminar SKU"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* Modal: Ajuste Masivo de Precios */}
      {isMassAdjustOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-blue-100 dark:border-slate-800 max-w-md w-full p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Ajuste Masivo de Precios
                </h3>
              </div>
              <button 
                onClick={() => setIsMassAdjustOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleApplyMassAdjust} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoría a modificar:
                </label>
                <select
                  value={adjustCategory}
                  onChange={(e) => setAdjustCategory(e.target.value)}
                  className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Porcentaje (%):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={adjustPct}
                    onChange={(e) => setAdjustPct(e.target.value)}
                    placeholder="Ej. 5 para +5%"
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-400">Usar negativo (-5) para descuento</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monto Fijo Fijo ($):
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={adjustFixed}
                    onChange={(e) => setAdjustFixed(e.target.value)}
                    placeholder="Ej. 10.00"
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/60 p-2.5 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-[11px] flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                <span>
                  Esta acción recalculará los precios en la Lista Maestra. Los cambios impactarán automáticamente todas las fichas del catálogo vinculadas.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMassAdjustOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Aplicar Cambio de Precios
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Agregar Nueva Variante SKU */}
      {isAddRowOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-xl border border-blue-100 dark:border-slate-800 max-w-lg w-full p-5 space-y-4">
            
            <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                Registrar Nueva Variante SKU en Lista Maestra
              </h3>
              <button 
                onClick={() => setIsAddRowOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateNewRow} className="space-y-3 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código SKU (Único): *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. SKU-20F-16MM"
                    value={newRow.sku}
                    onChange={(e) => setNewRow({ ...newRow, sku: e.target.value })}
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código Catálogo Ref:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 20-F"
                    value={newRow.code}
                    onChange={(e) => setNewRow({ ...newRow, code: e.target.value })}
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de Referencia / Producto:
                </label>
                <input
                  type="text"
                  placeholder="Ej. Codo estufa abocinado 45°"
                  value={newRow.name}
                  onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
                  className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Medida / Variante:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 16 mm"
                    value={newRow.variant}
                    onChange={(e) => setNewRow({ ...newRow, variant: e.target.value })}
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Precio ($ MXN):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newRow.price}
                    onChange={(e) => setNewRow({ ...newRow, price: e.target.value })}
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Unidad:
                  </label>
                  <input
                    type="text"
                    placeholder="pz / tramo"
                    value={newRow.unit}
                    onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })}
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Categoría:
                </label>
                <select
                  value={newRow.category}
                  onChange={(e) => setNewRow({ ...newRow, category: e.target.value })}
                  className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  {categories.filter(c => c !== 'Todas las Categorías').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddRowOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Guardar Variante
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

