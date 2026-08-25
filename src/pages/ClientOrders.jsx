import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';
import { Package, Clock, CheckCircle, Truck, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

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

function OrderCard({ order }) {
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
  const { clientUser, clientToken } = useClientAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clientUser) {
      navigate('/login', { state: { from: '/mis-pedidos', message: 'Iniciá sesión para ver tus pedidos.' } });
      return;
    }
    api.getClientOrders(clientToken)
      .then(data => setOrders(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [clientUser, clientToken, navigate]);

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
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
