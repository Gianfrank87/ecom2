import React, { useState } from 'react';

const CONTACT_INFO = [
  {
    icon: (
      // WhatsApp
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.118 1.528 5.845L0 24l6.347-1.502A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.213-3.727.882.93-3.618-.235-.372A9.818 9.818 0 1112 21.818z"/>
      </svg>
    ),
    label: 'WhatsApp',
    value: '+54 9 3446 373972',
    href: 'https://wa.me/5493446373972',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.0 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    label: 'Teléfono',
    value: '03446 373972',
    href: 'tel:03446373972',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Email',
    value: 'sehola.negocio@gmail.com',
    href: 'mailto:sehola.negocio@gmail.com',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Dirección',
    value: 'Rawson 622 · Gualeguaychú, Entre Ríos',
    href: 'https://maps.google.com/?q=Rawson+622+Gualeguaychú+Entre+Ríos',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function ContactSection() {
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', mensaje: '' });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Sin funcionalidad real aún — solo visual
  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <section
      id="contacto-section"
      className="w-full bg-[#d3ad2f] py-20 px-4"
    >
      <div className="max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#352820]/70 mb-3">
            Estamos para ayudarte
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#352820] mb-3 leading-tight">
            Contáctanos
          </h2>
          <p className="text-[#352820]/80 text-sm max-w-lg mx-auto leading-relaxed">
            Consultanos ante cualquier duda que te surja sobre nuestros productos.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#352820]/30" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#352820]" />
            <div className="h-px w-12 bg-[#352820]/30" />
          </div>
        </div>

        {/* ── Contact Info Pills ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          {CONTACT_INFO.map((item) => (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#b89420]/30 hover:bg-[#b89420]/50 border border-[#b89420]/40 px-4 py-3 transition-all duration-200 group"
            >
              <span className="text-[#352820] group-hover:scale-110 transition-transform flex-shrink-0">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#352820]/60">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-[#352820] truncate">
                  {item.value}
                </p>
              </div>
            </a>
          ))}
        </div>

        {/* ── Form Card ── */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#c9a428]/20 border border-[#b89420]/40 p-6 sm:p-8 space-y-5"
        >
          {/* Nombre */}
          <div>
            <label htmlFor="contact-nombre" className="block text-xs font-bold uppercase tracking-wider text-[#352820] mb-1.5">
              Nombre
            </label>
            <input
              id="contact-nombre"
              name="nombre"
              type="text"
              placeholder="ej.: María Pérez"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/70 border border-[#b89420]/50 text-[#352820] placeholder-[#352820]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#352820] focus:bg-white transition-all"
            />
          </div>

          {/* Email + Teléfono en fila */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-[#352820] mb-1.5">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="ej.: tuemail@email.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/70 border border-[#b89420]/50 text-[#352820] placeholder-[#352820]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#352820] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label htmlFor="contact-telefono" className="block text-xs font-bold uppercase tracking-wider text-[#352820] mb-1.5">
                Teléfono
              </label>
              <input
                id="contact-telefono"
                name="telefono"
                type="tel"
                placeholder="ej.: 1123445567"
                value={form.telefono}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/70 border border-[#b89420]/50 text-[#352820] placeholder-[#352820]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#352820] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Mensaje */}
          <div>
            <label htmlFor="contact-mensaje" className="block text-xs font-bold uppercase tracking-wider text-[#352820] mb-1.5">
              Mensaje
            </label>
            <textarea
              id="contact-mensaje"
              name="mensaje"
              rows={5}
              placeholder="ej.: Tu mensaje..."
              value={form.mensaje}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/70 border border-[#b89420]/50 text-[#352820] placeholder-[#352820]/40 text-sm focus:outline-none focus:ring-2 focus:ring-[#352820] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-[#352820] text-white text-sm font-bold uppercase tracking-widest hover:bg-[#4b382b] active:bg-[#2a1f17] transition-all duration-200"
          >
            Enviar mensaje
          </button>
        </form>

      </div>
    </section>
  );
}
