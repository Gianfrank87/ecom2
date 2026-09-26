import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

const DEFAULT_STORE_CONFIG = {
  name: 'NigDiz',
  whatsapp: '+54 9 3446 373972',
  contactEmail: 'sehola.negocio@gmail.com',
  instagramUrl: 'https://www.instagram.com/sehola.negocio/',
  address: 'Rawson 622 - Gualeguaychu, Entre Rios',
  businessHours: '',
  footerText: 'Articulos de seguridad para mascotas. Disenados para protegerlos en cada paseo.',
};

const buildWhatsappHref = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : '';
};

const buildMapsHref = (value) => {
  const address = String(value || '').trim();
  return address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : '';
};

export default function Footer() {
  const [storeConfig, setStoreConfig] = useState(DEFAULT_STORE_CONFIG);

  useEffect(() => {
    let ignore = false;
    api.getStoreConfig()
      .then((config) => {
        if (!ignore) setStoreConfig({ ...DEFAULT_STORE_CONFIG, ...config });
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  const brandName = storeConfig.name || DEFAULT_STORE_CONFIG.name;
  const whatsappHref = buildWhatsappHref(storeConfig.whatsapp);
  const mapsHref = buildMapsHref(storeConfig.address);
  const instagramUrl = storeConfig.instagramUrl || DEFAULT_STORE_CONFIG.instagramUrl;

  return (
    <footer className="bg-[#352820] text-white border-t border-[#4b382b] mt-0 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 col-span-1 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#d3ad2f] flex items-center justify-center font-black text-sm text-[#352820]">
                ND
              </div>
              <span className="font-extrabold text-lg text-white">
                {brandName.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-white/60 leading-relaxed font-medium">
              {storeConfig.footerText || DEFAULT_STORE_CONFIG.footerText}
            </p>
            <p className="text-[11px] text-white/40 italic">
              "Mas seguro para ellos, tranquilidad para vos"
            </p>
          </div>

          <div>
            <h3 className="font-extrabold text-xs text-[#d3ad2f] uppercase tracking-widest mb-4">Navegacion</h3>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/" className="text-white/70 hover:text-[#d3ad2f] transition-colors">Inicio</Link>
              </li>
              <li>
                <Link to="/catalog" className="text-white/70 hover:text-[#d3ad2f] transition-colors">Catalogo Completo</Link>
              </li>
              <li>
                <Link to="/cart" className="text-white/70 hover:text-[#d3ad2f] transition-colors">Ver Carrito</Link>
              </li>
              <li>
                <Link to="/mis-pedidos" className="text-white/70 hover:text-[#d3ad2f] transition-colors">Mis Pedidos</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-extrabold text-xs text-[#d3ad2f] uppercase tracking-widest mb-4">Contacto</h3>
            <ul className="space-y-2 text-xs font-semibold text-white/70">
              {storeConfig.whatsapp && (
                <li>
                  <a href={whatsappHref || undefined} target="_blank" rel="noopener noreferrer" className="hover:text-[#d3ad2f] transition-colors">
                    WhatsApp: {storeConfig.whatsapp}
                  </a>
                </li>
              )}
              {storeConfig.contactEmail && (
                <li>
                  <a href={`mailto:${storeConfig.contactEmail}`} className="hover:text-[#d3ad2f] transition-colors">
                    Email: {storeConfig.contactEmail}
                  </a>
                </li>
              )}
              {instagramUrl && (
                <li className="pt-2">
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Seguir a Se Hola Negocio en Instagram"
                    className="group inline-flex items-center gap-3 border border-white/15 bg-white/5 px-3 py-2.5 text-white transition-all hover:border-[#d3ad2f]/70 hover:bg-[#d3ad2f]/10 hover:text-[#f0dc78]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center bg-[#d3ad2f] text-[#352820] transition-transform group-hover:scale-105">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="18" height="18" x="3" y="3" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[10px] font-bold uppercase tracking-widest text-white/45">Seguinos en Instagram</span>
                      <span className="block text-sm font-extrabold">@sehola.negocio</span>
                    </span>
                  </a>
                </li>
              )}
              {storeConfig.address && (
                <li>
                  <a href={mapsHref || undefined} target="_blank" rel="noopener noreferrer" className="hover:text-[#d3ad2f] transition-colors">
                    Direccion: {storeConfig.address}
                  </a>
                </li>
              )}
              {storeConfig.businessHours && <li>Horarios: {storeConfig.businessHours}</li>}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-extrabold text-xs text-[#d3ad2f] uppercase tracking-widest mb-4">Medios de Pago</h3>
            <div className="flex flex-wrap gap-2 text-[10px] font-black">
              <span className="px-2 py-1 bg-white/10 border border-white/20 text-white/80">VISA</span>
              <span className="px-2 py-1 bg-white/10 border border-white/20 text-white/80">Mastercard</span>
              <span className="px-2 py-1 bg-white/10 border border-white/20 text-white/80">Mercado Pago</span>
              <span className="px-2 py-1 bg-[#d3ad2f]/20 border border-[#d3ad2f]/40 text-[#d3ad2f]">Transferencia</span>
              <span className="px-2 py-1 bg-white/10 border border-white/20 text-white/80">Efectivo</span>
            </div>
          </div>
        </div>

        <hr className="border-white/10 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-white/30 gap-4">
          <p>© {new Date().getFullYear()} {brandName.toUpperCase()}. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#d3ad2f] cursor-pointer transition-colors">Terminos y Condiciones</span>
            <span className="hover:text-[#d3ad2f] cursor-pointer transition-colors">Politicas de Privacidad</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
