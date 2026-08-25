import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { clientUser, clientToken } = useClientAuth();
  const navigate = useNavigate();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Checkout Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, checkout, success
  const [simulatedOrderNumber, setSimulatedOrderNumber] = useState('');

  // Prefill data if user logged in
  useEffect(() => {
    if (clientUser) {
      setFormData((prev) => ({
        ...prev,
        name: clientUser.name || prev.name,
        email: clientUser.email || prev.email,
      }));
    }
  }, [clientUser]);

  // Helper to format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio.';
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El formato del correo es inválido.';
    }
    if (!formData.phone.trim()) errors.phone = 'El teléfono es obligatorio.';
    if (!formData.address.trim()) errors.address = 'La dirección de entrega es obligatoria.';
    return errors;
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setCheckoutLoading(true);
    setApiError('');
    
    try {
      const orderData = {
        items: cart,
        total: getCartTotal(),
        shippingInfo: formData
      };
      const res = await api.createOrder(orderData, clientToken);
      setSimulatedOrderNumber(res.orderId);
      setCheckoutStep('success');
      
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (err) {
      setApiError(err.message || 'Error al procesar el pago.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (checkoutStep === 'success') {
    return (
      <div className="max-w-2xl mx-auto my-12 px-4">
        <div className="bg-white border border-accent-100 rounded-3xl p-8 sm:p-12 text-center shadow-premium space-y-6">
          <div className="w-20 h-20 bg-sage-50 border border-sage-100 rounded-full flex items-center justify-center mx-auto text-sage-600 animate-pulse">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-gray-800">
              ¡Pedido recibido con éxito!
            </h1>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Muchas gracias por comprar en Huellitas & Cía. Tu pedido ha sido procesado exitosamente.
            </p>
          </div>

          <div className="bg-primary-50 rounded-2xl p-6 text-left border border-accent-50/50 space-y-3">
            <div className="flex justify-between border-b border-gray-150 pb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Nro. de Pedido</span>
              <span className="text-sm font-display font-extrabold text-accent-700">{simulatedOrderNumber}</span>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-600"><strong>Cliente:</strong> {formData.name}</p>
              <p className="text-xs text-gray-600"><strong>Dirección:</strong> {formData.address}</p>
              <p className="text-xs text-gray-600"><strong>Teléfono:</strong> {formData.phone}</p>
              <p className="text-xs text-gray-600"><strong>Email:</strong> {formData.email}</p>
            </div>
            {formData.notes && (
              <p className="text-[11px] text-gray-500 italic pt-1 border-t border-gray-150">
                " {formData.notes} "
              </p>
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 rounded-2xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-sm shadow-premium tracking-wide transition-colors"
            >
              Volver al Inicio
            </Link>
            <Link
              to="/catalog"
              className="px-6 py-3 rounded-2xl bg-primary-50 hover:bg-accent-50 text-accent-800 font-display font-bold text-sm border border-accent-100 transition-colors"
            >
              Seguir Comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 text-center px-4">
        <div className="text-5xl mb-4">🛒</div>
        <h2 className="font-display font-extrabold text-2xl text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Todavía no agregaste ningún producto a tu compra. ¡Explora nuestro catálogo y dale un mimo a tu mascota!
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-sm shadow-premium"
        >
          Ir al catálogo de productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-accent-100 pb-4 gap-4">
        <h1 className="text-3xl font-display font-extrabold text-[#382d24]">Mi Carrito</h1>
        <div className="flex gap-4">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-accent-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Seguir Comprando
          </Link>
          <button
            onClick={clearCart}
            className="text-xs font-bold text-red-500 hover:text-red-600 hover:underline cursor-pointer"
          >
            Vaciar Carrito
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Item List */}
        <div className="lg:col-span-7 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-accent-100 p-4 flex items-center gap-4 shadow-sm relative"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              {/* Product Details */}
              <div className="flex-grow text-left pr-4">
                <span className="text-[9px] uppercase font-bold tracking-wider text-sage-500">
                  {item.category}
                </span>
                <Link to={`/product/${item.id}`} className="block font-display font-bold text-sm sm:text-base text-gray-800 hover:text-accent-600 line-clamp-1 transition-colors">
                  {item.name}
                </Link>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="font-display font-extrabold text-sm text-accent-700">
                    {formatPrice(item.price)}
                  </span>
                  <span className="text-gray-400 text-xs">x unidad</span>
                </div>
              </div>

              {/* Action Stepper & Delete */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shrink-0 ml-auto">
                {/* Stepper */}
                <div className="flex items-center border border-accent-100 rounded-xl p-0.5 bg-primary-50">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 hover:bg-white text-gray-500 hover:text-accent-600 rounded-lg transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-display font-bold text-sm text-gray-800 w-6 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 hover:bg-white text-gray-500 hover:text-accent-600 rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex flex-col items-end gap-1">
                  <span className="font-display font-black text-sm text-gray-800">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Eliminar producto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Order Form / Summary */}
        <div className="lg:col-span-5 bg-white border border-accent-100 rounded-3xl p-6 shadow-premium space-y-6 text-left">
          <h2 className="font-display font-extrabold text-lg text-gray-800">Resumen de Compra</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Envío</span>
              <span className="text-sage-600 font-bold">¡Gratis!</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex justify-between text-base font-bold text-[#382d24]">
              <span className="font-display font-extrabold">Total</span>
              <span className="font-display font-black text-xl text-accent-700">{formatPrice(getCartTotal())}</span>
            </div>
          </div>

          {checkoutStep === 'cart' ? (
            <button
              onClick={() => {
                if (!clientUser) {
                  navigate('/login', { state: { from: '/cart' } });
                } else {
                  setCheckoutStep('checkout');
                }
              }}
              className="w-full py-4 rounded-2xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-sm tracking-wide shadow-md transition-all hover:translate-y-[-2px] flex items-center justify-center cursor-pointer"
            >
              Proceder al Pago
            </button>
          ) : (
            /* Checkout Form (Step 2) */
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4 border-t border-gray-100 animate-fadeIn">
              <h3 className="font-display font-bold text-sm text-gray-800 mb-2">Datos de Entrega</h3>
              
              {apiError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}
              
              {/* Form Input fields */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Laura González"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all ${
                    formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-accent-100'
                  }`}
                />
                {formErrors.name && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="laura@ejemplo.com"
                  className={`w-full px-4 py-2.5 rounded-xl border bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all ${
                    formErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-accent-100'
                  }`}
                />
                {formErrors.email && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="11 5555 5555"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all ${
                      formErrors.phone ? 'border-red-400 focus:ring-red-400' : 'border-accent-100'
                    }`}
                  />
                  {formErrors.phone && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Dirección de Entrega</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Av. Santa Fe 1234"
                    className={`w-full px-4 py-2.5 rounded-xl border bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all ${
                      formErrors.address ? 'border-red-400 focus:ring-red-400' : 'border-accent-100'
                    }`}
                  />
                  {formErrors.address && <p className="text-red-500 text-[10px] mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.address}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas adicionales (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ej: Entregar por la tarde, timbre roto, etc."
                  rows="2"
                  className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="w-1/3 py-3 rounded-xl border border-accent-100 text-gray-500 text-xs font-display font-bold hover:bg-gray-50 transition-colors"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-2/3 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:bg-accent-300 text-white font-display font-bold text-xs tracking-wide shadow-md transition-all hover:translate-y-[-1px] flex items-center justify-center cursor-pointer"
                >
                  {checkoutLoading ? 'Procesando...' : 'Finalizar Compra'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
