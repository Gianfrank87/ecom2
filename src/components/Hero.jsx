import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, ShieldCheck } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#f6eedc] via-[#fcfbf9] to-[#edf4ee] rounded-3xl p-8 sm:p-12 lg:p-16 mb-12 shadow-premium">
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent-100/50 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sage-100/40 rounded-full blur-3xl -z-10"></div>

      <div className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: text content */}
        <div className="lg:col-span-7 flex flex-col text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-100 border border-accent-200 text-accent-800 text-xs font-bold w-fit uppercase tracking-wider">
            <span>✨ Todo para consentirlos</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#382d24] leading-tight tracking-tight">
            El paraíso para tus <span className="text-accent-500 relative inline-block">
              mascotas
              <svg className="absolute left-0 bottom-0.5 w-full h-2 text-primary-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0,7 C30,2 70,2 100,7" stroke="currentColor" strokeWidth="6" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-600 font-body leading-relaxed max-w-xl">
            Descubre alimentos súper premium, accesorios cómodos y juguetes interactivos cuidadosamente seleccionados para que tu perro o gato viva feliz y saludable.
          </p>

          {/* Features Badges */}
          <div className="flex flex-wrap gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/70 px-3.5 py-2 rounded-xl border border-gray-100 shadow-sm">
              <Award className="w-4 h-4 text-primary-500" />
              Calidad Garantizada
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/70 px-3.5 py-2 rounded-xl border border-gray-100 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-sage-500" />
              Compra 100% Segura
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/catalog"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-sm tracking-wide shadow-md transition-all duration-200 hover:translate-y-[-2px] gap-2"
            >
              Comprar Ahora
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              to="/catalog?category=alimentos"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-550 border border-accent-100 text-accent-800 font-display font-bold text-sm tracking-wide transition-all duration-200 hover:bg-accent-50/50"
            >
              Ver Alimentos
            </Link>
          </div>
        </div>

        {/* Right Column: Visual image with frame */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-sm sm:max-w-md aspect-square lg:aspect-auto lg:h-[400px]">
            {/* Soft decorative shapes */}
            <div className="absolute inset-0 bg-[#e7d5a5] rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] transform rotate-6 scale-95 opacity-55 animate-pulse"></div>
            <div className="absolute inset-0 bg-[#b5cdc0] rounded-[50%_50%_30%_70%_/_50%_60%_40%_50%] transform -rotate-12 scale-95 opacity-40"></div>
            
            {/* Main Pet Image */}
            <img
              src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80"
              alt="Mascota feliz"
              className="relative z-10 w-full h-full object-cover rounded-3xl shadow-xl border-4 border-white transform hover:rotate-2 transition-transform duration-300"
            />
            
            {/* Mini Float Badge */}
            <div className="absolute -bottom-4 -left-4 z-20 bg-white p-3 rounded-2xl shadow-premium border border-gray-100 flex items-center gap-3 animate-bounce">
              <span className="text-2xl">🐶</span>
              <div className="text-left">
                <p className="font-display font-bold text-xs text-gray-800">¡Clientes felices!</p>
                <p className="text-[10px] text-gray-500 font-medium">🐾 +1000 amigos contentos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
