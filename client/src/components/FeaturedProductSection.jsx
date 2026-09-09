import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// FEATURED PRODUCTS DATA
// In the future this list can be fetched from the backend (e.g. GET /api/products?destacado=true)
// and passed as a prop or via context. For now it's hardcoded with one item.
// ─────────────────────────────────────────────────────────────────────────────
const FEATURED_PRODUCTS = [
  {
    id: 'arnes-luminoso',
    slug: 'arnes-luminoso',
    name: 'Arnés Luminoso',
    category: 'Arnés',
    tagline: 'Cuidá a quien más te ama. Dale seguridad en sus paseos nocturnos',
    price: 68000,
    priceLabel: '$68.000,00',
    discount: '10% de descuento pagando con Transferencia',
    description:
      'Iluminación LED de alta visibilidad 360° para paseos nocturnos seguros. Batería recargable vía USB y correas ajustables reforzadas para máxima comodidad.',
    image: 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1788907676/arns_transpa_jyyzwd.png',
    sizes: ['S', 'M', 'L', 'XL'],
    catalogSearch: 'Arnes',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE PRODUCT CARD
// ─────────────────────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${selectedSize.toLowerCase()}`,
      name: `${product.name} (Talle ${selectedSize})`,
      price: product.price,
      image: product.image,
      stock: 50,
      category: product.category,
    }, quantity);
  };

  return (
    <div className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center px-2 sm:px-4">

      {/* ── Image ── */}
      <div className="bg-white shadow-xs border border-[#cca32b]/30 p-6 sm:p-8 flex items-center justify-center aspect-square w-full max-w-md mx-auto">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain"
        />
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
          {product.priceLabel}
        </p>
        <p className="text-xs font-medium text-[#352820]/70 mt-0.5">
          {product.discount}
        </p>

        {/* Divider */}
        <div className="h-px bg-[#cca32b]/30 my-5" />

        {/* Size Selector */}
        {product.sizes.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-[#352820] mb-2 uppercase tracking-wide">
              Talle: <span className="font-extrabold">{selectedSize}</span>
            </p>
            <div className="flex items-center gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`w-11 h-11 font-bold text-sm flex items-center justify-center transition-all cursor-pointer border ${
                    selectedSize === size
                      ? 'bg-[#352820] text-white border-[#352820]'
                      : 'bg-transparent text-[#352820] border-[#352820]/60 hover:bg-[#352820]/10'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

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
            className="flex-1 h-11 bg-[#352820] hover:bg-[#4b382b] text-white font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer flex items-center justify-center border border-[#352820]"
          >
            Agregar al carrito
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-[#352820]/70 leading-relaxed mt-5">
          {product.description}
        </p>

        {/* See all link */}
        <div className="mt-4">
          <Link
            to={`/catalog?search=${product.catalogSearch}`}
            className="text-xs font-semibold text-[#352820] underline underline-offset-2 hover:text-[#d3ad2f] transition-colors"
          >
            Ver todos los {product.name}s →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN SECTION — horizontal scroll carousel
// ─────────────────────────────────────────────────────────────────────────────
export default function FeaturedProductSection() {
  const [current, setCurrent] = useState(0);
  const total = FEATURED_PRODUCTS.length;

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
          <div className="flex items-center justify-center gap-3 mt-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#352820] tracking-tight">
              {FEATURED_PRODUCTS[current].name}
            </h2>
            {/* Navigation arrows — only show if more than one product */}
            {total > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={prev}
                  className="w-7 h-7 flex items-center justify-center bg-[#352820]/10 hover:bg-[#352820]/20 text-[#352820] transition-colors cursor-pointer"
                  aria-label="Producto anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="w-7 h-7 flex items-center justify-center bg-[#352820]/10 hover:bg-[#352820]/20 text-[#352820] transition-colors cursor-pointer"
                  aria-label="Producto siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <p className="text-sm font-medium italic text-[#352820]/80 mt-1">
            {FEATURED_PRODUCTS[current].tagline}
          </p>
          {/* Dots indicator */}
          {total > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {FEATURED_PRODUCTS.map((_, i) => (
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

        {/* ── Carousel viewport ── */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
