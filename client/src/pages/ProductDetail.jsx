import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, ShieldCheck, Truck, X, Maximize2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { getProductImages } from '../utils/productImages';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Load product from database
  useEffect(() => {
    api.getProduct(id)
      .then((data) => {
        setProduct(data);
        setSelectedImageIndex(0);
        setIsZoomOpen(false);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error al cargar producto:', err);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!isZoomOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsZoomOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isZoomOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50svh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#352820]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center px-4">
        <div className="text-4xl mb-4">😿</div>
        <h2 className="font-extrabold text-2xl text-gray-900 mb-2">Producto no encontrado</h2>
        <p className="text-gray-500 text-sm mb-6">Lo sentimos, el artículo solicitado no existe o fue dado de baja de nuestro catálogo.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-none bg-[#352820] hover:bg-[#4b382b] text-[#f0dc78] font-bold text-sm"
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

  const images = getProductImages(product);
  const selectedImage = images[selectedImageIndex] || product.image;

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
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#352820] transition-colors mb-8 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
        Volver
      </button>

      {/* Main Split Layout */}
      <div className="grid md:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-none border border-gray-200 p-4 sm:p-8 lg:p-10 shadow-xs">
        
        {/* Left Column: Image gallery */}
        <div className="md:col-span-6 min-w-0 space-y-3">
          <div className="relative flex items-center justify-center bg-white rounded-none overflow-hidden aspect-square border border-gray-200 p-4 sm:p-6">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-contain max-h-[450px]"
              onError={() => setSelectedImageIndex(0)}
            />
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute right-3 top-3 inline-flex items-center justify-center w-10 h-10 bg-white/95 border border-gray-300 text-[#352820] hover:bg-[#352820] hover:text-[#f0dc78] transition-colors cursor-pointer"
              aria-label="Ampliar imagen"
              title="Ampliar imagen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Imágenes del producto">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 border p-1 bg-white transition-colors cursor-pointer ${selectedImageIndex === index ? 'border-[#352820] ring-2 ring-[#d3ad2f]' : 'border-gray-200 hover:border-[#a78665]'}`}
                  aria-label={`Ver imagen ${index + 1}`}
                  aria-current={selectedImageIndex === index ? 'true' : undefined}
                >
                  <img src={image} alt="" className="w-full h-full object-contain" onError={(event) => { event.currentTarget.style.opacity = '0.35'; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: details */}
        <div className="min-w-0 md:col-span-6 flex flex-col justify-between text-left space-y-6">
          <div className="space-y-4">
            {/* Category */}
            <span className="inline-flex text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-none bg-[#352820] text-[#f0dc78] w-fit">
              {product.category}
            </span>

            {/* Title */}
            <h1 className="font-extrabold text-2xl sm:text-3xl text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Precio de venta</span>
              <span className="font-black text-3xl text-[#352820] mt-1">
                {formatPrice(product.price)}
              </span>
            </div>

            <hr className="border-gray-100" />

            {/* Description */}
            <div>
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest mb-2">
                Descripción
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {product.description}
              </p>
            </div>
            
            <hr className="border-gray-100" />
            
            {/* Stock indicator */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
              <span className="text-gray-400 uppercase tracking-wider font-bold">Disponibilidad:</span>
              {product.stock > 0 ? (
                <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-none border border-emerald-200 font-bold">
                  En Stock ({product.stock} unidades)
                </span>
              ) : (
                <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-none border border-red-200 font-bold">
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
                <div className="flex items-center justify-between border border-gray-300 rounded-none p-1 bg-gray-50 sm:w-36">
                  <button
                    onClick={handleDecrement}
                    className="p-2.5 hover:bg-gray-200 text-gray-700 rounded-none transition-all cursor-pointer disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-base text-gray-900 w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    className="p-2.5 hover:bg-gray-200 text-gray-700 rounded-none transition-all cursor-pointer disabled:opacity-30"
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddToCart}
                  className="flex-grow flex items-center justify-center gap-2 px-6 py-4 rounded-none bg-[#352820] hover:bg-[#4b382b] text-[#f0dc78] font-extrabold text-xs uppercase tracking-wider shadow-none transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  Agregar al carrito
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-none bg-gray-100 text-gray-400 font-extrabold text-xs uppercase tracking-wider cursor-not-allowed border border-gray-200"
              >
                Artículo Agotado
              </button>
            )}

            {/* Extra Benefits Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 p-3 rounded-none bg-gray-50 border border-gray-200 text-[11px] text-gray-700 font-semibold">
                <Truck className="w-4 h-4 text-[#352820]" />
                Envío gratis en compras seleccionadas
              </div>
              <div className="flex items-center gap-2 p-3 rounded-none bg-gray-50 border border-gray-200 text-[11px] text-gray-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#352820]" />
                Garantía directa de NigDiz
              </div>
            </div>
          </div>
        </div>
      </div>
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-[70] bg-[#352820]/85 flex items-center justify-center p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`Imagen ampliada de ${product.name}`}
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute right-4 top-4 inline-flex items-center justify-center w-11 h-11 bg-white text-[#352820] hover:bg-[#f0dc78] cursor-pointer"
            aria-label="Cerrar imagen ampliada"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={selectedImage}
            alt={product.name}
            className="max-w-full max-h-[90dvh] object-contain"
            onClick={(event) => event.stopPropagation()}
            onError={() => setSelectedImageIndex(0)}
          />
        </div>
      )}
    </div>
  );
}
