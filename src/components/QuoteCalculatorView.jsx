import React, { useState } from 'react';
import { useCatalog } from '../context/CatalogContext';
import { Calculator, Plus, Trash2, Printer, Copy, Check, FileText, ShoppingCart } from 'lucide-react';

export default function QuoteCalculatorView() {
  const { products, masterPrices, masterPricesMap } = useCatalog();
  
  const [selectedSku, setSelectedSku] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [quoteItems, setQuoteItems] = useState([]);
  const [clientName, setClientName] = useState('Cliente Administrativo / Proyecto Interno');
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
    let text = `COTIZACIÓN DE PRODUCTOS INDUSTRIALES NACOBRE\nCliente: ${clientName}\nFecha: ${new Date().toLocaleDateString()}\n\n`;
    quoteItems.forEach(item => {
      text += `- [${item.code}] ${item.name} (${item.variant}) x ${item.qty} ${item.unit}: ${formatMoney(item.unitPrice * item.qty)}\n`;
    });
    text += `\nSubtotal: ${formatMoney(subtotal)}`;
    if (discountPct > 0) text += `\nDescuento (${discountPct}%): -${formatMoney(discountAmount)}`;
    text += `\nIVA (16%): ${formatMoney(iva)}`;
    text += `\nTOTAL ESTIMADO: ${formatMoney(total)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-900 dark:text-blue-300 font-bold text-xs border border-blue-100 dark:border-slate-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5 text-blue-500" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Cotización</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Item Selector & Client Setup */}
        <div className="lg:col-span-1 space-y-4">
          
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

        {/* Right Column: Quote Table & Totals */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                  Desglose de Cotización
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {quoteItems.length} partidas
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-blue-50/70 dark:bg-[#090e17] text-slate-700 dark:text-slate-300 uppercase font-bold text-[10px] border-b border-blue-100 dark:border-slate-800">
                  <tr>
                    <th className="p-2">Catálogo</th>
                    <th className="p-2">Producto / Variante</th>
                    <th className="p-2 text-center">Cant.</th>
                    <th className="p-2 text-right">Precio Unit.</th>
                    <th className="p-2 text-right">Importe</th>
                    <th className="p-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50 dark:divide-slate-800/80">
                  {quoteItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No has agregado ningún producto a la cotización aún.
                      </td>
                    </tr>
                  ) : (
                    quoteItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-blue-950/30">
                        <td className="p-2 font-bold text-blue-700 dark:text-blue-400">
                          {item.code}
                        </td>
                        <td className="p-2">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                          <div className="text-[10px] text-slate-500">{item.variant}</div>
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => updateQty(idx, e.target.value)}
                            className="w-14 p-1 text-center font-bold bg-blue-50/60 dark:bg-[#080d1a] border border-blue-100 dark:border-slate-800 rounded-lg text-xs"
                          />
                        </td>
                        <td className="p-2 text-right font-mono">
                          {formatMoney(item.unitPrice)}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          {formatMoney(item.unitPrice * item.qty)}
                        </td>
                        <td className="p-2 text-center">
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
              <div className="bg-blue-50/50 dark:bg-[#080d1a] p-4 rounded-xl border border-blue-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal Bruto:</span>
                  <span className="font-mono">{formatMoney(subtotal)}</span>
                </div>
                {discountPct > 0 && (
                  <div className="flex justify-between text-blue-700 dark:text-blue-300 font-bold">
                    <span>Descuento Aplicado ({discountPct}%):</span>
                    <span className="font-mono">-{formatMoney(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>I.V.A. (16%):</span>
                  <span className="font-mono">{formatMoney(iva)}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 dark:text-slate-100 pt-2 border-t border-blue-100 dark:border-slate-800">
                  <span>TOTAL ESTIMADO (MXN):</span>
                  <span className="font-mono text-blue-700 dark:text-blue-400 text-base">{formatMoney(total)}</span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}

