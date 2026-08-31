import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ShieldCheck, User, Package, LogOut, ChevronDown, Search, Truck, Banknote, Star, Zap, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';

const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

export default function Navbar() {
  const { getCartCount } = useCart();
  const { clientUser, clientToken, isAdmin, clientLogout } = useClientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  
  // Search Autocomplete State
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const userMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUnreadMessages = () => {
      if (!clientUser) {
        setUnreadMessages(0);
        return;
      }
      const request = isAdmin ? api.getAdminMessages() : api.getClientOrders(clientToken);
      request
        .then(items => setUnreadMessages(isAdmin
          ? items.reduce((total, thread) => total + thread.no_leidos, 0)
          : items.reduce((total, order) => total + Number(order.mensajes_no_leidos || 0), 0)))
        .catch(() => setUnreadMessages(0));
    };
    loadUnreadMessages();
    window.addEventListener('messages-read', loadUnreadMessages);
    return () => window.removeEventListener('messages-read', loadUnreadMessages);
  }, [clientUser, clientToken, isAdmin]);

  // Load products for client-side instant search autocomplete
  useEffect(() => {
    api.getProducts()
      .then(setAllProducts)
      .catch((err) => console.error('Error al cargar productos para autocompletado:', err));
  }, []);

  // Debounced search filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const query = searchQuery.toLowerCase().trim();
        const matches = allProducts
          .filter(
            (p) => p.name.toLowerCase().includes(query) || (p.description && p.description.toLowerCase().includes(query)) || p.category.toLowerCase().includes(query)
          )
          .slice(0, 6);
        setSuggestions(matches);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, allProducts]);

  // Close user dropdown and search suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    clientLogout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setShowSuggestions(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/catalog');
    }
  };

  const handleSelectSuggestion = (productId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    navigate(`/product/${productId}`);
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalog' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      {/* ─── Top Benefit Bar (Estilo MisPichos / Timberline) ─── */}
      <div className="bg-[#0f172a] text-white text-[11px] font-semibold py-1.5 px-4 hidden sm:block border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Envíos Gratis a partir de <strong className="text-white">$35.000</strong></span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Banknote className="w-3.5 h-3.5 text-amber-400" />
              <span><strong className="text-amber-400">10% OFF</strong> pagando con Transferencia / Efectivo</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1 text-slate-300">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <strong className="text-white">4.9 / 5</strong> (Opiniones Reales)
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-red-400" />
              <span>Entrega rápida <strong className="text-white">24/48 hs</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* ─── Main Header ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#e52521] flex items-center justify-center text-white font-black text-xl shadow-sm">
              🐾
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xl tracking-tight text-gray-900 leading-none">
                Huellitas<span className="text-[#e52521]">&amp;</span>Cía
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">
                Pet Shop &amp; Mascotas
              </span>
            </div>
          </Link>

          {/* Central Search Bar with Autocomplete */}
          <div ref={searchContainerRef} className="hidden md:block flex-grow max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar por alimento, marca o producto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-gray-100 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-800 placeholder-gray-400 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#e52521] hover:bg-[#c91d19] text-white rounded-md text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Desktop Autocomplete Dropdown Overlay */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden text-left divide-y divide-gray-100">
                {suggestions.length > 0 ? (
                  <>
                    <div className="p-2 bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      Sugerencias de productos
                    </div>
                    {suggestions.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSuggestion(item.id)}
                        className="p-2.5 hover:bg-red-50/60 transition-colors flex items-center gap-3 cursor-pointer group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 shrink-0 p-0.5">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-extrabold text-xs text-gray-900 group-hover:text-[#e52521] truncate">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-gray-400 font-semibold capitalize block">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-black text-xs text-gray-900">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 text-[#e52521] font-extrabold text-[11px] text-center border-t border-gray-100 transition-colors cursor-pointer"
                    >
                      Ver todos los resultados para "{searchQuery}" &rarr;
                    </button>
                  </>
                ) : (
                  <div className="p-3 text-center text-xs font-semibold text-gray-400">
                    No se encontraron productos que coincidan con "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `font-bold text-xs uppercase tracking-wider transition-colors py-1 border-b-2 ${
                    isActive
                      ? 'text-[#e52521] border-[#e52521]'
                      : 'text-gray-700 border-transparent hover:text-[#e52521]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Client Account Dropdown */}
            {clientUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#e52521] flex items-center justify-center text-white text-xs font-black">
                    {clientUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-extrabold text-gray-800 hidden sm:inline">
                    {clientUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 z-10 min-w-[18px] h-[18px] px-1 rounded-full bg-[#e52521] border-2 border-white text-white text-[9px] font-black flex items-center justify-center shadow-sm" aria-label={`${unreadMessages} mensajes sin leer`}>
                    {unreadMessages}
                  </span>
                )}

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 text-left">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{clientUser.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{clientUser.email}</p>
                    </div>
                    {isAdmin ? (
                      <>
                        <Link to="/admin?tab=sales&view=pending" onClick={handleLinkClick} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#e52521] transition-colors">
                          <Package className="w-4 h-4" /> Pendientes
                        </Link>
                        <Link to="/admin?tab=sales&view=resolved" onClick={handleLinkClick} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#e52521] transition-colors">
                          <ShoppingCart className="w-4 h-4" /> Ventas
                        </Link>
                        <Link to="/admin?tab=messages" onClick={handleLinkClick} className="flex items-center justify-between gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#e52521] transition-colors">
                          <span className="flex items-center gap-2.5"><MessageCircle className="w-4 h-4" /> Mensajes</span>
                        </Link>
                      </>
                    ) : (
                      <Link to="/mis-pedidos" onClick={handleLinkClick} className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 hover:text-[#e52521] transition-colors">
                        <Package className="w-4 h-4" /> Mis Pedidos
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 w-full transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all"
                title="Iniciar Sesión"
              >
                <User className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline">Ingresar</span>
              </Link>
            )}

            {/* Admin Access Panel Icon */}
            {isAdmin && (
              <Link
                to="/admin"
                className="p-2 text-gray-400 hover:text-slate-900 rounded-lg hover:bg-gray-100 transition-colors"
                title="Panel Admin"
              >
                <ShieldCheck className="w-5 h-5" />
              </Link>
            )}

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative px-3.5 py-2 bg-[#e52521] hover:bg-[#c91d19] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Carrito</span>
              {getCartCount() > 0 && (
                <span className="bg-white text-[#e52521] font-black text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white py-4 px-6 space-y-3">
          <div className="relative mb-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-lg bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-800"
              />
              <button type="submit" className="absolute right-2 top-2 text-gray-500">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Suggestions */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-left divide-y divide-gray-100 max-h-60 overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item.id)}
                      className="p-2 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded bg-gray-50 border p-0.5" />
                      <div className="flex-grow min-w-0">
                        <p className="font-extrabold text-xs text-gray-900 truncate">{item.name}</p>
                        <span className="font-black text-[11px] text-[#e52521]">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-center text-xs text-gray-400">Sin resultados</div>
                )}
              </div>
            )}
          </div>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className="block font-bold text-sm text-gray-800 hover:text-[#e52521] py-2 border-b border-gray-100"
            >
              {link.name}
            </Link>
          ))}
          {clientUser ? (
            <>
              <div className="py-2 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-900">{clientUser.name}</p>
                <p className="text-[10px] text-gray-400">{clientUser.email}</p>
              </div>
              {isAdmin ? (
                <>
                      <Link to="/admin?tab=sales&view=pending" onClick={handleLinkClick} className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#e52521] py-2 border-b border-gray-100"><Package className="w-4 h-4" /> Pendientes</Link>
                      <Link to="/admin?tab=sales&view=resolved" onClick={handleLinkClick} className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#e52521] py-2 border-b border-gray-100"><ShoppingCart className="w-4 h-4" /> Ventas</Link>
                  <Link to="/admin?tab=messages" onClick={handleLinkClick} className="flex items-center justify-between gap-2 text-sm font-bold text-gray-800 hover:text-[#e52521] py-2 border-b border-gray-100"><span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Mensajes</span>{isAdmin && unreadMessages > 0 && <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-[#e52521] text-white text-[10px] font-black flex items-center justify-center">{unreadMessages}</span>}</Link>
                </>
              ) : (
                <Link to="/mis-pedidos" onClick={handleLinkClick} className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#e52521] py-2 border-b border-gray-100"><Package className="w-4 h-4" /> Mis Pedidos</Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold text-red-600 py-2 border-b border-gray-100 w-full text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={handleLinkClick}
              className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#e52521] py-2 border-b border-gray-100"
            >
              <User className="w-4 h-4" /> Iniciar Sesión
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={handleLinkClick}
              className="flex items-center gap-2 text-sm font-bold text-gray-600 py-2"
            >
              <ShieldCheck className="w-4 h-4" /> Panel Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
