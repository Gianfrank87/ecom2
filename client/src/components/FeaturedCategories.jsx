import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'alimentos', name: 'Alimentos', icon: '🍲', count: 'Perros & Gatos' },
  { id: 'accesorios', name: 'Accesorios', icon: '🦮', count: 'Collares & Camas' },
  { id: 'higiene', name: 'Higiene', icon: '🧼', count: 'Shampoos & Arenas' },
  { id: 'juguetes', name: 'Juguetes', icon: '🎾', count: 'Pelotas & Rascadores' },
  { id: 'salud', name: 'Salud', icon: '💊', count: 'Cuidado Especial' }
];

export default function FeaturedCategories() {
  return (
    <section className="mb-10 text-left">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#e52521]">Categorías Principales</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Explorá por categoría
          </h2>
        </div>
        <Link
          to="/catalog"
          className="text-xs font-extrabold text-[#e52521] hover:text-[#c91d19] uppercase tracking-wider underline underline-offset-4"
        >
          Ver catálogo completo &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/catalog?category=${cat.id}`}
            className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-[#e52521] hover:shadow-md transition-all duration-200 text-center flex flex-col items-center justify-between"
          >
            {/* Circle icon frame */}
            <div className="w-16 h-16 rounded-full bg-slate-50 border border-gray-100 flex items-center justify-center text-3xl mb-3 group-hover:scale-110 group-hover:bg-red-50 transition-transform">
              {cat.icon}
            </div>

            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-gray-900 group-hover:text-[#e52521] transition-colors">
                {cat.name}
              </h3>
              <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                {cat.count}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
