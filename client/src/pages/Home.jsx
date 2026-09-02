import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductCard from '../components/ProductCard';
import OfertaCard from '../components/OfertaCard';
import { api } from '../services/api';
import { Flame, ShieldCheck, Truck, Clock, Award } from 'lucide-react';

const BRAND_LOGO = 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1788385805/bcfaf7a1-7667-4d74-86ce-55d31c495037_nwhlov.jpg';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    api.getProducts()
      .then((data) => {
        const featured = data
          .filter((p) => p.featured === true)
          .sort((a, b) => (a.orden ?? Number(a.id)) - (b.orden ?? Number(b.id)));
        setFeaturedProducts(featured);
      })
      .catch((err) => console.error('Error al cargar productos destacados:', err));

    api.getActiveOffers()
      .then(setActiveOffers)
      .catch((err) => console.error('Error al cargar ofertas:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <Hero />

      {/* Categories Grid */}
      <FeaturedCategories />

      {/* ─── Official Brand ─── */}
      <section className="mb-12 overflow-hidden rounded-2xl bg-[#0f172a] text-white shadow-sm">
        <div className="grid min-h-[210px] items-center md:grid-cols-[1fr_1fr]">
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#f5b84d]">
              Marca oficial
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Nuestra marca oficial: NIGDIZ
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              Diseñada para acompañar cada paseo con seguridad, tecnología y estilo.
            </p>
            <Link
              to="/catalog?search=NIGDIZ"
              className="mt-5 inline-flex items-center rounded-lg bg-[#e52521] px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-white transition-colors hover:bg-[#c91d19]"
            >
              Ver productos NIGDIZ
            </Link>
          </div>

          <Link
            to="/catalog?search=NIGDIZ"
            aria-label="Ver productos de NIGDIZ"
            className="flex h-full min-h-[210px] items-center justify-center border-t border-white/10 bg-white px-8 py-6 transition-colors hover:bg-slate-50 md:border-l md:border-t-0"
          >
            <img
              src={BRAND_LOGO}
              alt="Logo de NIGDIZ"
              className="max-h-36 w-full max-w-sm object-contain"
            />
          </Link>
        </div>
      </section>

      {/* ─── Active Offers Section ─── */}
      {activeOffers.length > 0 && (
        <section className="mb-12 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#e52521]">Descuentos exclusivos</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Flame className="w-7 h-7 text-[#e52521]" />
                Ofertas del Momento
              </h2>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-extrabold text-[#e52521] hover:text-[#c91d19] uppercase tracking-wider underline underline-offset-4"
            >
              Ver catálogo completo &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeOffers.map((offer) => (
              <OfertaCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Featured Products Grid ─── */}
      <section className="mb-12 text-left">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#e52521]">Recomendados por Veterinarios</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Productos Destacados
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ─── Trust Section (MisPichos / Timberline style) ─── */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-8 grid md:grid-cols-3 gap-6 text-left shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 text-[#e52521] flex items-center justify-center shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 mb-1">Envíos Rápidos a Domicilio</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Despachamos tu pedido en menos de 24/48 horas para que a tu mascota nunca le falte nada.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 mb-1">Selección Veterinaria Premium</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Todos nuestros alimentos y artículos son probados y recomendados por profesionales.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-6">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-gray-900 mb-1">Compra 100% Segura</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Aceptamos Mercado Pago, tarjetas de crédito, débito y transferencia con 10% OFF.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
