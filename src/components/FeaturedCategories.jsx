import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  {
    id: 'alimentos',
    name: 'Alimentos',
    description: 'Comida húmeda, seca y snacks naturales',
    icon: '🍖',
    bgClass: 'bg-gradient-to-br from-[#f9f5e8] to-[#e7d5a5]/30',
    borderClass: 'border-[#e7d5a5]/40',
    iconBg: 'bg-[#e7d5a5]/50',
    textColor: 'text-primary-800'
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    description: 'Collares, correas, camas y platos',
    icon: '🦮',
    bgClass: 'bg-gradient-to-br from-[#f6eedc] to-[#ebd8bd]/30',
    borderClass: 'border-[#ebd8bd]/40',
    iconBg: 'bg-[#ebd8bd]/50',
    textColor: 'text-accent-800'
  },
  {
    id: 'higiene',
    name: 'Higiene',
    description: 'Shampoos, cepillos y arenas sanitarias',
    icon: '🧼',
    bgClass: 'bg-gradient-to-br from-[#eef3f0] to-[#b5cdc0]/30',
    borderClass: 'border-[#b5cdc0]/40',
    iconBg: 'bg-[#b5cdc0]/50',
    textColor: 'text-sage-800'
  },
  {
    id: 'juguetes',
    name: 'Juguetes',
    description: 'Pelotas, rascadores y juegos didácticos',
    icon: '🥎',
    bgClass: 'bg-gradient-to-br from-[#fafaf6] to-[#d7d7c1]/30',
    borderClass: 'border-[#d7d7c1]/40',
    iconBg: 'bg-[#d7d7c1]/50',
    textColor: 'text-[#5a5a3a]'
  },
  {
    id: 'salud',
    name: 'Salud',
    description: 'Medicamentos, vitaminas y cuidado especial',
    icon: '💊',
    bgClass: 'bg-gradient-to-br from-[#fdfcf7] to-[#c69b82]/20',
    borderClass: 'border-[#c69b82]/30',
    iconBg: 'bg-[#c69b82]/35',
    textColor: 'text-[#744233]'
  }
];

export default function FeaturedCategories() {
  return (
    <section className="mb-12">
      <div className="flex flex-col items-center justify-between mb-8 text-center sm:text-left sm:flex-row gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#382d24]">
            Explorar por Categoría
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Encuentra exactamente lo que tu fiel compañero necesita hoy.
          </p>
        </div>
        <Link
          to="/catalog"
          className="text-accent-600 hover:text-accent-700 font-display font-bold text-sm transition-colors border-b border-accent-600 pb-0.5 hover:border-accent-700"
        >
          Ver todo el catálogo
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/catalog?category=${cat.id}`}
            className={`group rounded-2xl p-5 border text-center flex flex-col items-center justify-between shadow-premium shadow-premium-hover transition-all duration-300 ${cat.bgClass} ${cat.borderClass}`}
          >
            <div className={`w-14 h-14 rounded-2xl ${cat.iconBg} flex items-center justify-center text-3xl mb-4 transform group-hover:scale-110 transition-transform duration-200`}>
              {cat.icon}
            </div>
            
            <div className="flex-grow flex flex-col justify-center">
              <h3 className={`font-display font-bold text-base ${cat.textColor} mb-1`}>
                {cat.name}
              </h3>
              <p className="text-gray-500 text-[11px] leading-snug line-clamp-2 px-1">
                {cat.description}
              </p>
            </div>
            
            <span className="mt-4 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-gray-400 group-hover:bg-accent-500 group-hover:text-white transition-all duration-300 text-sm font-bold shadow-sm">
              →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
