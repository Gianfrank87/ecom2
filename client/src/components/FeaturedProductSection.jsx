import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE PRODUCT CARD — uses real data from database
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      category: product.category,
    }, quantity);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(price / 100);
  };

  return (
    <div className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center px-2 sm:px-4">

      {/* ── Image ── */}
      <div className="flex items-center justify-center w-full max-w-md mx-auto">
        <div className="bg-gradient-to-br from-[#f8f6f0] to-[#f0ede5] shadow-lg hover:shadow-2xl border-2 border-[#d3ad2f]/40 hover:border-[#d3ad2f]/80 p-8 sm:p-10 flex items-center justify-center aspect-square w-full rounded-2xl transition-all duration-300 transform hover:scale-105 group">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
          />
        </div>
      </div>

      {/* ── Details ── */}
      <div className="flex flex-col justify-center w-full max-w-md mx-auto md:mx-0">
        {/* Badge */}
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.15em] text-[#352820]/60 mb-1">
          {product.category}
        </span>

        {/* Name */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#352820] tracking-tight leading-tight">
          {product.name}
        </h2>

        {/* Price */}
        <p className="text-xl font-bold text-[#352820] mt-2">
          {formatPrice(product.price)}
        </p>

        {/* Stock */}
        <p className={`text-xs font-medium mt-0.5 ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
          {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
        </p>

        {/* Divider */}
        <div className="h-px bg-[#cca32b]/30 my-5" />

        {/* Description */}
        <p className="text-xs text-[#352820]/70 leading-relaxed mb-5">
          {product.description}
        </p>

        {/* Qty + Add to cart — full-width row */}
        <div className="flex items-stretch gap-0 w-full">
          {/* Quantity */}
          <div className="flex items-stretch border border-[#352820] bg-transparent shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 flex items-center justify-center text-base font-bold text-[#352820] border-r border-[#352820] hover:bg-[#352820]/10 transition-colors cursor-pointer"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span className="w-12 flex items-center justify-center font-bold text-sm text-[#352820]">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-11 flex items-center justify-center text-base font-bold text-[#352820] border-l border-[#352820] hover:bg-[#352820]/10 transition-colors cursor-pointer"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          {/* Add to cart — takes remaining width */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`flex-1 h-11 font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center border ${
              product.stock > 0
                ? 'bg-[#352820] hover:bg-[#4b382b] text-white border-[#352820]'
                : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
          </button>
        </div>

        {/* See more link */}
        <div className="mt-4">
          <Link
            to={`/product/${product.id}`}
            className="text-xs font-semibold text-[#352820] underline underline-offset-2 hover:text-[#d3ad2f] transition-colors"
          >
            Ver más detalles →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SECTION — horizontal scroll carousel
// Loads featured products dynamically from the API
// ─────────────────────────────────────────────────────────────────────────────
export default function FeaturedProductSection() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  // Load featured products from API
  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await api.getProducts();
        const featured = products.filter((p) => p.featured === true);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error loading featured products:', error);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    if (!autoRotate || featuredProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % featuredProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate, featuredProducts.length]);

  // If no featured products, don't render section
  if (loading) return null;
  if (featuredProducts.length === 0) return null;

  const total = featuredProducts.length;
  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);

  return (
    <section
      id="featured-product-section"
      className="w-full bg-[#d8b538] py-10 sm:py-14 px-4 sm:px-6 lg:px-8 border-t border-b border-[#cca32b]"
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#352820]/60">
            Producto Destacado
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#352820] tracking-tight mt-2">
            {featuredProducts[current].name}
          </h2>
          
          {/* Dots indicator */}
          {total > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {featuredProducts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 transition-all cursor-pointer ${
                    i === current ? 'w-5 bg-[#352820]' : 'w-1.5 bg-[#352820]/30'
                  }`}
                  aria-label={`Ir al producto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Carousel viewport with side arrows ── */}
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Left arrow */}
          {total > 1 && (
            <button
              onClick={() => {
                prev();
                setAutoRotate(false);
                setTimeout(() => setAutoRotate(true), 10000);
              }}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#352820] hover:bg-[#4b382b] text-white transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-md"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Carousel content */}
          <div className="overflow-hidden flex-1">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>

          {/* Right arrow */}
          {total > 1 && (
            <button
              onClick={() => {
                next();
                setAutoRotate(false);
                setTimeout(() => setAutoRotate(true), 10000);
              }}
              className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#352820] hover:bg-[#4b382b] text-white transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-md"
              aria-label="Producto siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
