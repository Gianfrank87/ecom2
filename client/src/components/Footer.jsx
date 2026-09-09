import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#352820] text-white border-t border-[#4b382b] mt-0 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Logo & About */}
          <div className="space-y-3 col-span-1 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d3ad2f] flex items-center justify-center font-black text-sm text-[#352820]">
                🐾
              </div>
              <span className="font-extrabold text-lg text-white">
                NIGDIZ
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-medium">
              Artículos de seguridad para mascotas. Diseñados para protegerlos en cada paseo.
            </p>
            <p className="text-[11px] text-white/40 italic">
              "Más seguro para ellos, tranquilidad para vos"
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-extrabold text-xs text-[#d3ad2f] uppercase tracking-widest mb-4">Navegación</h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/" className="text-white/70 hover:text-[#d3ad2f] transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/catalog" className="text-white/70 hover:text-[#d3ad2f] transition-colors">Catálogo Completo</Link>
              </li>
              <li>
                <Link to="/cart" className="text-white/70 hover:text-[#d3ad2f] transition-colors">Ver Carrito</Link>
              </li>
              <li>
                <Link to="/mis-pedidos" className="text-white/70 hover:text-[#d3ad2f] transition-colors">Mis Pedidos</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-extrabold text-xs text-[#d3ad2f] uppercase tracking-widest mb-4">Contacto</h3>
            <ul className="space-y-2 text-xs font-semibold text-white/70">
              <li>📱 +54 9 3446 373972</li>
              <li>✉️ sehola.negocio@gmail.com</li>
              <li>📍 Rawson 622 · Gualeguaychú, Entre Ríos</li>
            </ul>
          </div>

          {/* Medios de pago */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-[#d3ad2f] uppercase tracking-widest mb-4">Medios de Pago</h3>
            <div className="flex flex-wrap gap-2 text-[10px] font-black">
              <span className="px-2 py-1 bg-white/10 border border-white/20 text-white/80">VISA</span>
              <span className="px-2 py-1 bg-white/10 border border-white/20 text-white/80">Mastercard</span>
              <span className="px-2 py-1 bg-white/10 border border-white/20 text-white/80">Mercado Pago</span>
              <span className="px-2 py-1 bg-[#d3ad2f]/20 border border-[#d3ad2f]/40 text-[#d3ad2f]">Transferencia 10% OFF</span>
              <span className="px-2 py-1 bg-white/10 border border-white/20 text-white/80">Efectivo</span>
            </div>
          </div>
        </div>

        <hr className="border-white/10 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-white/30 gap-4">
          <p>© {new Date().getFullYear()} NIGDIZ. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#d3ad2f] cursor-pointer transition-colors">Términos y Condiciones</span>
            <span className="hover:text-[#d3ad2f] cursor-pointer transition-colors">Políticas de Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
