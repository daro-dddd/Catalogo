import React from 'react';
import { useCatalog } from '../context/CatalogContext';
import { 
  Sun, 
  Moon, 
  Plus, 
  Search, 
  Table, 
  Grid, 
  Printer, 
  Calculator, 
  SlidersHorizontal,
  History,
  Box
} from 'lucide-react';

export default function Header() {
  const {
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    openCreateProductModal
  } = useCatalog();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-blue-100 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Branding & Main Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between py-3 gap-4 border-b border-blue-50 dark:border-slate-800/80">
          
          {/* Single Pastel Blue Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-blue-900 dark:text-blue-400">
                  CREACIÓN Y GESTIÓN DE CATÁLOGOS TÉCNICOS
                </span>
                <span className="text-[10px] px-2.5 py-0.5 font-bold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  PWA & NATIVE DESKTOP v4.0
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Administración, Maquetación y Consulta de Fichas Técnicas e Instalaciones
              </p>
            </div>
          </div>

          {/* Top Actions: Theme Toggle & Add Product */}
          <div className="flex items-center space-x-2 opacity-100">

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-blue-100 dark:border-slate-700 hover:bg-blue-100 dark:hover:bg-slate-700 transition"
              title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-700" />}
            </button>

            {/* Add Product Modal Launcher */}
            <button
              onClick={openCreateProductModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs & Search Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-2.5 gap-3">
          
          {/* Navigation Views Switcher */}
          <nav className="flex space-x-1 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Fichas de Productos</span>
            </button>

            <button
              onClick={() => setActiveTab('master-prices')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'master-prices'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Lista Maestra de Precios (Excel)</span>
            </button>

            <button
              onClick={() => setActiveTab('print-layout')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'print-layout'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Maquetador / Impresión PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('quote-calculator')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'quote-calculator'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Cotizador Rápido</span>
            </button>

            <button
              onClick={() => setActiveTab('versions')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === 'versions'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Historial de Versiones & PDF</span>
            </button>
          </nav>

          {/* Search & Category Filtering Bar */}
          {(activeTab === 'dashboard' || activeTab === 'print-layout') && (
            <div className="flex items-center space-x-2 w-full lg:w-auto">
              
              {/* Category Dropdown */}
              <div className="relative flex-shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-8 pr-7 py-1.5 text-xs font-bold bg-blue-50/70 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-blue-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-2.5 pointer-events-none" />
              </div>

              {/* Live Search Input */}
              <div className="relative flex-grow lg:w-64">
                <input
                  type="text"
                  placeholder="Buscar por código, medida o material..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-blue-50/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-blue-100 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-blue-400 absolute left-2.5 top-2.5 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ×
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </header>
  );
}
