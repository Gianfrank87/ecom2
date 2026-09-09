import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Menu, X, ShieldCheck, User, Package, LogOut, Search, MessageCircle } from 'lucide-react';

const BRAND_LOGO = 'https://res.cloudinary.com/dl3t6vykm/image/upload/v1788907250/copy_of_0eab9e86-bf10-4de7-8c39-d84f17317403.png';
import { useCart } from '../context/CartContext';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';

const formatPrice = (value) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(value);

export default function Navbar() {
  const { getCartCount, toggleCartDrawer } = useCart();
  const { clientUser, clientToken, isAdmin, clientLogout } = useClientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [adminNotifications, setAdminNotifications] = useState({ sales: 0, messages: 0 });
  const [isScrolled, setIsScrolled] = useState(false);

  // Search Autocomplete State
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const userMenuRef = useRef(null);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();

  // Scroll listener for sticky header shrink effect
  // Shrink when scrolling down past 50px, Expand ONLY when returning to the very top (y <= 5px)
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled((prev) => {
        if (!prev && y > 50) return true;
        if (prev && y <= 5) return false;
        return prev;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadUnreadMessages = () => {
      if (!clientUser) {
        setUnreadMessages(0);
        setAdminNotifications({ sales: 0, messages: 0 });
        return;
      }

      if (isAdmin) {
        Promise.all([
          api.getAdminMessages(),
          api.getOrders()
        ])
          .then(([messageThreads, orders]) => {
            const salesCount = orders.filter((order) => order.estado === 'pendiente').length;
            const messagesCount = messageThreads.reduce((total, thread) => total + thread.no_leidos, 0);
            setUnreadMessages(messagesCount);
            setAdminNotifications({ sales: salesCount, messages: messagesCount });
          })
          .catch(() => {
            setUnreadMessages(0);
            setAdminNotifications({ sales: 0, messages: 0 });
          });
        return;
      }

      api.getClientOrders(clientToken)
        .then((orders) => setUnreadMessages(
          orders.reduce((total, order) => total + Number(order.mensajes_no_leidos || 0), 0)
        ))
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
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setShowSuggestions(false);
    setIsSearchExpanded(false);
  };

  const totalAdminNotifications = adminNotifications.sales + adminNotifications.messages;

  const handleLogout = () => {
    clientLogout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setShowSuggestions(false);
    setIsSearchExpanded(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setIsSearchExpanded(false);
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/catalog');
    }
  };

  const handleSelectSuggestion = (productId) => {
    setShowSuggestions(false);
    setIsSearchExpanded(false);
    setSearchQuery('');
    setMobileMenuOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleNavClick = (link, e) => {
    if (link.name === 'Inicio') {
      if (window.location.pathname === '/') {
        e.preventDefault();
        handleLinkClick();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // Otherwise let the Link navigate normally
      handleLinkClick();
      return;
    }
    if (link.name === 'Cómo Comprar') {
      e.preventDefault();
      handleLinkClick();
      if (window.location.pathname === '/') {
        const target = document.getElementById('como-comprar-section');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/?scroll=como-comprar');
      }
      return;
    }
    if (link.name === 'Acerca de Nosotros') {
      e.preventDefault();
      handleLinkClick();
      if (window.location.pathname === '/') {
        const target = document.getElementById('acerca-de-nosotros-section');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/?scroll=acerca-de-nosotros');
      }
      return;
    }
    if (link.name === 'Acerca de Nigdiz') {
      e.preventDefault();
      handleLinkClick();
      if (window.location.pathname === '/') {
        const target = document.getElementById('acerca-de-nigdiz-section');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/?scroll=acerca-de-nigdiz');
      }
      return;
    }
    if (link.name === 'Guía de talles') {
      e.preventDefault();
      handleLinkClick();
      if (window.location.pathname === '/') {
        const target = document.getElementById('guia-de-talles-section');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/?scroll=guia-de-talles');
      }
      return;
    }
    if (link.name === 'Contáctanos') {
      e.preventDefault();
      handleLinkClick();
      if (window.location.pathname === '/') {
        const target = document.getElementById('contacto-section');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/?scroll=contacto');
      }
      return;
    }
    if (link.path === '#') {
      e.preventDefault();
    } else {
      handleLinkClick();
    }
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/catalog' },
    { name: 'Guía de talles', path: '#' },
    { name: 'Cómo Comprar', path: '#como-comprar-section' },
    { name: 'Acerca de Nigdiz', path: '#acerca-de-nigdiz-section' },
    { name: 'Acerca de Nosotros', path: '#acerca-de-nosotros-section' },
    { name: 'Contáctanos', path: '#' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${isScrolled ? 'shadow-md border-b border-gray-100' : 'border-b border-gray-100/60'
        }`}
      style={{ fontFamily: "'Plus Jakarta Sans', 'Open Sans', sans-serif" }}
    >
      {/* ─── Top Header Row (Search Icon, Centered Logo, Right Actions) ─── */}
      <div className={`w-full px-6 lg:px-12 bg-white transition-all duration-300 ${isScrolled ? 'py-1.5' : 'py-3.5'}`}>
        <div className="flex items-center justify-between relative min-h-[40px]">

          {/* ─── LEFT: Search Toggle ─── */}
          <div className="flex-1 flex justify-start items-center relative" ref={searchContainerRef}>
            <button
              type="button"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="p-1.5 text-gray-800 hover:text-[#d3ad2f] transition-colors cursor-pointer"
              aria-label="Buscar"
              title="Buscar productos"
            >
              <Search className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Expandable Search Input & Dropdown */}
            {isSearchExpanded && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-2.5 z-50">
                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Buscar alimento, marca o producto..."
                    value={searchQuery}
                    autoFocus
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-md bg-gray-50 border border-gray-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d3ad2f] text-xs text-gray-800 placeholder-gray-500"
                    aria-label="Buscador de productos"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 p-1 text-gray-600 hover:text-[#d3ad2f] transition-colors cursor-pointer"
                    aria-label="Buscar"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </form>

                {/* Suggestions Dropdown */}
                {showSuggestions && (
                  <div className="mt-2 divide-y divide-gray-100 max-h-60 overflow-y-auto bg-white rounded-md">
                    {suggestions.length > 0 ? (
                      suggestions.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSuggestion(item.id)}
                          className="p-2 hover:bg-amber-50 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <img src={item.image} alt={item.name} className="w-8 h-8 object-contain rounded bg-gray-100 p-0.5 shrink-0" />
                          <div className="flex-grow min-w-0">
                            <p className="font-bold text-xs text-gray-900 truncate">{item.name}</p>
                            <span className="text-[10px] text-gray-500 capitalize block">{item.category}</span>
                          </div>
                          <span className="font-bold text-xs text-gray-900 shrink-0">{formatPrice(item.price)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs text-gray-500">
                        No se encontraron productos
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── CENTER: Logo ─── */}
          <div className="flex-1 flex justify-center items-center">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="flex items-center justify-center"
              aria-label="Volver a inicio - NigDiz"
            >
              <img
                src={BRAND_LOGO}
                alt="Logo de NIGDIZ"
                className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-8 sm:h-9' : 'h-11 sm:h-13'
                  }`}
              />
            </Link>
          </div>

          {/* ─── RIGHT: User & Shopping Bag Icons ─── */}
          <div className="flex-1 flex justify-end items-center gap-4 sm:gap-5">
            {/* User Dropdown / Icon */}
            {clientUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-1.5 text-gray-800 hover:text-[#d3ad2f] transition-colors cursor-pointer relative group flex items-center"
                  aria-label={`Menú de usuario: ${clientUser.name}`}
                >
                  <User className="w-5 h-5 stroke-[1.5]" />

                  {/* Notification Badge */}
                  {totalAdminNotifications > 0 && (
                    <span
                      className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center"
                      aria-label={`${totalAdminNotifications} notificaciones pendientes`}
                    >
                      {totalAdminNotifications}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900">{clientUser.name}</p>
                      <p className="text-xs text-gray-500 truncate">{clientUser.email}</p>
                    </div>
                    {isAdmin ? (
                      <>
                        <Link
                          to="/admin?tab=sales&view=pending"
                          onClick={handleLinkClick}
                          className="flex items-center justify-between gap-3 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-amber-50 hover:text-[#d3ad2f] transition-colors"
                        >
                          <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Pendientes</span>
                          {adminNotifications.sales > 0 && (
                            <span className="min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                              {adminNotifications.sales}
                            </span>
                          )}
                        </Link>
                        <Link
                          to="/admin?tab=sales&view=resolved"
                          onClick={handleLinkClick}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-amber-50 hover:text-[#d3ad2f] transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" /> Ventas
                        </Link>
                        <Link
                          to="/admin?tab=messages"
                          onClick={handleLinkClick}
                          className="flex items-center justify-between gap-3 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-amber-50 hover:text-[#d3ad2f] transition-colors"
                        >
                          <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Mensajes</span>
                          {adminNotifications.messages > 0 && (
                            <span className="min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                              {adminNotifications.messages}
                            </span>
                          )}
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/mis-pedidos"
                        onClick={handleLinkClick}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-amber-50 hover:text-[#d3ad2f] transition-colors"
                      >
                        <Package className="w-4 h-4" /> Mis Pedidos
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 w-full transition-colors cursor-pointer border-t border-gray-100 mt-1"
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
                className="p-1.5 text-gray-800 hover:text-[#d3ad2f] transition-colors"
                title="Iniciar Sesión"
              >
                <User className="w-5 h-5 stroke-[1.5]" />
              </Link>
            )}

            {/* Admin Shield Icon */}
            {isAdmin && (
              <Link
                to="/admin"
                className="p-1.5 text-gray-700 hover:text-[#d3ad2f] transition-colors"
                title="Panel Admin"
                aria-label="Acceso al panel administrativo"
              >
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
              </Link>
            )}

            {/* Shopping Bag Button with Superscript Count */}
            <button
              onClick={toggleCartDrawer}
              className="relative p-1.5 text-gray-800 hover:text-[#d3ad2f] transition-colors flex items-center cursor-pointer"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="absolute -top-1.5 -right-1 text-[11px] font-semibold text-gray-900 leading-none">
                {getCartCount()}
              </span>
            </button>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-800 hover:text-[#d3ad2f] transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 stroke-[1.5]" /> : <Menu className="w-6 h-6 stroke-[1.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Navigation Menu Row ─── */}
      <div className={`hidden md:block bg-white transition-all duration-300 ${isScrolled ? 'py-1 border-t border-gray-100/60' : 'py-2 sm:py-2.5'}`}>
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-6 sm:gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={(e) => handleNavClick(link, e)}
                className={({ isActive }) =>
                  `font-semibold transition-all ${isScrolled ? 'text-xs' : 'text-xs sm:text-sm'
                  } ${isActive && link.path !== '#' && link.name !== 'Cómo Comprar'
                    ? 'text-gray-900'
                    : 'text-gray-800 hover:text-[#d3ad2f]'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* ─── Mobile Menu Drawer ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white py-4 px-4 space-y-3">
          {/* Mobile Search */}
          <div className="mb-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-lg bg-gray-50 border border-gray-300 text-xs font-normal text-gray-800 placeholder-gray-500"
                aria-label="Buscador en móvil"
              />
              <button
                type="submit"
                className="absolute right-2 top-2.5 text-gray-500 hover:text-[#d3ad2f] cursor-pointer"
                aria-label="Buscar en móvil"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Mobile Nav Links */}
          {navLinks.map((link) => (
            <Link
              key={link.path + link.name}
              to={link.path}
              onClick={(e) => handleNavClick(link, e)}
              className="block text-sm font-semibold text-gray-800 hover:text-[#d3ad2f] py-2 border-b border-gray-100"
            >
              {link.name}
            </Link>
          ))}

          {/* Mobile User Actions */}
          {clientUser ? (
            <>
              <div className="py-2 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">{clientUser.name}</p>
                <p className="text-xs text-gray-500">{clientUser.email}</p>
              </div>
              {isAdmin ? (
                <>
                  <Link
                    to="/admin?tab=sales&view=pending"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between gap-2 text-sm font-bold text-gray-800 hover:text-[#d3ad2f] py-2 border-b border-gray-100"
                  >
                    <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Pendientes</span>
                    {adminNotifications.sales > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {adminNotifications.sales}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/admin?tab=sales&view=resolved"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#d3ad2f] py-2 border-b border-gray-100"
                  >
                    <ShoppingCart className="w-4 h-4" /> Ventas
                  </Link>
                  <Link
                    to="/admin?tab=messages"
                    onClick={handleLinkClick}
                    className="flex items-center justify-between gap-2 text-sm font-bold text-gray-800 hover:text-[#d3ad2f] py-2 border-b border-gray-100"
                  >
                    <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Mensajes</span>
                    {adminNotifications.messages > 0 && (
                      <span className="min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {adminNotifications.messages}
                      </span>
                    )}
                  </Link>
                </>
              ) : (
                <Link
                  to="/mis-pedidos"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#d3ad2f] py-2 border-b border-gray-100"
                >
                  <Package className="w-4 h-4" /> Mis Pedidos
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 py-2 border-b border-gray-100 w-full text-left cursor-pointer rounded transition-colors"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={handleLinkClick}
              className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-[#d3ad2f] py-2 border-b border-gray-100"
            >
              <User className="w-4 h-4" /> Iniciar Sesión
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={handleLinkClick}
              className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-[#d3ad2f] py-2"
            >
              <ShieldCheck className="w-4 h-4" /> Panel Admin
            </Link>
          )}
        </div>
      )}
    </header>
  );
}


