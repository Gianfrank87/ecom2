import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';
import ReceiptUpload from '../components/ReceiptUpload';

export default function Cart() {
  const { cart, updateQuantity, updateItemStock, removeFromCart, clearCart, getCartTotal } = useCart();
  const { clientUser, clientToken } = useClientAuth();
  const navigate = useNavigate();
  
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  const [bankConfig, setBankConfig] = useState(null);
  const [bankConfigLoading, setBankConfigLoading] = useState(false);
  const [bankConfigError, setBankConfigError] = useState('');
  
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

  useEffect(() => {
    if (paymentMethod !== 'transferencia' || bankConfig) return;
    setBankConfigLoading(true);
    api.getBankConfig()
      .then(setBankConfig)
      .catch((error) => setBankConfigError(error.message))
      .finally(() => setBankConfigLoading(false));
  }, [paymentMethod, bankConfig]);

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
        metodo_pago: paymentMethod,
        shippingInfo: formData
      };
      const res = await api.createOrder(orderData, clientToken);
      
      if (paymentMethod === 'mercadopago' && res.init_point) {
        setIsRedirecting(true);
        clearCart();
        window.location.href = res.init_point;
        return;
      }

      setSimulatedOrderNumber(res.orderId);
      setCheckoutStep('success');
      
      setTimeout(() => {
        clearCart();
      }, 100);
    } catch (err) {
      setIsRedirecting(false);
      if (err.productId !== undefined && err.available !== undefined) {
        updateItemStock(String(err.productId), Number(err.available));
        setApiError(`Solo quedan ${err.available} unidades de ${err.productName || 'este producto'}. Ajustamos el carrito para que puedas intentarlo de nuevo.`);
      } else {
        setApiError(err.message || 'Error al procesar el pago.');
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const baseTotal = getCartTotal();
  const displayedTotal = paymentMethod === 'mercadopago'
    ? Math.round((baseTotal / 0.934) * 100) / 100
    : baseTotal;

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
              Muchas gracias por comprar en Huellitas & Cía. {paymentMethod === 'transferencia' ? 'Completá el pago y subí tu comprobante para que podamos revisarlo.' : 'Tu pedido ha sido procesado exitosamente.'}
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

          {paymentMethod === 'transferencia' && (
            <div className="space-y-4 text-left">
              <div className="rounded-xl border border-[#0f172a]/15 bg-slate-50 p-4 space-y-2">
                <h2 className="text-sm font-extrabold text-[#0f172a]">Datos para transferir</h2>
                {bankConfigLoading && <p className="text-xs text-gray-500">Cargando datos bancarios...</p>}
                {bankConfigError && <p className="text-xs font-bold text-red-700">{bankConfigError}</p>}
                {bankConfig && (
                  <>
                    <p className="text-xs text-gray-700"><strong>Alias:</strong> {bankConfig.alias || 'No configurado'}</p>
                    <p className="text-xs text-gray-700"><strong>CBU:</strong> {bankConfig.cbu || 'No configurado'}</p>
                    <p className="text-xs text-gray-700"><strong>Titular:</strong> {bankConfig.titular || 'No configurado'}</p>
                  </>
                )}
              </div>
              <ReceiptUpload orderId={simulatedOrderNumber} token={clientToken} />
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl bg-[#e52521] hover:bg-[#c91d19] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-colors"
            >
              Volver al Inicio
            </Link>
            <Link
              to="/catalog"
              className="px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider border border-gray-300 transition-colors"
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
        <h2 className="font-extrabold text-2xl text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
          Todavía no agregaste ningún producto a tu compra. ¡Explorá nuestro catálogo y consentí a tu mascota!
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#e52521] hover:bg-[#c91d19] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm"
        >
          Ir al catálogo de productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b border-gray-200 pb-4 gap-4">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mi Carrito</h1>
        <div className="flex gap-4 items-center">
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#e52521] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Seguir Comprando
          </Link>
          <button
            onClick={clearCart}
            className="text-xs font-extrabold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
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
              className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-xs relative"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 shrink-0 p-1">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
              </div>

              {/* Product Details */}
              <div className="flex-grow text-left pr-4">
                <span className="text-[9px] uppercase font-black tracking-widest text-[#e52521]">
                  {item.category}
                </span>
                <Link to={`/product/${item.id}`} className="block font-extrabold text-sm sm:text-base text-gray-900 hover:text-[#e52521] line-clamp-1 transition-colors">
                  {item.name}
                </Link>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="font-extrabold text-sm text-gray-900">
                    {formatPrice(item.price)}
                  </span>
                  <span className="text-gray-400 text-xs font-medium">x unidad</span>
                </div>
              </div>

              {/* Action Stepper & Delete */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 shrink-0 ml-auto">
                {/* Stepper */}
                <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-50">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-all cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-extrabold text-sm text-gray-900 w-7 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex flex-col items-end gap-1">
                  <span className="font-black text-sm text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
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
        <div className="lg:col-span-5 bg-white border border-gray-200 rounded-xl p-6 shadow-xs space-y-6 text-left">
          <h2 className="font-extrabold text-lg text-gray-900">Resumen de Compra</h2>
          
          <div className="space-y-3 text-sm font-semibold">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-900 font-bold">{formatPrice(baseTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Envío</span>
              <span className="text-emerald-700 font-extrabold">¡Gratis!</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-base font-extrabold text-gray-900">
              <span>Total</span>
              <span className="font-black text-2xl text-gray-900">{formatPrice(displayedTotal)}</span>
            </div>
          </div>

          <fieldset className="space-y-3 border-t border-gray-200 pt-4">
            <legend className="font-extrabold text-sm text-gray-900">Método de pago</legend>
            <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="transferencia"
                checked={paymentMethod === 'transferencia'}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-1 accent-[#e52521]"
              />
              <span>
                <span className="block text-xs font-extrabold text-gray-900">Transferencia / Efectivo</span>
                <span className="block text-[11px] text-gray-500">Precio de lista</span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="mercadopago"
                checked={paymentMethod === 'mercadopago'}
                onChange={(event) => setPaymentMethod(event.target.value)}
                className="mt-1 accent-[#e52521]"
              />
              <span>
                <span className="block text-xs font-extrabold text-gray-900">MercadoPago</span>
                <span className="block text-[11px] text-gray-500">Disponibilidad inmediata, costo absorbido</span>
              </span>
            </label>
            {paymentMethod === 'mercadopago' && (
              <p className="text-[11px] font-semibold text-gray-500">Incluye recargo del 7,06% por costos de plataforma.</p>
            )}
          </fieldset>

          {checkoutStep === 'cart' ? (
            <button
              onClick={() => {
                if (!clientUser) {
                  navigate('/login', { state: { from: '/cart' } });
                } else {
                  setCheckoutStep('checkout');
                }
              }}
              className="w-full py-3.5 rounded-xl bg-[#e52521] hover:bg-[#c91d19] text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center cursor-pointer"
            >
              Proceder al Pago
            </button>
          ) : (
            /* Checkout Form (Step 2) */
            <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="font-extrabold text-sm text-gray-900 mb-2">Datos de Entrega</h3>
              
              {apiError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs flex items-center gap-2 border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-bold">{apiError}</span>
                </div>
              )}
              
              {/* Form Input fields */}
              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Laura González"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900 transition-all ${
                    formErrors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'
                  }`}
                />
                {formErrors.name && <p className="text-red-600 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="laura@ejemplo.com"
                  className={`w-full px-4 py-2.5 rounded-lg border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900 transition-all ${
                    formErrors.email ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'
                  }`}
                />
                {formErrors.email && <p className="text-red-600 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="11 5555 5555"
                    className={`w-full px-4 py-2.5 rounded-lg border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900 transition-all ${
                      formErrors.phone ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.phone && <p className="text-red-600 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Av. Santa Fe 1234"
                    className={`w-full px-4 py-2.5 rounded-lg border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900 transition-all ${
                      formErrors.address ? 'border-red-400 focus:ring-red-400' : 'border-gray-200'
                    }`}
                  />
                  {formErrors.address && <p className="text-red-600 text-[10px] mt-1 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {formErrors.address}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Notas adicionales (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Ej: Entregar por la tarde, timbre roto, etc."
                  rows="2"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCheckoutStep('cart')}
                  className="w-1/3 py-3 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={checkoutLoading || isRedirecting}
                  className="w-2/3 py-3 rounded-lg bg-[#e52521] hover:bg-[#c91d19] disabled:bg-gray-300 text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                  {isRedirecting ? 'Redirigiendo a Mercado Pago...' : checkoutLoading ? 'Procesando...' : 'Finalizar Compra'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
