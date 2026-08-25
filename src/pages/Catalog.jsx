import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, XCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import OfertaCard from '../components/OfertaCard';
import { api } from '../services/api';

const CATEGORIES = [
  { id: 'todos', name: 'Todos' },
  { id: 'alimentos', name: 'Alimentos' },
  { id: 'accesorios', name: 'Accesorios' },
  { id: 'higiene', name: 'Higiene' },
  { id: 'juguetes', name: 'Juguetes' },
  { id: 'salud', name: 'Salud' }
];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('featured'); // featured, priceAsc, priceDesc, nameAsc

  // Read products from database
  useEffect(() => {
    api.getProducts()
      .then(setProducts)
      .catch((err) => console.error('Error al cargar productos en catálogo:', err));

    api.getActiveOffers()
      .then(setActiveOffers)
      .catch((err) => console.error('Error al cargar ofertas:', err));
  }, []);

  // Update selected category if URL parameter changes
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam && CATEGORIES.some(c => c.id === catParam)) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('todos');
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
        p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
      );
    }

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'nameAsc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'featured') {
      // Sort featured items first
      result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
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
    handleCategoryChange('todos');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="text-center sm:text-left mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-[#382d24]">
          Catálogo Completo
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Explora la variedad de alimentos y productos seleccionados para el bienestar de tu mascota.
        </p>
      </div>

      {/* ─── Active Offers Banner (visible when no specific filter active) ─── */}
      {activeOffers.length > 0 && selectedCategory === 'todos' && !searchTerm && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h2 className="text-lg font-display font-extrabold text-[#382d24]">Ofertas Activas</h2>
            <span className="text-xs font-bold bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
              {activeOffers.length} pack{activeOffers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOffers.map((offer) => (
              <OfertaCard key={offer.id} offer={offer} />
            ))}
          </div>
          <hr className="mt-8 border-accent-100" />
        </section>
      )}

      {/* Control Panel: Filters, Search, Sorting */}
      <div className="bg-white rounded-3xl border border-accent-100 p-5 mb-8 shadow-sm space-y-4">
        <div className="grid md:grid-cols-12 gap-4 items-center">
          
          {/* Search bar */}
          <div className="md:col-span-6 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-primary-50 border border-accent-100 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm placeholder-gray-400 font-body transition-all"
            />
          </div>

          {/* Sorting */}
          <div className="md:col-span-6 flex gap-3">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <ArrowUpDown className="w-4.5 h-4.5" />
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-8 py-3 rounded-2xl bg-primary-50 border border-accent-100 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-display font-medium text-gray-700 appearance-none cursor-pointer"
              >
                <option value="featured">Destacados primero</option>
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
        <div className="border-t border-gray-100 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Categorías:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4.5 py-2 rounded-xl text-xs font-display font-bold tracking-wide transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-accent-500 text-white shadow-sm'
                    : 'bg-primary-50 hover:bg-accent-50 border border-accent-50/50 text-gray-600 hover:text-accent-800'
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
          <div className="flex justify-between items-center mb-6 text-xs font-semibold text-gray-400">
            <span>Mostrando {filteredProducts.length} productos</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-accent-100 p-12 text-center max-w-lg mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center text-3xl mx-auto mb-4">
            🔍
          </div>
          <h3 className="font-display font-bold text-lg text-gray-800 mb-2">No se encontraron resultados</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Probá buscando con otros términos o removiendo los filtros aplicados en el catálogo.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-100 hover:bg-accent-200 text-accent-800 font-display font-bold text-xs tracking-wide transition-colors"
          >
            <XCircle className="w-4 h-4" /> Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
