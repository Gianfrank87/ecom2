import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  // Helper para formatear moneda (estilo $ 68.000,00)
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

  // Variantes/presentación (ej: "2 colores", "1.5kg")
  const getVariantLabel = (category) => {
    const cat = category?.toLowerCase();
    if (cat === 'alimentos') return 'Varias presentaciones';
    if (cat === 'collares' || cat === 'correas') return '2 colores';
    return '1 unidad';
  };

  const variantLabel = getVariantLabel(product.category);
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-none border border-[#352820]/20 hover:border-[#352820] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden text-left relative"
    >
      {/* Frame de Imagen Cuadrado Blanco (Esquinas 100% cuadradas como en la captura) */}
      <div className="relative aspect-square bg-white p-4 flex items-center justify-center border-b border-gray-200 overflow-hidden">
        
        {/* Badge "Sin stock" rectangular negro con texto amarillo en la esquina superior izquierda */}
        {isOutOfStock && (
          <div className="absolute top-2 left-2 z-20">
            <span className="font-extrabold text-[10px] uppercase tracking-wider text-[#f0dc78] bg-black px-2.5 py-1 rounded-none shadow-sm">
              Sin stock
            </span>
          </div>
        )}

        {/* Destacado si tiene stock */}
        {!isOutOfStock && product.featured && (
          <div className="absolute top-2 left-2 z-10">
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-none bg-[#352820] text-[#f0dc78] shadow-xs">
              Destacado
            </span>
          </div>
        )}

        {/* Fotografía de producto */}
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-60 grayscale-[20%]' : ''
          }`}
          loading="lazy"
        />
      </div>

      {/* Contenido e Información */}
      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
        <div>
          {/* Título de producto */}
          <h3 className="font-extrabold text-sm sm:text-base text-[#352820] line-clamp-2 leading-snug group-hover:text-[#d8b538] transition-colors mb-1 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* Precio (Estilo $68.000,00) */}
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-black text-lg sm:text-xl text-[#352820] tracking-tight">
              {formatPrice(product.price)}
            </span>
            {!isOutOfStock && (
              <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-none border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> En stock
              </span>
            )}
          </div>

          {/* Subtítulo de variante (ej: "2 colores") */}
          <span className="text-xs text-gray-500 font-medium block mt-1">
            {variantLabel}
          </span>
        </div>

        {/* Botón CTA Cuadrado Corporativo */}
        <div className="pt-2 border-t border-gray-100 mt-auto">
          {!isOutOfStock ? (
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-full py-2.5 px-3 bg-[#352820] hover:bg-[#4b382b] active:bg-[#251b15] text-[#f0dc78] font-black text-xs uppercase tracking-wider rounded-none shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4 text-[#d8b538]" /> Comprar Ahora
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-2.5 px-3 bg-gray-100 text-gray-400 font-bold text-xs uppercase tracking-wider rounded-none cursor-not-allowed text-center border border-gray-200"
            >
              Sin Stock
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
