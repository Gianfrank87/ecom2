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
    <div className="bg-white rounded-xl border-2 border-[#e52521] shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between relative overflow-hidden text-left group">
      
      {/* Top Banner Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1 bg-[#e52521] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded">
          <Flame className="w-3 h-3" />
          PACK OFERTA
        </span>
        {savingsPercent > 0 && (
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            -{savingsPercent}% OFF
          </span>
        )}
      </div>

      <div>
        {/* Offer Title */}
        <h3 className="font-extrabold text-base text-gray-900 mb-3 line-clamp-2 leading-snug group-hover:text-[#e52521] transition-colors">
          {nombre}
        </h3>

        {/* Products thumbnails row */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {products.map((p, i) => (
            <React.Fragment key={p.id}>
              <Link to={`/product/${p.id}`} className="group/thumb flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-1 group-hover/thumb:border-[#e52521] transition-all">
                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                </div>
                <span className="text-[9px] text-gray-500 mt-1 font-bold max-w-[60px] text-center line-clamp-1">{p.name}</span>
              </Link>
              {i < products.length - 1 && (
                <span className="text-red-500 font-black text-base">+</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Price block & Action */}
      <div className="pt-3 border-t border-gray-100 mt-auto">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            {originalTotal > 0 && originalTotal !== offerPrice && (
              <span className="text-xs text-gray-400 line-through font-bold block mb-0.5">
                {formatPrice(originalTotal)}
              </span>
            )}
            <span className="font-black text-xl sm:text-2xl text-gray-900 tracking-tight">
              {formatPrice(offerPrice)}
            </span>
          </div>
          {savings > 0 && (
            <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-1 rounded border border-emerald-200 text-right">
              Ahorrás {formatPrice(savings)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddAll}
          className="w-full py-2.5 px-3 bg-[#e52521] hover:bg-[#c91d19] active:bg-[#b01714] text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          Agregar Pack al Carrito
        </button>
      </div>
    </div>
  );
}
