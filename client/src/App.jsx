import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ClientAuthProvider } from './context/ClientAuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import WhatsAppFloat from './components/WhatsAppFloat';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ClientOrders from './pages/ClientOrders';

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
            {!isAdminRoute && <Navbar />}
            {!isAdminRoute && <CartDrawer />}
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
            {!isAdminRoute && <Footer />}
            {!isAdminRoute && <WhatsAppFloat />}
          </div>
  );
}

export default function App() {
  return (
    <ClientAuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </ClientAuthProvider>
  );
}
