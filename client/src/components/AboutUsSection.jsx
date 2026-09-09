import React from 'react';
import { Sparkles, Quote, MapPin } from 'lucide-react';

export default function AboutUsSection() {
  const ownersImage = 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1788909792/file_000000003d28720e8004f3bfe18a1411_n8udzc.png';

  return (
    <section id="acerca-de-nosotros-section" className="w-full bg-[#f8f4ec] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-[#e0d5c5]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ─── Left Column: Owners Photo ─── */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-md">
              {/* Decorative Accent Background Box */}
              <div className="absolute -inset-3 bg-[#d3ad2f]/20 border border-[#d3ad2f]/30 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300" />
              
              <div className="relative bg-white p-3 shadow-xl border border-[#e0d5c5] overflow-hidden">
                <img
                  src={ownersImage}
                  alt="Laura, Sebastián y Horacio - Fundadores de NigDiz"
                  className="w-full h-auto object-cover shadow-xs"
                />
                
                {/* Badge Overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-3.5 border border-[#e8dfd0] shadow-md flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-[#352820]">Laura, Sebastián y Horacio</h4>
                    <p className="text-[11px] text-gray-600 font-medium flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#d3ad2f]" /> Entrerrianos los tres
                    </p>
                  </div>
                  <span className="text-xl flex-shrink-0">🐾</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Column: Storytelling Content ─── */}
          <div className="lg:col-span-7 text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#d3ad2f] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#d3ad2f]" />
              Nuestra Historia & Familia
            </span>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#352820] mt-2 tracking-tight">
              Acerca de Nosotros
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed mt-6">
              <p className="font-semibold text-[#352820] text-base sm:text-lg">
                Somos Laura, Sebastián, y Horacio. Entrerrianos los tres.
              </p>

              <p>
                Este emprendimiento nace a comienzos del 2026, a partir de <strong className="text-[#352820]">Nigdiz</strong>, nuestro perrito adoptado, que si leés el apartado de <em>"Acerca de Nigdiz"</em> te darás cuenta que su historia y anécdotas nos impulsaron a darle forma a esta idea que siempre estuvo en nuestra cabeza.
              </p>

              <p>
                Con esta página, brindamos la oportunidad de que los dueños, los "papás" y "mamás" de mascotas, puedan contar con artículos de seguridad que muchas veces no son tenidos en cuenta cuando se pasea, trota, se sale en auto, o simplemente se disfruta de una placentera tarde de sol en una plaza con ellos.
              </p>
            </div>

            {/* ─── Philosophy Highlight Card ─── */}
            <div className="mt-8 bg-white p-5 sm:p-6 border-l-4 border-[#d3ad2f] shadow-xs relative">
              <Quote className="w-8 h-8 text-[#d3ad2f]/20 absolute top-3 right-3" />
              <p className="text-xs uppercase font-bold tracking-wider text-[#d3ad2f]">
                Nuestra Filosofía
              </p>
              <blockquote className="text-base sm:text-lg font-bold italic text-[#352820] mt-1">
                "Más seguro para ellos, tranquilidad para vos"
              </blockquote>
            </div>

            <p className="text-sm font-semibold text-[#352820] mt-6 flex items-center gap-2">
              Esperamos que nos acompañes en este sueño. ¡Gracias! 🐾
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
