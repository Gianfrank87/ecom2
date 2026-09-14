import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
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

    if (catParam && CATEGORIES.some((c) => c.id === catParam)) {
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
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search Term Filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term) || p.category.toLowerCase().includes(term)
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
    <div className="w-full min-h-screen bg-[#d8b538] text-[#352820] py-8 px-4 sm:px-6 lg:px-8">
      
      {/* ─── Cabecera Estilo NigDiz Original (Igual al Screenshot) ─── */}
      <div className="max-w-7xl mx-auto text-center mb-6 space-y-2">
        {/* Breadcrumb: Inicio . Productos */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#352820]/80 tracking-widest uppercase">
          <Link to="/" className="hover:underline">Inicio</Link>
          <span>.</span>
          <span className="font-extrabold text-[#352820]">Productos</span>
        </div>

        {/* Título Grande: Productos */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#352820] tracking-tight">
          Productos
        </h1>
      </div>

      {/* ─── Packs en Oferta (si existen) ─── */}
      {activeOffers.length > 0 && selectedCategory === 'todos' && !searchTerm && (
        <section className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-[#352820]/30 pb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#352820]" />
              <h2 className="text-xl font-extrabold text-[#352820]">Packs en Oferta</h2>
            </div>
            <span className="text-xs font-black bg-[#352820] text-[#f0dc78] px-3 py-1 rounded-none uppercase tracking-wider">
              {activeOffers.length} pack{activeOffers.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeOffers.map((offer) => (
              <OfertaCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Barra de Filtros y Categorías Minimalista (Sin la caja marrón pesada) ─── */}
      <div className="max-w-7xl mx-auto mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Buscador de productos con bordes rectos de 1px */}
          <div className="w-full md:w-1/2 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
              <Search className="w-4 h-4 text-[#352820]" />
            </span>
            <input
              type="text"
              placeholder="Buscar por nombre, marca o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-[#352820] placeholder-gray-500 text-xs font-semibold border border-[#352820]/40 focus:outline-none focus:border-[#352820] focus:ring-1 focus:ring-[#352820] rounded-none shadow-xs"
            />
          </div>

          {/* Selector de Ordenamiento ("Ordenar") */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs font-extrabold text-[#352820] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#352820]" /> Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-white text-[#352820] font-extrabold text-xs border border-[#352820]/40 focus:outline-none focus:border-[#352820] rounded-none cursor-pointer shadow-xs"
            >
              <option value="default">Por posición por defecto</option>
              <option value="priceAsc">Precio: Menor a Mayor</option>
              <option value="priceDesc">Precio: Mayor a Menor</option>
              <option value="nameAsc">Nombre: A - Z</option>
            </select>
          </div>
        </div>

        {/* Categorías: Botones 100% Cuadrados con Bordes de 1px */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#352820]/20">
          <span className="text-xs font-extrabold text-[#352820] uppercase tracking-wider mr-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#352820]" /> Categorías:
          </span>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-1.5 rounded-none text-xs font-black tracking-wide transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[#352820] text-[#f0dc78] border-[#352820] shadow-xs'
                    : 'bg-white hover:bg-amber-50 text-[#352820] border-[#352820]/30'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Grilla de Productos Con Esquinas Cuadradas sobre Fondo Dorado ─── */}
      <div className="max-w-7xl mx-auto">
        {filteredProducts.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-4 text-xs font-extrabold text-[#352820]">
              <span>Mostrando {filteredProducts.length} productos</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-none border border-[#352820]/30 p-10 text-center max-w-lg mx-auto shadow-md my-8">
            <div className="w-14 h-14 bg-amber-50 flex items-center justify-center text-2xl mx-auto mb-3 text-[#d8b538]">
              🔍
            </div>
            <h3 className="font-extrabold text-base text-[#352820] mb-1">No se encontraron productos</h3>
            <p className="text-gray-500 text-xs mb-5 leading-relaxed font-medium">
              No encontramos coincidencias para los filtros aplicados.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[#352820] hover:bg-[#4b382b] text-[#f0dc78] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              <XCircle className="w-4 h-4 text-[#d8b538]" /> Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
