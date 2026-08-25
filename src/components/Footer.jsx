import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-accent-100 mt-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="font-display font-extrabold text-lg text-accent-800">
                Huellitas & Cía
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tu pet shop de confianza. Nos dedicamos a seleccionar los mejores productos del mercado para garantizar el bienestar de tus mejores amigos.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Navegación</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-gray-600 hover:text-accent-500 transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-600 hover:text-accent-500 transition-colors">Catálogo de Productos</Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-accent-500 transition-colors">Ver Carrito</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Categorías</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/catalog?category=alimentos" className="text-gray-600 hover:text-accent-500 transition-colors">Alimentos</Link>
              </li>
              <li>
                <Link to="/catalog?category=accesorios" className="text-gray-600 hover:text-accent-500 transition-colors">Accesorios</Link>
              </li>
              <li>
                <Link to="/catalog?category=higiene" className="text-gray-600 hover:text-accent-500 transition-colors">Higiene</Link>
              </li>
              <li>
                <Link to="/catalog?category=juguetes" className="text-gray-600 hover:text-accent-500 transition-colors">Juguetes</Link>
              </li>
            </ul>
          </div>

          {/* Contact Mockup */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest mb-4">Contacto</h3>
            <p className="text-xs text-gray-600">📍 Av. del Libertador 4500, Palermo</p>
            <p className="text-xs text-gray-600">📞 +54 11 4822 9300</p>
            <p className="text-xs text-gray-600">✉️ hola@huellitaspetshop.com</p>
          </div>
        </div>

        <hr className="border-gray-100 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-[11px] text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Huellitas & Cía. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-accent-500 cursor-pointer">Términos y Condiciones</span>
            <span className="hover:text-accent-500 cursor-pointer">Políticas de Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
