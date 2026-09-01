import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';
import { Package, Clock, CheckCircle, Truck, AlertCircle, ChevronDown, ChevronUp, MessageCircle, Send, X } from 'lucide-react';

const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

const formatDate = (dateStr) =>
  new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));

const STATUS_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    icon: Clock,
    classes: 'bg-amber-50 text-amber-600 border-amber-200',
    dot: 'bg-amber-400'
  },
  enviado: {
    label: 'Enviado',
    icon: Truck,
    classes: 'bg-blue-50 text-blue-600 border-blue-200',
    dot: 'bg-blue-400'
  },
  completado: {
    label: 'Completado',
    icon: CheckCircle,
    classes: 'bg-sage-50 text-sage-600 border-sage-200',
    dot: 'bg-sage-400'
  }
};

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
      .then(data => {
        setMessages(data);
        setClosed(Boolean(data.some(message => message.cerrado)));
      })
      .then(() => api.markOrderMessagesRead(order.id, 'admin'))
      .then(() => window.dispatchEvent(new Event('messages-read')))
      .catch(err => setError(err.message))
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-accent-100 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between gap-3 p-5 border-b border-accent-50">
          <div>
            <h2 className="font-display font-extrabold text-lg text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-accent-500" /> Pedido #{order.id}
            </h2>
            <p className="text-xs text-gray-400 mt-1">Consultas y reclamos sobre tu pedido</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer" title="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-primary-50/30 min-h-[240px]">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-10">Cargando mensajes...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-10">Todavía no hay mensajes. Escribile al admin sobre este pedido.</p>
          ) : messages.map(message => message.tipo === 'sistema' ? (
            <div key={message.id} className="text-center py-2">
              <span className="inline-block px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs italic">{message.contenido}</span>
            </div>
          ) : (
            <div key={message.id} className={`flex ${message.remitente === 'cliente' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-2xl px-4 py-3 ${message.remitente === 'cliente' ? 'bg-accent-500 text-white rounded-br-sm' : 'bg-white border border-accent-100 text-gray-700 rounded-bl-sm'}`}>
                <p className="text-sm whitespace-pre-wrap break-words">{message.contenido}</p>
                <p className={`text-[10px] mt-1 ${message.remitente === 'cliente' ? 'text-white/70' : 'text-gray-400'}`}>
                  {message.remitente === 'cliente' ? 'Vos' : 'Huellitas & Cía'} · {formatDate(message.fecha)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="px-5 pt-3 text-xs font-bold text-red-600">{error}</p>}
        {closed ? (
          <div className="p-4 border-t border-accent-50 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500">Este reclamo está cerrado.</p>
            <button type="button" onClick={handleReopen} className="px-3 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold cursor-pointer">Abrir reclamo nuevo</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 border-t border-accent-50 flex gap-2">
            <textarea value={content} onChange={event => setContent(event.target.value)} placeholder="Escribí tu mensaje..." rows="2" maxLength="2000" className="flex-1 resize-none px-3 py-2 rounded-xl border border-accent-100 bg-primary-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm" />
            <button type="submit" disabled={sending || !content.trim()} className="self-end p-3 rounded-xl bg-accent-500 hover:bg-accent-600 disabled:opacity-40 text-white cursor-pointer disabled:cursor-not-allowed" title="Enviar mensaje" aria-label="Enviar mensaje">
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onContact }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[order.estado] || STATUS_CONFIG.pendiente;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white border border-accent-100 rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-50 border border-accent-100 flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-accent-500" />
          </div>
          <div>
            <p className="font-display font-extrabold text-gray-800 text-sm">
              Pedido #{order.id}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.fecha)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${status.classes}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="font-display font-extrabold text-base text-primary-700">
            {formatPrice(order.total)}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg hover:bg-accent-50 transition-colors text-gray-400"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onContact(order)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${order.mensajes_count > 0 ? 'bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-100' : 'bg-accent-50 hover:bg-accent-100 text-accent-600 border-accent-100'}`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{order.mensajes_count > 0 ? 'Abrir chat' : 'Contactar sobre este pedido'}</span>
            <span className="sm:hidden">{order.mensajes_count > 0 ? 'Abrir chat' : 'Contactar'}</span>
          </button>
        </div>
      </div>

      {/* Expandable items */}
      {expanded && (
        <div className="border-t border-accent-50 bg-primary-50/30 px-5 py-4 space-y-3 animate-fadeIn">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Productos del pedido</p>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white shadow-sm bg-white shrink-0">
                {item.producto_imagen ? (
                  <img src={item.producto_imagen} alt={item.producto_nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-accent-50 flex items-center justify-center text-lg">🐾</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-700 truncate">{item.producto_nombre}</p>
                <p className="text-xs text-gray-400">
                  x{item.cantidad} · {formatPrice(item.precio_unitario)} c/u
                </p>
              </div>
              <p className="text-sm font-bold text-gray-600 shrink-0">
                {formatPrice(item.precio_unitario * item.cantidad)}
              </p>
            </div>
          ))}
          <div className="pt-3 border-t border-accent-100 flex justify-between">
            <span className="text-xs font-bold text-gray-400">Total del pedido</span>
            <span className="font-display font-extrabold text-primary-700">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientOrders() {
  const { clientUser, clientToken, clientLogout } = useClientAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactOrder, setContactOrder] = useState(null);

  useEffect(() => {
    if (!clientUser) {
      navigate('/login', { state: { from: '/mis-pedidos', message: 'Iniciá sesión para ver tus pedidos.' } });
      return;
    }
    api.getClientOrders(clientToken)
      .then(data => setOrders(data))
      .catch(err => {
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-accent-200 border-t-accent-500 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 font-medium">Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-gray-800 mb-1">Mis Pedidos</h1>
        <p className="text-gray-400 text-sm">
          Hola, <span className="font-bold text-gray-600">{clientUser?.name}</span> — acá podés ver el historial y estado de tus compras.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm mb-6 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center bg-white border border-accent-100 rounded-3xl p-12 shadow-sm">
          <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">📦</div>
          <h2 className="font-display font-extrabold text-xl text-gray-700 mb-2">Todavía no hiciste ningún pedido</h2>
          <p className="text-gray-400 text-sm mb-6">Explorá nuestro catálogo y encontrá lo mejor para tu mascota.</p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-sm shadow-md transition-all hover:scale-105"
          >
            Ir al Catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} realizados
          </p>
          {orders.map(order => (
            <OrderCard key={order.id} order={order} onContact={setContactOrder} />
          ))}
        </div>
      )}
      {contactOrder && <MessageThread order={contactOrder} onClose={() => setContactOrder(null)} />}
    </div>
  );
}
