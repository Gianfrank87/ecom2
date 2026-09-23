import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProductImages } from '../utils/productImages';

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE PRODUCT CARD — uses real data from database
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const images = useMemo(() => getProductImages(product), [product]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const previewTimer = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener?.('change', updatePreference);
    return () => mediaQuery.removeEventListener?.('change', updatePreference);
  }, []);

  useEffect(() => {
    if (!isPreviewing || prefersReducedMotion || images.length < 2) return undefined;
    previewTimer.current = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % images.length);
    }, 1400);
    return () => window.clearInterval(previewTimer.current);
  }, [images.length, isPreviewing, prefersReducedMotion]);

  useEffect(() => () => window.clearInterval(previewTimer.current), []);

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
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <article className="relative z-10 w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-12 items-center bg-[#fdfaf6] p-5 sm:p-8 lg:p-10">

      {/* ── Image ── */}
      <div className="flex items-center justify-center w-full min-w-0">
        <div className="relative flex items-center justify-center aspect-square w-full max-w-[520px] bg-[#f6efe2] border border-[#d8c9ae] p-6 sm:p-10 group">
          <img
            src={images[activeImage] || product.image}
            alt={product.name}
            className="w-full h-full object-contain drop-shadow-sm group-hover:drop-shadow-md transition-all duration-300"
            onMouseEnter={() => { if (images.length > 1 && !prefersReducedMotion) setIsPreviewing(true); }}
            onMouseLeave={() => { setIsPreviewing(false); setActiveImage(0); }}
            onError={() => setActiveImage(0)}
          />
        </div>
      </div>

      {/* ── Details ── */}
      <div className="relative z-10 flex flex-col justify-center w-full max-w-xl mx-auto md:mx-0 py-2 lg:py-5">
        <div className="mb-5 h-1 w-16 bg-[#b89420]" aria-hidden="true" />
        <span className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#a78665]">
          Producto destacado · {product.category}
        </span>

        {/* Name */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#352820] tracking-tight leading-[1.05]">
          {product.name}
        </h2>

        {/* Price */}
        <p className="text-2xl sm:text-3xl font-black text-[#352820] mt-4">
          {formatPrice(product.price)}
        </p>

        {/* Stock */}
        <p className={`text-sm font-semibold mt-1 ${product.stock > 0 ? 'text-[#4b382b]' : 'text-red-700'}`}>
          {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
        </p>

        {/* Divider */}
        <div className="h-px bg-[#d3ad2f]/40 my-6" />

        {/* Description */}
        <p className="text-sm text-[#4b382b]/85 leading-relaxed mb-6 line-clamp-4">
          {product.description}
        </p>

        {/* Qty + Add to cart — full-width row */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full">
          {/* Quantity */}
          <div className="flex min-h-12 justify-center sm:justify-start items-stretch border border-[#b89420] bg-transparent shrink-0">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-11 flex items-center justify-center text-base font-bold text-[#352820] border-r border-[#b89420] hover:bg-[#d3ad2f]/15 transition-colors cursor-pointer"
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
              className="w-11 flex items-center justify-center text-base font-bold text-[#352820] border-l border-[#b89420] hover:bg-[#d3ad2f]/15 transition-colors cursor-pointer"
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
            className={`flex-1 min-h-12 sm:min-h-0 h-12 font-extrabold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center border ${
              product.stock > 0
                ? 'bg-[#352820] hover:bg-[#4b382b] text-[#f0dc78] border-[#352820]'
                : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
            }`}
          >
            {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
          </button>
        </div>

        {/* See more link */}
        <div className="mt-5">
          <Link
            to={`/product/${product.id}`}
            className="text-sm font-bold text-[#a78665] underline underline-offset-4 hover:text-[#352820] transition-colors"
          >
            Ver más detalles →
          </Link>
        </div>
      </div>
    </article>
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
      className="relative w-full overflow-hidden border-t border-b border-[#b89420] bg-[#c9a43f] px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
    >
      <img
        src="https://res.cloudinary.com/dl3t6vykm/image/upload/v1790191299/pngegg_oi8uz1.png"
        alt=""
        className="pointer-events-none absolute bottom-5 right-7 z-0 hidden h-64 w-64 rotate-[-8deg] object-contain opacity-10 sm:block"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="overflow-hidden bg-[#fdfaf6] shadow-[0_18px_45px_rgba(53,40,32,0.14)]">
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${current * 100}%)` }}>
            {featuredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        </div>

        {total > 1 && (
          <>
            <button
              onClick={() => { prev(); setAutoRotate(false); setTimeout(() => setAutoRotate(true), 10000); }}
              className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[#352820]/20 bg-[#fdfaf6] text-[#352820] shadow-md transition-colors hover:bg-[#352820] hover:text-[#f0dc78] lg:flex"
              aria-label="Producto anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => { next(); setAutoRotate(false); setTimeout(() => setAutoRotate(true), 10000); }}
              className="absolute right-2 top-1/2 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center border border-[#352820]/20 bg-[#fdfaf6] text-[#352820] shadow-md transition-colors hover:bg-[#352820] hover:text-[#f0dc78] lg:flex"
              aria-label="Producto siguiente"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div className="mt-5 flex items-center justify-center gap-4">
          {total > 1 && (
            <button onClick={() => { prev(); setAutoRotate(false); setTimeout(() => setAutoRotate(true), 10000); }} className="inline-flex h-10 w-10 items-center justify-center border border-[#352820]/30 bg-[#fdfaf6] text-[#352820] transition-colors hover:bg-[#352820] hover:text-[#f0dc78] lg:hidden" aria-label="Producto anterior">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {total > 1 && (
            <div className="flex items-center gap-2" aria-label="Productos destacados">
              {featuredProducts.map((product, index) => (
                <button key={product.id} onClick={() => setCurrent(index)} className={`h-2 transition-all ${index === current ? 'w-8 bg-[#352820]' : 'w-2 bg-[#352820]/35'}`} aria-label={`Ir al producto ${index + 1}`} aria-current={index === current ? 'true' : undefined} />
              ))}
            </div>
          )}
          {total > 1 && (
            <button onClick={() => { next(); setAutoRotate(false); setTimeout(() => setAutoRotate(true), 10000); }} className="inline-flex h-10 w-10 items-center justify-center border border-[#352820]/30 bg-[#fdfaf6] text-[#352820] transition-colors hover:bg-[#352820] hover:text-[#f0dc78] lg:hidden" aria-label="Producto siguiente">
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
