import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Flame, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

export default function OfertaCard({ offer }) {
  const { addToCart } = useCart();

  const { nombre, products = [], descuento_o_precio_paquete, tipo_descuento, prioridad } = offer;

  // Calculate original total price of all products
  const originalTotal = products.reduce((sum, p) => sum + (p.price || 0), 0);

  // Calculate display offer price
  let offerPrice = descuento_o_precio_paquete;
  let savings = 0;
  if (tipo_descuento === 'porcentaje') {
    offerPrice = originalTotal * (1 - descuento_o_precio_paquete / 100);
    savings = originalTotal - offerPrice;
  } else {
    savings = originalTotal - descuento_o_precio_paquete;
  }

  const savingsPercent = originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

  const handleAddAll = (e) => {
    e.preventDefault();
    const outOfStock = products.some(p => p.stock <= 0);
    if (outOfStock) {
      alert('Uno o más productos de esta oferta no tienen stock.');
      return;
    }
    
    addToCart({
      id: `offer-${offer.id}`,
      isOffer: true,
      offerId: offer.id,
      name: `Oferta: ${nombre}`,
      price: offerPrice,
      image: products[0]?.image || '',
      category: 'pack',
      products: products
    }, 1);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden border-2 border-primary-400 bg-gradient-to-br from-[#fef9ec] via-[#fdf5e0] to-[#fcf0d0] shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      {/* Decorative gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-200/30 via-transparent to-accent-200/20 pointer-events-none" />

      {/* OFERTA Badge */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-md">
        <Flame className="w-3 h-3" />
        OFERTA
      </div>

      {/* Priority star (if high priority) */}
      {prioridad >= 5 && (
        <div className="absolute top-3 left-3 z-20 bg-white/90 text-primary-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary-200 shadow-sm">
          ⭐ Destacada
        </div>
      )}

      <div className="relative z-10 p-5">
        {/* Offer name */}
        <h3 className="font-display font-extrabold text-base sm:text-lg text-[#382d24] mb-3 pr-16 line-clamp-2 leading-snug">
          {nombre}
        </h3>

        {/* Products thumbnails row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {products.map((p, i) => (
            <React.Fragment key={p.id}>
              <Link to={`/product/${p.id}`} className="group/thumb flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 border-white shadow-sm bg-white group-hover/thumb:scale-105 transition-transform">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[9px] text-gray-500 mt-1 font-medium max-w-[60px] text-center line-clamp-1">{p.name}</span>
              </Link>
              {i < products.length - 1 && (
                <span className="text-primary-400 font-bold text-lg">+</span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Price block */}
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            {originalTotal > 0 && originalTotal !== offerPrice && (
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs text-gray-400 line-through font-medium">{formatPrice(originalTotal)}</span>
                {savingsPercent > 0 && (
                  <span className="text-[10px] font-black text-white bg-sage-500 px-1.5 py-0.5 rounded-full">
                    -{savingsPercent}%
                  </span>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary-500" />
              <span className="font-display font-black text-xl sm:text-2xl text-primary-700">
                {formatPrice(offerPrice)}
              </span>
            </div>
            {savings > 0 && (
              <p className="text-[10px] text-sage-600 font-bold mt-0.5">
                Ahorrás {formatPrice(savings)} comprando el pack
              </p>
            )}
          </div>

          <button
            onClick={handleAddAll}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-display font-bold text-xs tracking-wide shadow-md transition-all hover:scale-105 cursor-pointer shrink-0"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar pack
          </button>
        </div>
      </div>
    </div>
  );
}
