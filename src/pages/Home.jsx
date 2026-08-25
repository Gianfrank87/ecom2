import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import FeaturedCategories from '../components/FeaturedCategories';
import ProductCard from '../components/ProductCard';
import OfertaCard from '../components/OfertaCard';
import { api } from '../services/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    api.getProducts()
      .then((data) => setFeaturedProducts(data.filter((p) => p.featured === true)))
      .catch((err) => console.error('Error al cargar productos destacados:', err));

    api.getActiveOffers()
      .then(setActiveOffers)
      .catch((err) => console.error('Error al cargar ofertas:', err));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <Hero />

      {/* Categories Grid */}
      <FeaturedCategories />

      {/* ─── Active Offers Section ─── */}
      {activeOffers.length > 0 && (
        <section className="mb-12">
          <div className="flex flex-col items-center justify-between mb-6 text-center sm:text-left sm:flex-row gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">🔥</span>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#382d24]">
                  Ofertas del Momento
                </h2>
              </div>
              <p className="text-gray-500 text-sm">
                Packs exclusivos al mejor precio — ¡por tiempo limitado!
              </p>
            </div>
            <Link to="/catalog" className="text-primary-600 hover:text-primary-700 font-display font-bold text-sm border-b border-primary-400 pb-0.5 transition-colors whitespace-nowrap">
              Ver catálogo completo
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeOffers.map((offer) => (
              <OfertaCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Grid */}
      <section className="mb-12">
        <div className="flex flex-col items-center justify-between mb-8 text-center sm:text-left sm:flex-row gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#382d24]">
              Productos Destacados
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Las opciones más elegidas por nuestra comunidad para consentir a sus mascotas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Extra Trust Section */}
      <section className="bg-sage-100 rounded-3xl p-8 mb-8 grid md:grid-cols-3 gap-6 text-center md:text-left border border-sage-200">
        <div className="space-y-2">
          <span className="text-3xl">🚚</span>
          <h3 className="font-display font-bold text-[#382d24]">Envíos Rápidos</h3>
          <p className="text-xs text-sage-800">Recibí tu pedido en la comodidad de tu hogar en menos de 24/48 horas.</p>
        </div>
        <div className="space-y-2 border-y md:border-y-0 md:border-x border-sage-200 py-6 md:py-0 md:px-6">
          <span className="text-3xl">🩺</span>
          <h3 className="font-display font-bold text-[#382d24]">Selección Veterinaria</h3>
          <p className="text-xs text-sage-800">Todos nuestros alimentos y artículos son recomendados por profesionales.</p>
        </div>
        <div className="space-y-2">
          <span className="text-3xl">💬</span>
          <h3 className="font-display font-bold text-[#382d24]">Atención Personalizada</h3>
          <p className="text-xs text-sage-800">¿Dudas sobre alimentación? Escribinos y te ayudamos a elegir el mejor producto.</p>
        </div>
      </section>
    </div>
  );
}
