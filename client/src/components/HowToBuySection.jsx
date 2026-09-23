import React, { useRef, useState } from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  MapPin,
  CreditCard,
  CheckCircle2,
  Mail,
  PackageCheck
} from 'lucide-react';

export default function HowToBuySection() {
  const trackRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    {
      number: '01',
      title: 'Elegí tu producto',
      description: 'Elegí el producto que querés comprar, seleccioná tu talle o variante deseada.',
      icon: ShoppingBag
    },
    {
      number: '02',
      title: 'Agregalo al carrito',
      description: 'Hacé clic en el botón "Agregar al carrito" para sumar los artículos a tu orden.',
      icon: ShoppingCart
    },
    {
      number: '03',
      title: 'Iniciá la compra',
      description: 'Podés seguir agregando más productos al carrito o hacer clic en "Iniciar compra".',
      icon: ArrowRight
    },
    {
      number: '04',
      title: 'Datos de contacto',
      description: 'Completá tus datos de contacto personales y hacé clic en "Continuar".',
      icon: UserCheck
    },
    {
      number: '05',
      title: 'Dirección de envío',
      description: 'Ingresá la dirección adonde querés recibir tu producto. Luego hacé clic en "Continuar".',
      icon: MapPin
    },
    {
      number: '06',
      title: 'Medio de pago',
      description: 'Elegí tu medio de pago preferido (Mercado Pago, Transferencia con 10% OFF o Efectivo).',
      icon: CreditCard
    },
    {
      number: '07',
      title: 'Confirmá la compra',
      description: 'En la página de confirmación, revisá toda la información del pedido y confirmá.',
      icon: CheckCircle2
    },
    {
      number: '08',
      title: 'Confirmación por e-mail',
      description: 'Después de confirmar, recibirás un e-mail automático con el resumen de tu orden.',
      icon: Mail
    },
    {
      number: '09',
      title: 'Pago y despacho',
      description: 'Una vez verificado el pago, enviaremos el comprobante y despacharemos tu paquete.',
      icon: PackageCheck
    }
  ];

  const goToStep = (index) => {
    const track = trackRef.current;
    const card = track?.children[index];
    if (!card) return;
    track.scrollTo({
      left: card.offsetLeft - track.children[0].offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  };

  const syncActiveStep = () => {
    const track = trackRef.current;
    if (!track || track.scrollWidth <= track.clientWidth) return;
    const start = track.children[0].offsetLeft;
    const nearest = Array.from(track.children).reduce((best, card, index, cards) =>
      Math.abs(card.offsetLeft - start - track.scrollLeft) < Math.abs(cards[best].offsetLeft - start - track.scrollLeft) ? index : best, 0);
    setActiveStep(nearest);
  };

  return (
    <section id="como-comprar-section" className="w-full bg-white py-16 px-4 sm:px-6 lg:px-8 border-b border-[#e8dfd0]">
      <div className="max-w-6xl mx-auto text-center">
        {/* ─── Header ─── */}
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#d3ad2f]">
          Guía paso a paso
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#352820] mt-2 tracking-tight">
          Cómo Comprar en NIGDIZ
        </h2>
        <p className="text-sm text-[#4b382b] mt-2 max-w-xl mx-auto leading-relaxed">
          Seguí estos sencillos pasos para realizar tu compra de forma fácil, transparente y 100% segura.
        </p>

        <p className="md:hidden text-xs text-[#4b382b] mt-5">Deslizá para ver el siguiente paso</p>

        {/* Native swipe on phones; the existing desktop grid is preserved. */}
        <div
          id="purchase-steps"
          ref={trackRef}
          onScroll={syncActiveStep}
          tabIndex={0}
          role="region"
          aria-label="Pasos para comprar"
          onKeyDown={(event) => {
            if (window.matchMedia('(min-width: 768px)').matches) return;
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
              event.preventDefault();
              goToStep(Math.max(0, Math.min(steps.length - 1, activeStep + (event.key === 'ArrowRight' ? 1 : -1))));
            }
          }}
          className="relative flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain md:grid md:overflow-visible md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-5 md:mt-12 text-left [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-2 focus-visible:outline-[#d3ad2f] focus-visible:outline-offset-4"
        >
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                className="w-full shrink-0 snap-start snap-always md:w-auto bg-[#fdfaf6] hover:bg-[#fdf6ea] border border-[#e8dfd0] hover:border-[#d3ad2f]/60 p-6 transition-all duration-300 hover:shadow-md group relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#d3ad2f] group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 bg-white shadow-xs border border-[#e8dfd0] flex items-center justify-center text-[#352820] group-hover:text-[#d3ad2f] group-hover:border-[#d3ad2f]/40 transition-colors">
                      <IconComponent className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-[#352820] mt-4 group-hover:text-[#4b382b] transition-colors">
                    {step.title}
                  </h3>

                  <p className="text-xs text-[#4b382b]/80 leading-relaxed mt-2">
                    {step.description}
                  </p>
                </div>

                <div className="w-8 h-1 bg-[#d3ad2f]/30 rounded-full mt-5 group-hover:w-full group-hover:bg-[#d3ad2f] transition-all duration-300" />
              </div>
            );
          })}
        </div>
        <div className="md:hidden flex items-center justify-between gap-3 mt-4">
          <button type="button" onClick={() => goToStep(activeStep - 1)} disabled={activeStep === 0} aria-label="Paso anterior" aria-controls="purchase-steps" className="w-11 h-11 flex items-center justify-center border border-[#352820] text-[#352820] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="space-y-2">
            <p aria-live="polite" aria-atomic="true" className="text-xs font-bold text-[#352820]">Paso {activeStep + 1} de {steps.length}</p>
            <div aria-hidden="true" className="flex justify-center gap-1.5">
              {steps.map((step, index) => <span key={step.number} className={`h-1.5 w-1.5 rounded-full ${index === activeStep ? 'bg-[#352820]' : 'bg-[#d3ad2f]/35'}`} />)}
            </div>
          </div>
          <button type="button" onClick={() => goToStep(activeStep + 1)} disabled={activeStep === steps.length - 1} aria-label="Paso siguiente" aria-controls="purchase-steps" className="w-11 h-11 flex items-center justify-center bg-[#352820] text-[#f0dc78] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
