import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
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

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-3xl border border-accent-100 overflow-hidden flex flex-col justify-between shadow-premium shadow-premium-hover transition-all duration-300 relative"
    >
      {/* Category Badge */}
      <span className="absolute top-3 left-3 z-10 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-sage-600 shadow-sm border border-gray-150 backdrop-blur-sm">
        {product.category}
      </span>

      {/* Product Image Frame */}
      <div className="relative overflow-hidden aspect-square bg-[#fafaf6] flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-[#382d24]/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="font-display font-bold text-xs uppercase tracking-widest text-white px-3 py-1.5 border border-white rounded-lg">
              Sin Stock
            </span>
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="font-display font-bold text-sm sm:text-base text-gray-800 line-clamp-2 mb-2 group-hover:text-accent-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider -mb-0.5">Precio</span>
            <span className="font-display font-extrabold text-base sm:text-lg text-accent-700">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Quick Add Button */}
          {product.stock > 0 ? (
            <button
              onClick={handleQuickAdd}
              className="p-2.5 bg-accent-100 hover:bg-accent-500 text-accent-800 hover:text-white rounded-2xl transition-all duration-300 hover:rotate-6 flex items-center justify-center cursor-pointer shadow-sm"
              title="Agregar al carrito"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
            </button>
          ) : (
            <button
              disabled
              className="p-2.5 bg-gray-100 text-gray-400 rounded-2xl cursor-not-allowed"
              title="Agotado"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
