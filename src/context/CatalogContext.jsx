import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { INITIAL_PRODUCTS, INITIAL_MASTER_PRICES, INITIAL_CATEGORIES } from '../data/initialData';

const CatalogContext = createContext();

const LOCAL_STORAGE_PRODUCTS_KEY = 'catalog_manager_products_v4';
const LOCAL_STORAGE_MASTER_PRICES_KEY = 'catalog_manager_master_prices_v4';
const LOCAL_STORAGE_VERSIONS_KEY = 'catalog_manager_versions_v4';
const LOCAL_STORAGE_THEME_KEY = 'catalog_manager_theme_v4';

export function CatalogProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    return saved ? saved : 'light';
  });

  // Master Prices state
  const [masterPrices, setMasterPrices] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_MASTER_PRICES_KEY);
    let items = INITIAL_MASTER_PRICES;
    if (saved) {
      try { items = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Clean legacy category names
    return items.map(mp => (mp.category === 'Conexiones de Refrigeración' ? { ...mp, category: 'Conexiones de Cobre' } : mp));
  });

  // Products state
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
    let items = INITIAL_PRODUCTS;
    if (saved) {
      try { items = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return items.map(p => (p.category === 'Conexiones de Refrigeración' ? { ...p, category: 'Conexiones de Cobre' } : p));
  });

  // Versions History State (Automatic Version & PDF Copy Backups)
  const [versions, setVersions] = useState(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_VERSIONS_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    // Default initial version snapshot
    return [
      {
        id: 'ver-initial-v1',
        versionName: 'Versión 1.0 - Lista Inicial Completa',
        timestamp: new Date().toISOString(),
        notes: 'Fichas iniciales de Cobre, Tuboplus, CPVC, PVC Cédula 40 y PVC Sanitario.',
        productsCount: INITIAL_PRODUCTS.length,
        pricesCount: INITIAL_MASTER_PRICES.length,
        products: INITIAL_PRODUCTS,
        masterPrices: INITIAL_MASTER_PRICES
      }
    ];
  });

  // UI Navigation & Filters
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'master-prices' | 'print-layout' | 'quote-calculator' | 'versions'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas las Categorías');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null for create, object for edit
  const [lightboxImage, setLightboxImage] = useState(null); // { url, title }

  // Sync theme class to html
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, theme);
  }, [theme]);

  // Persist masterPrices, products, versions
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_MASTER_PRICES_KEY, JSON.stringify(masterPrices));
  }, [masterPrices]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_VERSIONS_KEY, JSON.stringify(versions));
  }, [versions]);

  // Quick lookup dictionary for SKU -> MasterPrice Object
  const masterPricesMap = useMemo(() => {
    const map = {};
    masterPrices.forEach(item => {
      map[item.sku] = item;
    });
    return map;
  }, [masterPrices]);

  // Toggle Theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Master Price Operations
  const updateMasterPriceValue = (sku, newPrice) => {
    const numericPrice = parseFloat(newPrice);
    if (isNaN(numericPrice)) return;
    setMasterPrices(prev => prev.map(item => item.sku === sku ? { ...item, price: numericPrice } : item));
  };

  const updateMasterPriceRow = (sku, updatedFields) => {
    setMasterPrices(prev => prev.map(item => item.sku === sku ? { ...item, ...updatedFields } : item));
  };

  const addMasterPriceRow = (newRow) => {
    if (!newRow.sku) return;
    setMasterPrices(prev => [newRow, ...prev]);
  };

  const deleteMasterPriceRow = (sku) => {
    setMasterPrices(prev => prev.filter(item => item.sku !== sku));
  };

  const applyMassPriceAdjustment = ({ category, percentage, fixedAmount }) => {
    const pctMultiplier = 1 + (parseFloat(percentage || 0) / 100);
    const fixedAdd = parseFloat(fixedAmount || 0);

    setMasterPrices(prev => prev.map(item => {
      if (category && category !== 'Todas las Categorías' && item.category !== category) {
        return item;
      }
      let newPrice = item.price * pctMultiplier + fixedAdd;
      newPrice = Math.round(newPrice * 100) / 100; // Round to 2 decimals
      return { ...item, price: Math.max(0, newPrice) };
    }));
  };

  // Product CRUD
  const saveProduct = (productData) => {
    let updatedMasterPrices = [...masterPrices];
    const cleanCode = (productData.catalogCode || 'GEN').replace(/catá?logo\s*/i, '').trim();

    // Process variants to sync prices and books (Libros) with masterPrices
    const processedVariants = (productData.variants || []).map((v) => {
      const rawPrice = parseFloat(v.price);
      const numericPrice = isNaN(rawPrice) ? null : rawPrice;
      const variantBook = v.book || v.category || productData.category || 'Conexiones de Cobre';

      if (v.sku) {
        // Update existing master price item if price or category changed
        updatedMasterPrices = updatedMasterPrices.map(mp => {
          if (mp.sku === v.sku) {
            return {
              ...mp,
              price: numericPrice !== null ? numericPrice : mp.price,
              category: variantBook || mp.category
            };
          }
          return mp;
        });
        return {
          ...v,
          price: numericPrice !== null ? numericPrice : (masterPricesMap[v.sku]?.price ?? 0),
          book: variantBook
        };
      } else if (numericPrice !== null || (v.label && v.label.trim())) {
        // Auto-create Master Price SKU if missing
        const cleanSkuTag = `${cleanCode}-${v.label || 'VAR'}`.replace(/[^a-zA-Z0-9]/g, '-').toUpperCase();
        const generatedSku = `SKU-${cleanSkuTag}-${Date.now().toString().slice(-4)}`;
        
        const newMasterRow = {
          sku: generatedSku,
          code: cleanCode || 'CAT-GEN',
          name: productData.title || 'Producto Genérico',
          variant: v.label || 'Medida Estándar',
          price: numericPrice !== null ? numericPrice : 15.00,
          unit: 'pz',
          category: variantBook
        };

        updatedMasterPrices.unshift(newMasterRow);
        return {
          ...v,
          sku: generatedSku,
          price: numericPrice !== null ? numericPrice : 15.00,
          book: variantBook
        };
      }
      return v;
    });

    const finalProductData = {
      ...productData,
      variants: processedVariants
    };

    setMasterPrices(updatedMasterPrices);

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...finalProductData, id: editingProduct.id } : p));
    } else {
      const newProduct = {
        ...finalProductData,
        id: `prod-${Date.now()}`
      };
      setProducts(prev => [newProduct, ...prev]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const updateProductsOrder = (newProductsList) => {
    setProducts(newProductsList);
  };

  const deleteProduct = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta caja / ficha técnica del catálogo?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const duplicateProduct = (id) => {
    const target = products.find(p => p.id === id);
    if (target) {
      const duplicated = {
        ...target,
        id: `prod-${Date.now()}`,
        catalogCode: target.catalogCode.includes('(COPIA)') ? target.catalogCode : `${target.catalogCode} (COPIA)`,
        title: `${target.title} (Copia Instancia)`
      };
      setProducts(prev => [duplicated, ...prev]);
    }
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  // Filtered products computed list
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category match
      const categoryMatch = selectedCategory === 'Todas las Categorías' || product.category === selectedCategory;
      if (!categoryMatch) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();

      // Check code, title, category, specs
      const codeMatch = product.catalogCode.toLowerCase().includes(q);
      const titleMatch = product.title.toLowerCase().includes(q);
      const categoryTextMatch = product.category.toLowerCase().includes(q);
      
      // Check variants (size labels & linked SKUs)
      const variantMatch = product.variants.some(v => {
        const labelMatch = v.label && v.label.toLowerCase().includes(q);
        const skuMatch = v.sku && v.sku.toLowerCase().includes(q);
        const masterItem = masterPricesMap[v.sku];
        const masterVarMatch = masterItem && masterItem.variant.toLowerCase().includes(q);
        return labelMatch || skuMatch || masterVarMatch;
      });

      return codeMatch || titleMatch || categoryTextMatch || variantMatch;
    });
  }, [products, searchQuery, selectedCategory, masterPricesMap]);

  // Version Snapshots & Backups Management
  const createVersionSnapshot = (versionName, notes) => {
    const newSnapshot = {
      id: `ver-${Date.now()}`,
      versionName: versionName || `Versión ${versions.length + 1}.0`,
      timestamp: new Date().toISOString(),
      notes: notes || 'Respaldo automático del catálogo técnico.',
      productsCount: products.length,
      pricesCount: masterPrices.length,
      products: [...products],
      masterPrices: [...masterPrices]
    };
    setVersions(prev => [newSnapshot, ...prev]);
    alert(`¡Versión "${newSnapshot.versionName}" guardada en el historial con éxito!`);
  };

  const restoreVersionSnapshot = (snapshotId) => {
    const target = versions.find(v => v.id === snapshotId);
    if (target) {
      if (window.confirm(`¿Restaurar los productos y precios de la "${target.versionName}"? Los datos actuales serán reemplazados.`)) {
        setProducts(target.products);
        setMasterPrices(target.masterPrices);
        alert(`¡Catálogo restaurado a la ${target.versionName}!`);
      }
    }
  };

  const deleteVersionSnapshot = (snapshotId) => {
    if (window.confirm('¿Eliminar esta versión guardada del historial?')) {
      setVersions(prev => prev.filter(v => v.id !== snapshotId));
    }
  };

  // Export / Import Data
  const exportDataJSON = () => {
    const exportObject = {
      timestamp: new Date().toISOString(),
      version: '3.0',
      versions,
      masterPrices,
      products
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogo_tecnico_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDataJSON = (fileContent) => {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.masterPrices && parsed.products) {
        setMasterPrices(parsed.masterPrices);
        setProducts(parsed.products);
        if (parsed.versions) setVersions(parsed.versions);
        alert('¡Datos del catálogo e historial importados con éxito!');
      } else {
        alert('El archivo JSON no tiene la estructura válida de catálogo.');
      }
    } catch (e) {
      alert('Error al leer el archivo JSON: ' + e.message);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('¿Deseas restablecer todos los productos y precios a los datos iniciales de catálogo?')) {
      setMasterPrices(INITIAL_MASTER_PRICES);
      setProducts(INITIAL_PRODUCTS);
    }
  };

  // Dynamic categories list derived from initial categories + custom categories added by user
  const categories = useMemo(() => {
    const set = new Set(INITIAL_CATEGORIES);
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    masterPrices.forEach(mp => {
      if (mp.category) set.add(mp.category);
    });
    return Array.from(set);
  }, [products, masterPrices]);

  const value = {
    theme,
    toggleTheme,
    products,
    filteredProducts,
    masterPrices,
    masterPricesMap,
    versions,
    createVersionSnapshot,
    restoreVersionSnapshot,
    deleteVersionSnapshot,
    categories,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    updateMasterPriceValue,
    updateMasterPriceRow,
    addMasterPriceRow,
    deleteMasterPriceRow,
    applyMassPriceAdjustment,
    saveProduct,
    updateProductsOrder,
    deleteProduct,
    duplicateProduct,
    isProductModalOpen,
    setIsProductModalOpen,
    editingProduct,
    openCreateProductModal,
    openEditProductModal,
    lightboxImage,
    setLightboxImage,
    exportDataJSON,
    importDataJSON,
    resetToDefaults
  };

  return (
    <CatalogContext.Provider value={value}>
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
