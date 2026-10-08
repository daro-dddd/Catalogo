import React from 'react';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import MasterPriceTable from './components/MasterPriceTable';
import ProductModal from './components/ProductModal';
import PrintLayoutView from './components/PrintLayoutView';
import QuoteCalculatorView from './components/QuoteCalculatorView';
import VersionHistoryView from './components/VersionHistoryView';
import ImageLightboxModal from './components/ImageLightboxModal';
import { Layers, FileSpreadsheet, PackageCheck, AlertCircle, Plus, History } from 'lucide-react';

function CatalogDashboardContent() {
  const { 
    filteredProducts, 
    products, 
    masterPrices, 
    versions,
    activeTab, 
    selectedCategory, 
    setSelectedCategory, 
    categories,
    openCreateProductModal,
    searchQuery
  } = useCatalog();

  return (
    <div className="min-h-screen bg-[#f0f7ff] dark:bg-[#080d1a] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Header */}
      <Header />

      {/* Main View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: PRODUCT CARDS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Quick Metrics Bar in Single Pastel Blue Tone */}
            <div className="no-print grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              
              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex items-center space-x-3 transition">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{products.length}</div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Fichas Registradas</div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex items-center space-x-3 transition">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{masterPrices.length}</div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Precios SKU Maestros</div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex items-center space-x-3 transition">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    {products.reduce((sum, p) => sum + p.variants.length, 0)}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Medidas Activas</div>
                </div>
              </div>

              <div className="bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex items-center space-x-3 transition">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">{versions.length}</div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Versiones en Historial</div>
                </div>
              </div>

            </div>

            {/* Category Quick Pills in Single Pastel Blue Tone */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 border-blue-100 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Grid Layout of Autonomous Boxes */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-[#0f172a] rounded-2xl p-12 text-center border border-blue-100 dark:border-slate-800 space-y-3 shadow-xs">
                <AlertCircle className="w-10 h-10 text-blue-500 mx-auto opacity-70" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  No se encontraron fichas de productos
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {searchQuery ? `No hay resultados para "${searchQuery}". Intenta con otra medida o material.` : 'No hay productos en esta categoría.'}
                </p>
                <button
                  onClick={openCreateProductModal}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Producto Ahora</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: MASTER PRICE LIST TABLE */}
        {activeTab === 'master-prices' && (
          <MasterPriceTable />
        )}

        {/* VIEW 3: PRINT LAYOUT */}
        {activeTab === 'print-layout' && (
          <PrintLayoutView />
        )}

        {/* VIEW 4: QUOTE CALCULATOR */}
        {activeTab === 'quote-calculator' && (
          <QuoteCalculatorView />
        )}

        {/* VIEW 5: VERSION HISTORY & BACKUPS */}
        {activeTab === 'versions' && (
          <VersionHistoryView />
        )}

      </main>

      {/* Shared Modals */}
      <ProductModal />
      <ImageLightboxModal />

    </div>
  );
}

export default function App() {
  return (
    <CatalogProvider>
      <CatalogDashboardContent />
    </CatalogProvider>
  );
}
