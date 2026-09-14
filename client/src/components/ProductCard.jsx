import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

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

  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-none border border-[#352820]/20 hover:border-[#352820] shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden text-left relative"
    >
      {/* ─── Imagen de Producto (llena todo el bloque sin padding) ─── */}
      <div className="relative aspect-[4/5] bg-[#f5f0e8] overflow-hidden">

        {/* Badge "Sin stock" */}
        {isOutOfStock && (
          <div className="absolute top-0 left-0 z-20">
            <span className="font-extrabold text-[10px] uppercase tracking-wider text-[#f0dc78] bg-black px-2.5 py-1 rounded-none">
              Sin stock
            </span>
          </div>
        )}

        {/* Badge "Destacado" */}
        {!isOutOfStock && product.featured && (
          <div className="absolute top-0 left-0 z-10">
            <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-none bg-[#352820] text-[#f0dc78]">
              Destacado
            </span>
          </div>
        )}

        {/* Fotografía cubriendo todo el espacio */}
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isOutOfStock ? 'opacity-50 grayscale-[30%]' : ''
          }`}
          loading="lazy"
        />
      </div>

      {/* ─── Info del producto ─── */}
      <div className="p-3.5 flex-grow flex flex-col justify-between gap-2 border-t border-[#352820]/10">
        {/* Nombre */}
        <h3 className="font-extrabold text-[13px] text-[#352820] line-clamp-2 leading-tight group-hover:text-[#a78665] transition-colors min-h-[2.2rem]">
          {product.name}
        </h3>

        {/* Precio + stock */}
        <div className="flex items-center justify-between">
          <span className="font-black text-lg text-[#352820] tracking-tight">
            {formatPrice(product.price)}
          </span>
          {!isOutOfStock && (
            <span className="text-[9px] font-black text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-none border border-emerald-200 flex items-center gap-0.5 uppercase tracking-wider">
              <CheckCircle2 className="w-2.5 h-2.5" /> Stock
            </span>
          )}
        </div>

        {/* CTA */}
        {!isOutOfStock ? (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="w-full py-2 bg-[#352820] hover:bg-[#4b382b] active:bg-[#251b15] text-[#f0dc78] font-black text-[11px] uppercase tracking-wider rounded-none transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-auto"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Agregar
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-2 bg-gray-100 text-gray-400 font-bold text-[11px] uppercase tracking-wider rounded-none cursor-not-allowed border border-gray-200 mt-auto"
          >
            Sin Stock
          </button>
        )}
      </div>
    </Link>
  );
}

