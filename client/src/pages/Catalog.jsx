import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, XCircle, Flame } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import OfertaCard from '../components/OfertaCard';
import { api } from '../services/api';

const CATEGORIES = [
  { id: 'todos', name: 'Todos' },
  { id: 'collares', name: 'Collares' },
  { id: 'correas', name: 'Correas' },
  { id: 'alimentos', name: 'Alimentos' },
  { id: 'juguetes', name: 'Juguetes' },
  { id: 'consejos', name: 'Consejos' }
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('default'); // default, priceAsc, priceDesc, nameAsc

  // Read products from database
  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch((err) => console.error('Error al cargar productos en catálogo:', err));

    api.getActiveOffers()
      .then(setActiveOffers)
      .catch((err) => console.error('Error al cargar ofertas:', err));
  }, []);

  // Update selected category and search term if URL parameter changes
  useEffect(() => {
    const catParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (catParam && CATEGORIES.some(c => c.id === catParam)) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('todos');
    }

    if (searchParam) {
      setSearchTerm(searchParam);
    } else {
      setSearchTerm('');
    }
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Category Filter
    if (selectedCategory !== 'todos') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search Term Filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
      );
    }

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'nameAsc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'default') {
      result.sort((a, b) => (a.orden ?? Number(a.id)) - (b.orden ?? Number(b.id)));
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchTerm, sortBy]);

  const handleCategoryChange = (catId) => {
    if (catId === 'todos') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', catId);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    searchParams.delete('search');
    searchParams.delete('category');
    setSearchParams(searchParams);
    setSelectedCategory('todos');
    setSortBy('default');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-left">
      {/* Page Header */}
      <div className="mb-6">
        <span className="text-[11px] font-black uppercase tracking-widest text-[#e52521]">Catálogo de Productos</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Todos los Alimentos y Artículos
        </h1>
      </div>

      {/* ─── Active Offers Banner ─── */}
      {activeOffers.length > 0 && selectedCategory === 'todos' && !searchTerm && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-[#e52521]" />
            <h2 className="text-lg font-extrabold text-gray-900">Packs en Oferta</h2>
            <span className="text-[10px] font-black bg-red-100 text-[#e52521] px-2 py-0.5 rounded-full">
              {activeOffers.length} pack{activeOffers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeOffers.map((offer) => (
              <OfertaCard key={offer.id} offer={offer} />
            ))}
          </div>
          <hr className="mt-8 border-gray-200" />
        </section>
      )}

      {/* Control Panel: Filters, Search, Sorting */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8 shadow-xs space-y-4">
        <div className="grid md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-7 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, marca o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-100 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-800 placeholder-gray-400 transition-all"
            />
          </div>

          {/* Sorting */}
          <div className="md:col-span-5 flex gap-3">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <ArrowUpDown className="w-4 h-4" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-bold text-gray-800 appearance-none cursor-pointer"
              >
                <option value="default">Orden por defecto</option>
                <option value="priceAsc">Precio: Menor a Mayor</option>
                <option value="priceDesc">Precio: Mayor a Menor</option>
                <option value="nameAsc">Nombre: A - Z</option>
              </select>
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400 text-xs font-bold">
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* Categories Tabs Filter */}
        <div className="border-t border-gray-100 pt-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Categoría:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#e52521] text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid & Empty State */}
      {filteredProducts.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-500">
            <span>Mostrando {filteredProducts.length} productos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-2xl mx-auto mb-3">
            🔍
          </div>
          <h3 className="font-extrabold text-base text-gray-900 mb-1">No se encontraron resultados</h3>
          <p className="text-gray-500 text-xs mb-5 leading-relaxed">
            Probá buscando con otros términos o removiendo los filtros aplicados en el catálogo.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e52521] hover:bg-[#c91d19] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4" /> Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
