import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { Calculator, Plus, Trash2, Printer, Copy, Check, ShoppingCart, Edit2 } from 'lucide-react';

export default function QuoteCalculatorView() {
  const { masterPrices, masterPricesMap } = useCatalog();
  
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [quoteItems, setQuoteItems] = useState([]);
  const [clientName, setClientName] = useState('Cliente Administrativo / Proyecto Interno');
  const [quoteTitle, setQuoteTitle] = useState('COTIZACIÓN Y PRESUPUESTO DE MATERIALES');
  const [disclaimerText, setDisclaimerText] = useState('* NOTA: Este documento es únicamente un presupuesto/cotización de carácter informativo. No representa un comprobante fiscal ni factura. Los precios y existencias están sujetos a cambios sin previo aviso.');
  const [discountPct, setDiscountPct] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!selectedSku) return;
    const masterItem = masterPricesMap[selectedSku];
    if (!masterItem) return;

    // Check if already in quote
    const existingIndex = quoteItems.findIndex(item => item.sku === selectedSku);
    if (existingIndex >= 0) {
      const updated = [...quoteItems];
      updated[existingIndex].qty += parseInt(quantity || 1);
      setQuoteItems(updated);
    } else {
      setQuoteItems([
        ...quoteItems,
        {
          sku: masterItem.sku,
          code: masterItem.code,
          name: masterItem.name,
          variant: masterItem.variant,
          unitPrice: masterItem.price,
          unit: masterItem.unit || 'pz',
          qty: parseInt(quantity || 1)
        }
      ]);
    }

    setQuantity(1);
  };

  const removeItem = (index) => {
    setQuoteItems(quoteItems.filter((_, i) => i !== index));
  };

  const updateQty = (index, newQty) => {
    const qty = parseInt(newQty);
    if (isNaN(qty) || qty <= 0) return;
    const updated = [...quoteItems];
    updated[index].qty = qty;
    setQuoteItems(updated);
  };

  // Financial Calculations
  const subtotal = quoteItems.reduce((acc, item) => acc + (item.unitPrice * item.qty), 0);
  const discountAmount = subtotal * (discountPct / 100);
  const taxableSubtotal = subtotal - discountAmount;
  const iva = taxableSubtotal * 0.16;
  const total = taxableSubtotal + iva;

  const formatMoney = (val) => `$${val.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleCopySummary = () => {
    let text = `${quoteTitle.toUpperCase()}\nCliente: ${clientName}\nFecha: ${new Date().toLocaleDateString('es-MX')}\n\n`;
    quoteItems.forEach(item => {
      text += `- [${item.code}] ${item.name} (${item.variant}) x ${item.qty} ${item.unit}: ${formatMoney(item.unitPrice * item.qty)}\n`;
    });
    text += `\nSubtotal Bruto: ${formatMoney(subtotal)}`;
    if (discountPct > 0) text += `\nDescuento (${discountPct}%): -${formatMoney(discountAmount)}`;
    text += `\nI.V.A. (16%): ${formatMoney(iva)}`;
    text += `\nTOTAL ESTIMADO (MXN): ${formatMoney(total)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Toolbar (Hidden on Print) */}
      <div className="no-print print:hidden bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Cotizador & Calculadora de Volúmenes Rápida
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Selecciona productos y medidas para obtener un presupuesto administrativo inmediato con precios centralizados.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-900 dark:text-blue-300 font-bold text-xs border border-blue-100 dark:border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Cotización</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Item Selector & Client Setup (Hidden on Print) */}
        <div className="no-print print:hidden lg:col-span-1 space-y-4">
          
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 border-b border-blue-100 dark:border-slate-800 pb-2">
              Agregar Producto a la Cotización
            </h3>

            <form onSubmit={handleAddItem} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Cliente / Destino:
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Seleccionar Variante de Lista Maestra:
                </label>
                <select
                  value={selectedSku}
                  onChange={(e) => setSelectedSku(e.target.value)}
                  className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                >
                  <option value="">-- Elige variante/medida --</option>
                  {masterPrices.map(mp => (
                    <option key={mp.sku} value={mp.sku}>
                      [{mp.sku}] {mp.code} - {mp.name} ({mp.variant}) - ${mp.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Cantidad:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 font-bold text-center"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Descuento (%):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(parseFloat(e.target.value || 0))}
                    className="w-full p-2 bg-blue-50/50 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 text-center font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center space-x-1 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar a la Lista</span>
              </button>

            </form>
          </div>

        </div>

        {/* Right Column: Clean Printable Quote Sheet */}
        <div className="lg:col-span-2 space-y-4 print:w-full print:col-span-3 print:m-0 print:p-0">
          
          <div className="bg-white dark:bg-[#0f172a] p-4 sm:p-6 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0 print:bg-white text-slate-900">
            
            {/* Editable Printable Quote Header */}
            <div className="border-b-2 border-blue-600 pb-3 mb-4 space-y-1.5">
              <div className="relative group/edit-title">
                <input
                  type="text"
                  value={quoteTitle}
                  onChange={(e) => setQuoteTitle(e.target.value)}
                  placeholder="Título de la Cotización..."
                  className="w-full font-black text-lg sm:text-xl tracking-tight text-blue-950 uppercase bg-transparent hover:bg-blue-50/70 focus:bg-blue-50 border border-transparent hover:border-blue-300 focus:border-blue-500 rounded-lg px-2 py-1 outline-none transition cursor-text print:border-none print:bg-transparent print:p-0 print:text-black"
                  title="Haz clic para personalizar el título de la cotización"
                />
                <span className="no-print print:hidden absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-blue-600 dark:text-blue-400 opacity-0 group-hover/edit-title:opacity-100 pointer-events-none transition flex items-center space-x-1 bg-white/95 dark:bg-slate-800 px-2.5 py-1 rounded-md shadow-xs border border-blue-200 dark:border-slate-700">
                  <Edit2 className="w-3 h-3" />
                  <span>Clic para editar título</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-2 pt-1 border-t border-dashed border-blue-100 dark:border-slate-800 gap-2 print:text-black">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-slate-500 uppercase text-[10px] print:text-black">Cliente / Destino:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200 print:text-black">{clientName || 'Cliente General'}</span>
                </div>
                <div className="flex items-center space-x-4 text-[11px] font-mono print:text-black">
                  <span><strong>Fecha:</strong> {new Date().toLocaleDateString('es-MX')}</span>
                  <span><strong>Partidas:</strong> {quoteItems.length}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-blue-50/70 dark:bg-[#090e17] print:bg-slate-100 text-slate-700 dark:text-slate-300 print:text-black uppercase font-bold text-[10px] border-b border-blue-100 dark:border-slate-800 print:border-slate-300">
                  <tr>
                    <th className="p-2">Catálogo</th>
                    <th className="p-2">Producto / Variante</th>
                    <th className="p-2 text-center">Cant.</th>
                    <th className="p-2 text-right">Precio Unit.</th>
                    <th className="p-2 text-right">Importe</th>
                    <th className="p-2 text-center no-print print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 dark:divide-slate-800/80 print:divide-slate-200">
                  {quoteItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 print:text-slate-600">
                        No has agregado ningún producto a la cotización aún.
                      </td>
                    </tr>
                  ) : (
                    quoteItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30">
                        <td className="p-2 font-bold text-blue-700 dark:text-blue-400 print:text-black">
                          {item.code}
                        </td>
                        <td className="p-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">{item.name}</div>
                          <div className="text-[10px] text-slate-500 print:text-slate-700">{item.variant}</div>
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateQty(idx, e.target.value)}
                            className="no-print print:hidden w-14 p-1 text-center font-bold bg-blue-50/60 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-lg text-xs"
                          />
                          <span className="hidden print:inline font-bold print:text-black">{item.qty}</span>
                        </td>
                        <td className="p-2 text-right font-mono print:text-black">
                          {formatMoney(item.unitPrice)}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100 print:text-black">
                          {formatMoney(item.unitPrice * item.qty)}
                        </td>
                        <td className="p-2 text-center no-print print:hidden">
                          <button
                            onClick={() => removeItem(idx)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Breakdown */}
            {quoteItems.length > 0 && (
              <div className="bg-blue-50/50 dark:bg-[#080d1a] print:bg-slate-50 p-4 rounded-xl border border-blue-100 dark:border-slate-800 print:border-slate-300 space-y-2 text-xs print:text-black">
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono">{formatMoney(subtotal)}</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between text-blue-700 dark:text-blue-300 font-bold print:text-black">
                    <span>Descuento Aplicado ({discountPct}%):</span>
                    <span className="font-mono">-{formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400 print:text-black">
                  <span>I.V.A. (16%):</span>
                  <span className="font-mono">{formatMoney(iva)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-slate-100 print:text-black pt-2 border-t border-blue-100 dark:border-slate-800 print:border-slate-300">
                  <span>TOTAL ESTIMADO (MXN):</span>
                  <span className="font-mono text-blue-700 dark:text-blue-400 print:text-black text-base">{formatMoney(total)}</span>
                </div>
              </div>
            )}

            {/* Legal Disclaimer Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 print:border-slate-300 text-[10px] text-slate-500 dark:text-slate-400 print:text-black italic">
              <input
                type="text"
                value={disclaimerText}
                onChange={(e) => setDisclaimerText(e.target.value)}
                className="w-full text-center bg-transparent hover:bg-blue-50/50 focus:bg-blue-50 border border-transparent hover:border-blue-200 focus:border-blue-400 rounded px-2 py-1 outline-none transition cursor-text print:border-none print:bg-transparent print:p-0 print:text-black italic"
                title="Haz clic para personalizar la leyenda de la cotización"
              />
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


