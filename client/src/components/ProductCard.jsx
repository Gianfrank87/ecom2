import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Helper to format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Chips de variantes estructuradas (estilo MiVetShop)
  const getVariantChips = (category) => {
    const cat = category?.toLowerCase();
    if (cat === 'alimentos') return ['1.5kg', '3kg', '7.5kg', '15kg'];
    if (cat === 'higiene' || cat === 'salud') return ['250ml', '500ml'];
    if (cat === 'accesorios') return ['Talle S', 'Talle M', 'Talle L'];
    return ['1 unidad', 'Pack x2'];
  };

  const variantChips = getVariantChips(product.category);

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-xl border border-gray-200 hover:border-red-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between relative overflow-hidden text-left"
    >
      {/* Accent Top Border */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 w-full" />

      {/* Frame de Imagen */}
      <div className="relative aspect-square bg-gray-50 p-4 flex items-center justify-center border-b border-gray-100 overflow-hidden">
        {/* Badges superiores */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white shadow-sm">
            {product.category}
          </span>
          {product.featured && (
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-amber-400 text-amber-950 shadow-sm flex items-center gap-1">
              ⭐ Destacado
            </span>
          )}
        </div>

        {/* Fotografía de producto */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay sin stock */}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="font-extrabold text-xs uppercase tracking-widest text-white bg-red-600 px-3 py-1.5 rounded-md shadow-md">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Contenido de Info */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Subtítulo de categoría/marca */}
          <span className="text-[11px] font-black text-red-600 uppercase tracking-widest block mb-1">
            {product.category || 'Huellitas'}
          </span>

          {/* Título de producto */}
          <h3 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors mb-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Badges de variantes de peso / presentación */}
          <div className="flex flex-wrap gap-1 mb-3">
            {variantChips.slice(0, 3).map((chip, idx) => (
              <span
                key={idx}
                className="text-[10px] font-bold text-gray-600 bg-gray-100 hover:bg-red-50 hover:text-red-600 border border-gray-200 rounded px-1.5 py-0.5 transition-colors"
              >
                {chip}
              </span>
            ))}
            {variantChips.length > 3 && (
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
                +{variantChips.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Sección de Precio y Botón CTA */}
        <div className="pt-2 border-t border-gray-100 mt-auto">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Precio online</span>
              <span className="font-black text-lg sm:text-xl text-gray-900 tracking-tight">
                {formatPrice(product.price)}
              </span>
            </div>
            {product.stock > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> En stock
              </span>
            )}
          </div>

          {/* Botón CTA sólido de alto contraste */}
          {product.stock > 0 ? (
            <button
              onClick={handleQuickAdd}
              className="w-full py-2.5 px-3 bg-[#e52521] hover:bg-[#c91d19] active:bg-[#b01714] text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" /> Comprar Ahora
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2.5 px-3 bg-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider rounded-lg cursor-not-allowed text-center"
            >
              Sin Stock
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
