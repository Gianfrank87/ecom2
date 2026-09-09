import React from 'react';
import {
  ShoppingBag,
  ShoppingCart,
  ArrowRight,
  UserCheck,
  MapPin,
  CreditCard,
  CheckCircle2,
  Mail,
  PackageCheck
} from 'lucide-react';

export default function HowToBuySection() {
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

        {/* ─── Step Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 text-left">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.number}
                className="bg-[#fdfaf6] hover:bg-[#fdf6ea] border border-[#e8dfd0] hover:border-[#d3ad2f]/60 p-6 transition-all duration-300 hover:shadow-md group relative overflow-hidden flex flex-col justify-between"
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
      </div>
    </section>
  );
}
