import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="space-y-3 col-span-1 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#e52521] flex items-center justify-center text-white font-black text-sm">
                🐾
              </div>
              <span className="font-extrabold text-lg text-gray-900">
                Huellitas<span className="text-[#e52521]">&amp;</span>Cía
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">
              Tu pet shop online de confianza. Alimentos súper premium y artículos seleccionados para el cuidado integral de tu mascota.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-widest mb-4">Navegación</h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/" className="text-gray-600 hover:text-[#e52521] transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/catalog" className="text-gray-600 hover:text-[#e52521] transition-colors">Catálogo Completo</Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-600 hover:text-[#e52521] transition-colors">Ver Carrito</Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-widest mb-4">Categorías</h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/catalog?category=alimentos" className="text-gray-600 hover:text-[#e52521] transition-colors">Alimentos</Link>
              </li>
              <li>
                <Link to="/catalog?category=accesorios" className="text-gray-600 hover:text-[#e52521] transition-colors">Accesorios</Link>
              </li>
              <li>
                <Link to="/catalog?category=higiene" className="text-gray-600 hover:text-[#e52521] transition-colors">Higiene</Link>
              </li>
              <li>
                <Link to="/catalog?category=juguetes" className="text-gray-600 hover:text-[#e52521] transition-colors">Juguetes</Link>
              </li>
            </ul>
          </div>

          {/* Contact & Payments */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-widest mb-4">Medios de Pago</h3>
            <div className="flex flex-wrap gap-2 text-[10px] font-black text-gray-600">
              <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">VISA</span>
              <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">Mastercard</span>
              <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded">Mercado Pago</span>
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">Transferencia 10% OFF</span>
            </div>
            <p className="text-xs text-gray-500 pt-2 font-medium">📍 Av. del Libertador 4500, Palermo</p>
            <p className="text-xs text-gray-500 font-medium">✉️ contacto@huellitascia.com.ar</p>
          </div>
        </div>

        <hr className="border-gray-200 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} Huellitas &amp; Cía Pet Shop. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#e52521] cursor-pointer">Términos y Condiciones</span>
            <span className="hover:text-[#e52521] cursor-pointer">Políticas de Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
