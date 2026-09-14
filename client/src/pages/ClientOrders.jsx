import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Package, Clock, CheckCircle, Truck, AlertCircle, ChevronDown, ChevronUp, MessageCircle, Send, X } from 'lucide-react';
import ReceiptUpload from '../components/ReceiptUpload';

const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));

const STATUS_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500'
  },
  pendiente_pago: {
    label: 'Pendiente de pago',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-800 border-amber-300',
    dot: 'bg-amber-500'
  },
  aprobado: {
    label: 'Pago aprobado',
    icon: CheckCircle,
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600'
  },
  esperando_aprobacion: {
    label: 'Esperando comprobante',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-900 border-amber-300',
    dot: 'bg-amber-600'
  },
  pago_rechazado: {
    label: 'Pago rechazado',
    icon: AlertCircle,
    classes: 'bg-red-50 text-red-800 border-red-300',
    dot: 'bg-red-600'
  },
  enviado: {
    label: 'Enviado',
    icon: Truck,
    classes: 'bg-blue-50 text-blue-800 border-blue-300',
    dot: 'bg-blue-600'
  },
  completado: {
    label: 'Completado',
    icon: CheckCircle,
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-600'
  }
};

function OrderStepper({ status }) {
  const steps = ['Pedido realizado', 'Pago aprobado', 'Enviado', 'Completado'];
  const activeIndex = {
    esperando_aprobacion: 0,
    pendiente_pago: 0,
    pago_rechazado: 0,
    aprobado: 1,
    pendiente: 1,
    enviado: 2,
    completado: 3
  }[status] ?? 0;
  const rejected = status === 'pago_rechazado';

  return (
    <div className="px-5 pb-4">
      <div className="flex items-start">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex min-w-0 flex-1 flex-col items-center text-center">
              <span className={`flex h-7 w-7 items-center justify-center rounded-none border text-[10px] font-black ${
                index <= activeIndex ? rejected && index === 1 ? 'border-red-600 bg-red-100 text-red-800' : 'border-[#352820] bg-[#352820] text-[#f0dc78]' : 'border-gray-300 bg-white text-gray-400'
              }`}>
                {index < activeIndex ? '✓' : index + 1}
              </span>
              <span className={`mt-1.5 text-[9px] font-extrabold uppercase leading-tight ${index <= activeIndex ? 'text-[#352820]' : 'text-gray-500'}`}>{step}</span>
            </div>
            {index < steps.length - 1 && <div className={`mt-3 h-0.5 flex-1 ${index < activeIndex ? 'bg-[#352820]' : 'bg-gray-300'}`} />}
          </React.Fragment>
        ))}
      </div>
      {status === 'esperando_aprobacion' && <p className="mt-3 text-center text-[11px] font-bold text-amber-900">Subí tu comprobante para que podamos verificar el pago.</p>}
      {rejected && <p className="mt-3 text-center text-[11px] font-bold text-red-700">El comprobante fue rechazado. Podés cargar uno nuevo.</p>}
    </div>
  );
}

function MessageThread({ order, onClose }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [closed, setClosed] = useState(Boolean(order.hilo_cerrado));

  const loadMessages = () => {
    setLoading(true);
    api.getOrderMessages(order.id)
      .then((data) => {
        setMessages(data);
        setClosed(Boolean(data.some((message) => message.cerrado)));
      })
      .then(() => api.markOrderMessagesRead(order.id, 'admin'))
      .then(() => window.dispatchEvent(new Event('messages-read')))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMessages();
  }, [order.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    setError('');
    try {
      await api.sendOrderMessage(order.id, content.trim());
      setContent('');
      loadMessages();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleReopen = async () => {
    setError('');
    try {
      await api.reopenOrderMessages(order.id);
      setClosed(false);
      loadMessages();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-none border border-[#352820] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left">
        <div className="flex items-center justify-between gap-3 p-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="font-extrabold text-base text-[#352820] flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#d3ad2f]" /> Pedido #{order.id}
            </h2>
            <p className="text-xs text-gray-500 font-medium">Consultas y reclamos sobre tu pedido</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-none text-gray-500 hover:text-black hover:bg-gray-200 cursor-pointer" title="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 min-h-[240px]">
          {loading ? (
            <p className="text-center text-xs text-gray-500 py-10 font-bold">Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-10 font-medium">Todavía no hay mensajes. Escribile al admin sobre este pedido.</p>
          ) : (
            messages.map((message) =>
              message.tipo === 'sistema' ? (
                <div key={message.id} className="text-center py-2">
                  <span className="inline-block px-3 py-1 rounded-none bg-gray-200 text-gray-700 text-xs italic font-medium">{message.contenido}</span>
                </div>
              ) : (
                <div key={message.id} className={`flex ${message.remitente === 'cliente' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-none border p-3 ${message.remitente === 'cliente' ? 'bg-[#352820] text-white border-[#352820]' : 'bg-white border-gray-300 text-gray-800'}`}>
                    <p className="text-xs font-semibold whitespace-pre-wrap break-words">{message.contenido}</p>
                    <p className={`text-[10px] mt-1 ${message.remitente === 'cliente' ? 'text-[#f0dc78]' : 'text-gray-400'}`}>
                      {message.remitente === 'cliente' ? 'Vos' : 'NigDiz Admin'} · {formatDate(message.fecha)}
                    </p>
                  </div>
                </div>
              )
            )
          )}
        </div>

        {error && <p className="px-4 pt-2 text-xs font-bold text-red-600">{error}</p>}
        {closed ? (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-600 font-bold">Este reclamo está cerrado.</p>
            <button type="button" onClick={handleReopen} className="px-3 py-2 rounded-none bg-[#352820] hover:bg-[#4b382b] text-[#f0dc78] text-xs font-black uppercase tracking-wider cursor-pointer">Abrir reclamo nuevo</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white flex gap-2">
            <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Escribí tu mensaje..." rows="2" maxLength="2000" className="flex-1 resize-none px-3 py-2 rounded-none border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#352820] focus:border-[#352820] text-xs font-semibold text-[#352820]" />
            <button type="submit" disabled={sending || !content.trim()} className="self-end p-3 rounded-none bg-[#352820] hover:bg-[#4b382b] disabled:opacity-40 text-[#f0dc78] cursor-pointer disabled:cursor-not-allowed" title="Enviar mensaje" aria-label="Enviar mensaje">
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, token, onContact, onReceiptUpdated }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.estado] || STATUS_CONFIG.pendiente;

  return (
    <div className="bg-white border border-[#352820]/30 rounded-none shadow-sm overflow-hidden transition-all duration-200 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-none bg-[#352820] border border-[#352820] flex items-center justify-center shrink-0 text-[#f0dc78]">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-[#352820] text-sm">
              Pedido #{order.id}
            </p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{formatDate(order.fecha)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-none text-xs font-bold border ${status.classes}`}>
            <span className={`w-1.5 h-1.5 ${status.dot}`} />
            {status.label}
          </span>
          <span className="font-black text-base text-[#352820]">
            {formatPrice(order.total)}
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-none hover:bg-gray-100 transition-colors text-gray-600 border border-gray-300"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => onContact(order)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-black uppercase tracking-wider border transition-colors cursor-pointer ${
              order.mensajes_count > 0
                ? 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'
                : 'bg-[#352820] hover:bg-[#4b382b] text-[#f0dc78] border-[#352820]'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{order.mensajes_count > 0 ? 'Abrir chat' : 'Contactar'}</span>
            <span className="sm:hidden">{order.mensajes_count > 0 ? 'Chat' : 'Contactar'}</span>
          </button>
        </div>
      </div>

      <OrderStepper status={order.estado} />

      {order.metodo_pago === 'transferencia' && (Boolean(order.comprobante_url) || ['esperando_aprobacion', 'pago_rechazado'].includes(order.estado)) && (
        <div className="px-4 pb-4">
          <ReceiptUpload
            orderId={order.id}
            token={token}
            hasReceipt={Boolean(order.comprobante_url)}
            allowUpload={['esperando_aprobacion', 'pago_rechazado'].includes(order.estado)}
            onUploaded={onReceiptUpdated}
          />
        </div>
      )}

      {/* Expandable items */}
      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-4 space-y-3">
          <p className="text-xs font-extrabold text-[#352820] uppercase tracking-wider mb-2">Productos del pedido</p>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none overflow-hidden border border-gray-300 bg-white shrink-0">
                {item.producto_imagen ? (
                  <img src={item.producto_imagen} alt={item.producto_nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-base">🐾</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate">{item.producto_nombre}</p>
                <p className="text-[11px] text-gray-500 font-medium">
                  x{item.cantidad} · {formatPrice(item.precio_unitario)} c/u
                </p>
              </div>
              <p className="text-xs font-black text-[#352820] shrink-0">
                {formatPrice(item.precio_unitario * item.cantidad)}
              </p>
            </div>
          ))}
          <div className="pt-3 border-t border-gray-200 flex justify-between">
            <span className="text-xs font-bold text-gray-500">Total del pedido</span>
            <span className="font-black text-base text-[#352820]">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientOrders() {
  const { clientUser, clientToken, clientLogout } = useClientAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactOrder, setContactOrder] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status') || searchParams.get('collection_status');
    if (statusParam === 'approved') {
      clearCart();
    }
  }, [location.search, clearCart]);

  useEffect(() => {
    if (!clientUser) {
      navigate('/login', { state: { from: '/mis-pedidos', message: 'Iniciá sesión para ver tus pedidos.' } });
      return;
    }
    api.getClientOrders(clientToken)
      .then((data) => setOrders(data))
      .catch((err) => {
        if (err?.status === 401 || err?.message === 'Token inválido o expirado' || err?.message === 'No autorizado. Token requerido.') {
          clientLogout();
          navigate('/login', { state: { from: '/mis-pedidos', message: 'Tu sesión expiró. Iniciá sesión nuevamente.' } });
          return;
        }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [clientUser, clientToken, navigate, clientLogout]);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#d8b538] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#352820] border-t-white rounded-none animate-spin mx-auto" />
          <p className="text-xs text-[#352820] font-bold uppercase tracking-wider">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#d8b538] text-[#352820] py-10 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="font-extrabold text-3xl sm:text-4xl text-[#352820] tracking-tight">Mis Pedidos</h1>
          <p className="text-[#352820]/90 text-xs sm:text-sm font-medium">
            Hola, <span className="font-extrabold text-[#352820]">{clientUser?.name}</span> — historial y seguimiento de tus compras en NigDiz.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 border border-red-300 rounded-none p-4 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center bg-white border border-[#352820]/30 rounded-none p-10 shadow-xl space-y-4">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-none flex items-center justify-center mx-auto text-2xl">📦</div>
            <h2 className="font-extrabold text-lg text-[#352820]">Todavía no hiciste ningún pedido</h2>
            <p className="text-gray-500 text-xs font-medium">Explorá nuestro catálogo y encontrá lo mejor para tu mascota.</p>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-none bg-[#352820] hover:bg-[#4b382b] text-[#f0dc78] font-black text-xs uppercase tracking-wider shadow-sm transition-all"
            >
              Ir al Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs font-extrabold text-[#352820] uppercase tracking-wider">
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} realizados
            </p>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                token={clientToken}
                onContact={setContactOrder}
                onReceiptUpdated={() => api.getClientOrders(clientToken).then(setOrders).catch(() => {})}
              />
            ))}
          </div>
        )}
        {contactOrder && <MessageThread order={contactOrder} onClose={() => setContactOrder(null)} />}
      </div>
    </div>
  );
}
