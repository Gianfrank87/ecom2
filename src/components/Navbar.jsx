import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, ShieldCheck, User, Package, LogOut, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useClientAuth } from '../context/ClientAuthContext';

export default function Navbar() {
  const { getCartCount } = useCart();
  const { clientUser, clientLogout } = useClientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    clientLogout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalog' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200 bg-[#fdfcf7]/95 backdrop-blur-md border-b border-accent-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-premium transform group-hover:scale-105 transition-transform duration-200">
              🐾
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-accent-800">
                Huellitas & Cía
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sage-500 -mt-1">
                Pet Shop & Care
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `font-display text-sm font-medium tracking-wide transition-colors py-2 border-b-2 ${
                    isActive
                      ? 'text-accent-500 border-accent-400'
                      : 'text-gray-600 border-transparent hover:text-accent-700'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-3">
            {/* Client Account Dropdown */}
            {clientUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-accent-50 hover:bg-accent-100 border border-accent-100 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center text-white text-xs font-black">
                    {clientUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-bold text-gray-700">
                    {clientUser.name.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-accent-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-accent-50">
                      <p className="text-xs font-black text-gray-700 truncate">{clientUser.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{clientUser.email}</p>
                    </div>
                    <Link
                      to="/mis-pedidos"
                      onClick={handleLinkClick}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-accent-50 hover:text-accent-700 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
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
                className="p-2 text-gray-500 hover:text-accent-600 rounded-full hover:bg-accent-50/50 transition-colors"
                title="Iniciar Sesión"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Admin Access Panel Icon */}
            <Link
              to="/admin"
              className="p-2 text-gray-500 hover:text-sage-600 rounded-full hover:bg-sage-50/50 transition-colors"
              title="Panel Admin"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 bg-accent-100 hover:bg-accent-200 text-accent-800 rounded-full transition-all duration-200 hover:scale-105 flex items-center justify-center"
              aria-label="Ver carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-sage-500 text-white font-display font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#fdfcf7] animate-pulse">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-gray-600 hover:text-accent-800 hover:bg-accent-50 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-accent-100 bg-[#fdfcf7] py-4 px-6 space-y-3 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={handleLinkClick}
              className="block font-display text-base font-semibold text-gray-700 hover:text-accent-600 py-2 border-b border-accent-50"
            >
              {link.name}
            </Link>
          ))}
          {clientUser ? (
            <>
              <div className="py-2 border-b border-accent-50">
                <p className="text-xs font-black text-gray-700">{clientUser.name}</p>
                <p className="text-[10px] text-gray-400">{clientUser.email}</p>
              </div>
              <Link
                to="/mis-pedidos"
                onClick={handleLinkClick}
                className="flex items-center gap-2 font-display text-base font-semibold text-gray-700 hover:text-accent-600 py-2 border-b border-accent-50"
              >
                <Package className="w-5 h-5" /> Mis Pedidos
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 font-display text-base font-semibold text-red-500 hover:text-red-600 py-2 border-b border-accent-50 w-full text-left"
              >
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={handleLinkClick}
              className="flex items-center gap-2 font-display text-base font-semibold text-gray-700 hover:text-accent-600 py-2 border-b border-accent-50"
            >
              <User className="w-5 h-5" /> Iniciar Sesión
            </Link>
          )}
          <Link
            to="/admin"
            onClick={handleLinkClick}
            className="flex items-center gap-2 font-display text-base font-semibold text-gray-700 hover:text-sage-600 py-2"
          >
            <ShieldCheck className="w-5 h-5" /> Panel Admin
          </Link>
        </div>
      )}
    </header>
  );
}
