import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ClientAuthProvider } from './context/ClientAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ClientOrders from './pages/ClientOrders';

const PRODUCTION_GATE_KEY = 'huellitas_production_gate';
const PRODUCTION_PASSWORD = 'Produccion2026';

function ProductionAccessGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password === PRODUCTION_PASSWORD) {
      localStorage.setItem(PRODUCTION_GATE_KEY, 'true');
      onUnlock();
      return;
    }

    setError('Contraseña incorrecta. Intentalo nuevamente.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl p-8">
        <div className="text-center mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Acceso restringido</p>
          <h1 className="mt-3 text-2xl font-black text-slate-900">Sitio en etapa de producción</h1>
        </div>

        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Para ingresar, indicá la contraseña de acceso del sitio.
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none ring-0 focus:border-red-500"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#e52521] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#c91d19]"
          >
            Entrar al sitio
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem(PRODUCTION_GATE_KEY) === 'true');

  useEffect(() => {
    const syncGateState = () => {
      setIsUnlocked(localStorage.getItem(PRODUCTION_GATE_KEY) === 'true');
    };

    window.addEventListener('storage', syncGateState);
    return () => window.removeEventListener('storage', syncGateState);
  }, []);

  if (!isUnlocked) {
    return <ProductionAccessGate onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <ClientAuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/login" element={<ClientLogin />} />
                <Route path="/registro" element={<ClientRegister />} />
                <Route path="/mis-pedidos" element={<ClientOrders />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </ClientAuthProvider>
  );
}
