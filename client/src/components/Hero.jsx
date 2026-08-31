import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Gift, Tag, Award, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <div className="space-y-4 mb-10 text-left">
      {/* Main Promo Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white rounded-2xl p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-md">
        
        {/* Subtle Background Pattern Elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Text & Coupons */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Por tiempo limitado</span>
            </div>

            <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-tight">
              Alimentos Premium <br className="hidden sm:inline" />
              <span className="text-amber-400">hasta 35% OFF</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-lg leading-relaxed">
              Las marcas más elegidas por profesionales veterinarios: Royal Canin, Pro Plan, Eukanuba, Pedigree y más.
            </p>

            {/* Promo Coupon Box (Estilo MiVetShop) */}
            <div className="inline-flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700 max-w-md">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 px-2">
                <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Usá el código: <strong className="text-white font-black text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-600">HUELLITAS10</strong></span>
              </div>
              <Link
                to="/catalog"
                className="px-4 py-2 bg-[#e52521] hover:bg-[#c91d19] text-white font-black text-xs uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                ¡Comprar ahora!
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Real Product Photography Collage */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-4/3 sm:aspect-square flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&auto=format&fit=crop&q=80"
                alt="Alimentos y mascotas"
                className="w-full h-full object-cover rounded-xl border-2 border-slate-700 shadow-xl"
              />
              <div className="absolute -bottom-3 -right-3 bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider shadow-md flex items-center gap-1.5 border border-amber-300">
                <Award className="w-4 h-4 text-slate-950" />
                Envíos a todo el país
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Secondary Promo Gift Bar (Estilo MiVetShop bottom banner) */}
      <div className="bg-[#0f172a] rounded-xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-lime-400 flex items-center justify-center text-slate-950 shrink-0">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider text-lime-400 block">¡Tenés un regalo!</span>
            <p className="font-extrabold text-sm sm:text-base text-white">
              $10.000 de descuento en tu primera compra online
            </p>
          </div>
        </div>
        <Link
          to="/catalog"
          className="px-5 py-2.5 bg-lime-400 hover:bg-lime-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm"
        >
          Quiero mi regalo &gt;
        </Link>
      </div>
    </div>
  );
}
