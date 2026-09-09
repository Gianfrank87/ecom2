import React, { useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// DATA — estructura migrable a `configuraciones` (clave: "guia_talles") o a
// tabla propia en el futuro sin cambiar el componente.
// ─────────────────────────────────────────────────────────────────────────────
const SIZE_GUIDES = [
  {
    id: 'arnes',
    nombre: 'Arnés Luminoso / Reflectante',
    recomendacion:
      'Medí el contorno del pecho de tu perro antes de comprar. Si la medida está entre dos talles, elegí el mayor para un ajuste más cómodo.',
    columnas: ['Talle', 'Cuello / Cintura (cm)', 'Pecho (cm)', 'Peso recomendado (kg)'],
    filas: [
      { talle: 'S',  valores: ['30-40', '40-55',  '4-7,5']    },
      { talle: 'M',  valores: ['35-50', '50-70',  '7,5-17,5'] },
      { talle: 'L',  valores: ['40-60', '60-90',  '17,5-22,5']},
      { talle: 'XL', valores: ['45-75', '65-100', '22,5-45']  },
    ],
  },
  {
    id: 'collar',
    nombre: 'Collares Luminosos',
    recomendacion:
      'Medí el contorno del cuello de tu mascota antes de comprar. Si la medida está entre dos talles, elegí el mayor para un ajuste más cómodo.',
    columnas: ['Talle', 'Cuello (cm)'],
    filas: [
      { talle: 'S',  valores: [''] },
      { talle: 'M',  valores: [''] },
      { talle: 'L',  valores: [''] },
      { talle: 'XL', valores: [''] },
    ],
  },
  {
    id: 'correa',
    nombre: 'Correas de Seguridad para Automóvil',
    recomendacion: null,
    columnas: ['Talle o Número', 'Largo'],
    filas: [
      { talle: '1', valores: [''] },
      { talle: '2', valores: [''] },
      { talle: '3', valores: [''] },
    ],
  },
  {
    id: 'correa-paseo',
    nombre: 'Correas de Paseo Reflectantes',
    recomendacion: null,
    columnas: ['Talle o Número', 'Largo'],
    filas: [
      { talle: '1', valores: [''] },
      { talle: '2', valores: [''] },
      { talle: '3', valores: [''] },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function SizeGuideSection() {
  const [activeTab, setActiveTab] = useState(SIZE_GUIDES[0].id);
  const active = SIZE_GUIDES.find((g) => g.id === activeTab);

  return (
    <section
      id="guia-de-talles-section"
      className="w-full bg-[#f8f4ec] py-20 px-4"
    >
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-[#d3ad2f] mb-3">
            Medidas de referencia
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#352820] mb-3 leading-tight">
            Guía de Talles
          </h2>
          <p className="text-[#4b382b] text-sm max-w-lg mx-auto leading-relaxed">
            Encontrá el talle ideal para tu mascota. Si tenés dudas,
            siempre elegí el talle mayor.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-[#d3ad2f]/40" />
            <div className="h-1.5 w-1.5 rounded-full bg-[#d3ad2f]" />
            <div className="h-px w-12 bg-[#d3ad2f]/40" />
          </div>
        </div>

        {/* ── Tabs — desktop pills ── */}
        <div className="hidden sm:flex flex-wrap justify-center gap-2 mb-8">
          {SIZE_GUIDES.map((guide) => (
            <button
              key={guide.id}
              onClick={() => setActiveTab(guide.id)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border transition-all duration-200
                ${activeTab === guide.id
                  ? 'bg-[#352820] text-[#d3ad2f] border-[#352820] shadow-sm'
                  : 'bg-white text-[#352820] border-[#c8bca8] hover:border-[#352820] hover:bg-white'
                }`}
            >
              {guide.nombre}
            </button>
          ))}
        </div>

        {/* ── Tabs — mobile select ── */}
        <div className="sm:hidden mb-6">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-[#c8bca8] text-sm font-semibold text-[#352820] appearance-none focus:outline-none focus:ring-2 focus:ring-[#d3ad2f] focus:border-transparent"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23352820' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
          >
            {SIZE_GUIDES.map((guide) => (
              <option key={guide.id} value={guide.id}>{guide.nombre}</option>
            ))}
          </select>
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white border border-[#e0d5c5] shadow-sm overflow-hidden">

          {/* Card header strip */}
          <div className="bg-[#352820] px-6 py-4 flex items-center justify-between">
            <h3 className="text-white font-bold text-base sm:text-lg tracking-wide">
              {active.nombre}
            </h3>
            <span className="text-[#d3ad2f] text-xl">📏</span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              {/* thead */}
              <thead>
                <tr className="bg-[#fdf9f0] border-b-2 border-[#d3ad2f]">
                  {active.columnas.map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-[#352820] whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* tbody */}
              <tbody>
                {active.filas.map((fila, idx) => (
                  <tr
                    key={fila.talle}
                    className={`border-b border-[#ede7da] transition-colors hover:bg-[#fdf9f0] ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#fdfaf6]'
                    }`}
                  >
                    {/* Talle badge */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#352820] text-[#d3ad2f] text-xs font-extrabold">
                        {fila.talle}
                      </span>
                    </td>
                    {/* Values */}
                    {fila.valores.map((val, vIdx) => (
                      <td key={vIdx} className="px-5 py-4 text-[#4b382b] font-medium">
                        {val || (
                          <span className="inline-block text-[11px] text-[#b09070] italic bg-[#f8f4ec] px-2 py-0.5 rounded">
                            Por completar
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recomendación */}
          {active.recomendacion && (
            <div className="bg-[#fdf9f0] border-t border-[#e0d5c5] px-6 py-4 flex gap-3 items-start">
              <span className="text-lg flex-shrink-0 mt-0.5">🐾</span>
              <p className="text-xs text-[#4b382b] leading-relaxed">
                <span className="font-bold text-[#352820]">Recomendación: </span>
                {active.recomendacion}
              </p>
            </div>
          )}
        </div>

        {/* ── CTA footer ── */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#a78665]">
            ¿Tenés dudas con tu talle?{' '}
            <a
              href="https://wa.me/5493000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#352820] underline underline-offset-2 hover:text-[#d3ad2f] transition-colors"
            >
              Escribinos por WhatsApp
            </a>{' '}
            y te ayudamos.
          </p>
        </div>

      </div>
    </section>
  );
}
