import React, { useEffect, useRef } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

export default function CartDrawer() {
  const { cart, isCartDrawerOpen, closeCartDrawer, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const panelRef = useRef(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        closeCartDrawer();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, closeCartDrawer]);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartDrawerOpen]);

  // Click en el backdrop (fuera del panel)
  const handleBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      closeCartDrawer();
    }
  };

  return (
    <>
      {/* Overlay / Backdrop */}
      <div
        aria-hidden={!isCartDrawerOpen}
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          background: 'rgba(30, 20, 10, 0.45)',
          backdropFilter: 'blur(2px)',
          opacity: isCartDrawerOpen ? 1 : 0,
          pointerEvents: isCartDrawerOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Panel lateral */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
          transform: isCartDrawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #f0ece6',
            background: '#fff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="#352820" strokeWidth={1.5} />
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#352820', letterSpacing: '-0.01em' }}>
              Mi Carrito
            </h2>
            {cart.length > 0 && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '22px',
                  height: '22px',
                  padding: '0 6px',
                  borderRadius: '999px',
                  background: '#d3ad2f',
                  color: '#352820',
                  fontSize: '11px',
                  fontWeight: 800,
                }}
              >
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCartDrawer}
            aria-label="Cerrar carrito"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e5ddd4',
              background: 'transparent',
              cursor: 'pointer',
              color: '#4b382b',
              transition: 'background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fdf7ec'; e.currentTarget.style.color = '#d3ad2f'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4b382b'; }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ── Body scrolleable ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {cart.length === 0 ? (
            /* Estado vacío */
            <div
              style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                textAlign: 'center',
                padding: '40px 20px',
              }}
            >
              <div
                style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: '#fdf7ec',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShoppingBag size={32} color="#d3ad2f" strokeWidth={1.5} />
              </div>
              <div>
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#352820', fontSize: '15px' }}>
                  Tu carrito está vacío
                </p>
                <p style={{ margin: 0, color: '#a78665', fontSize: '13px' }}>
                  Agregá productos para comenzar tu compra
                </p>
              </div>
              <button
                onClick={closeCartDrawer}
                style={{
                  marginTop: '8px',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  border: '1.5px solid #d3ad2f',
                  background: 'transparent',
                  color: '#4b382b',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fdf7ec'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                Seguir explorando
              </button>
            </div>
          ) : (
            /* Lista de items */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #f0ece6',
                    background: '#fdfcfb',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Imagen */}
                  {item.imagen_url && (
                    <div
                      style={{
                        width: '60px',
                        height: '60px',
                        flexShrink: 0,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#fff',
                        border: '1px solid #ede8e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={item.imagen_url}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                      />
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        margin: '0 0 2px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#352820',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.name}
                    </h3>
                    {item.isOffer && (
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: '#6fb4d0',
                          background: '#eef7fc',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          marginBottom: '4px',
                        }}
                      >
                        OFERTA
                      </span>
                    )}
                    <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800, color: '#4b382b' }}>
                      {formatPrice(item.price)}
                    </p>

                    {/* Controles cantidad + borrar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Stepper */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          border: '1px solid #e5ddd4',
                          borderRadius: '7px',
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Disminuir cantidad"
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#4b382b',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fdf7ec'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <span
                          style={{
                            width: '28px',
                            textAlign: 'center',
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#352820',
                            borderLeft: '1px solid #e5ddd4',
                            borderRight: '1px solid #e5ddd4',
                            lineHeight: '28px',
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const maxStock = item.stock || 99;
                            if (item.quantity < maxStock) updateQuantity(item.id, item.quantity + 1);
                          }}
                          aria-label="Aumentar cantidad"
                          style={{
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#4b382b',
                            transition: 'background 0.12s',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#fdf7ec'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Eliminar ${item.name}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#a78665',
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '4px 6px',
                          borderRadius: '6px',
                          transition: 'color 0.15s, background 0.15s',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#b91c1c'; e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#a78665'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Trash2 size={13} strokeWidth={1.8} />
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Footer con total y CTA ── */}
        {cart.length > 0 && (
          <div
            style={{
              borderTop: '1px solid #f0ece6',
              padding: '16px 20px',
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {/* Resumen total */}
            <div
              style={{
                background: '#fdf7ec',
                borderRadius: '10px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#a78665', fontWeight: 600 }}>Subtotal (sin envío)</span>
                <span style={{ fontSize: '12px', color: '#4b382b', fontWeight: 700 }}>{formatPrice(getCartTotal())}</span>
              </div>
              <div style={{ borderTop: '1px solid #ede8d6', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', color: '#352820', fontWeight: 800 }}>Total</span>
                <span style={{ fontSize: '18px', color: '#352820', fontWeight: 800 }}>{formatPrice(getCartTotal())}</span>
              </div>
            </div>

            {/* CTA principal: Iniciar compra */}
            <Link
              to="/cart"
              onClick={closeCartDrawer}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '13px 20px',
                borderRadius: '10px',
                background: '#352820',
                color: '#d3ad2f',
                fontSize: '14px',
                fontWeight: 800,
                textDecoration: 'none',
                boxSizing: 'border-box',
                transition: 'background 0.18s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#4b382b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#352820'; }}
            >
              Iniciar Compra
              <ArrowRight size={16} strokeWidth={2.5} />
            </Link>

            {/* Botón secundario: seguir comprando */}
            <button
              onClick={closeCartDrawer}
              style={{
                width: '100%',
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1.5px solid #e5ddd4',
                background: 'transparent',
                color: '#4b382b',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'border-color 0.15s, background 0.15s',
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#fdf7ec'; e.currentTarget.style.borderColor = '#d3ad2f'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#e5ddd4'; }}
            >
              Seguir comprando
            </button>
          </div>
        )}
      </div>
    </>
  );
}
