import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Load product from database
  useEffect(() => {
    api.getProduct(id)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar producto:', err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50svh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center px-4">
        <div className="text-4xl mb-4">😿</div>
        <h2 className="font-display font-extrabold text-2xl text-gray-800 mb-2">Producto no encontrado</h2>
        <p className="text-gray-500 text-sm mb-6">Lo sentimos, el artículo solicitado no existe o fue dado de baja de nuestro catálogo.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-sm shadow-premium"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleIncrement = () => {
    if (quantity < (product.stock || 99)) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-accent-600 transition-colors mb-8 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>

      {/* Main Split Layout */}
      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl border border-accent-100 p-6 sm:p-8 lg:p-10 shadow-premium">
        
        {/* Left Column: Image */}
        <div className="md:col-span-6 flex items-center justify-center bg-[#fafaf6] rounded-2xl overflow-hidden aspect-square border border-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover max-h-[500px]"
          />
        </div>

        {/* Right Column: details */}
        <div className="md:col-span-6 flex flex-col justify-between text-left space-y-6">
          <div className="space-y-4">
            {/* Category */}
            <span className="inline-flex text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-accent-100 text-accent-800 w-fit">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-800 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Precio de venta</span>
              <span className="font-display font-black text-3xl text-accent-700 mt-1">
                {formatPrice(product.price)}
              </span>
            </div>

            <hr className="border-gray-100" />

            {/* Description */}
            <div>
              <h3 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest mb-2">
                Descripción
              </h3>
              <p className="text-gray-600 font-body text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <hr className="border-gray-100" />
            
            {/* Stock indicator */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-gray-400 uppercase tracking-wider font-bold">Disponibilidad:</span>
              {product.stock > 0 ? (
                <span className="text-sage-600 bg-sage-50 px-2 py-0.5 rounded border border-sage-100">
                  En Stock ({product.stock} unidades)
                </span>
              ) : (
                <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  Sin Stock
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Quantity Selector */}
                <div className="flex items-center justify-between border border-accent-100 rounded-2xl p-1 bg-primary-50 sm:w-36">
                  <button
                    onClick={handleDecrement}
                    className="p-2.5 hover:bg-white text-gray-500 hover:text-accent-600 rounded-xl transition-all cursor-pointer"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display font-bold text-base text-gray-800 w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="p-2.5 hover:bg-white text-gray-500 hover:text-accent-600 rounded-xl transition-all cursor-pointer"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center gap-2 px-6 py-4.5 rounded-2xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-sm tracking-wide shadow-md transition-all hover:translate-y-[-2px] cursor-pointer"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  Agregar al carrito
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-6 py-4.5 rounded-2xl bg-gray-100 text-gray-400 font-display font-bold text-sm cursor-not-allowed border border-gray-200"
              >
                Artículo Agotado
              </button>
            )}

            {/* Extra Benefits Info */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-sage-50/50 border border-sage-100 text-[11px] text-gray-600 font-medium">
                <Truck className="w-4 h-4 text-sage-500" />
                Entrega gratis comprando alimentos
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-sage-50/50 border border-sage-100 text-[11px] text-gray-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-sage-500" />
                Devoluciones simples por 30 días
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
