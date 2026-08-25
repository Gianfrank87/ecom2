import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';
import { AlertCircle } from 'lucide-react';

export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { clientLogin } = useClientAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If redirected from cart, we go back there after login
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.clientLogin(email, password);
      clientLogin(data.token, data.user);
      navigate(from);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white border border-accent-100 rounded-3xl p-8 shadow-premium text-center">
        <h1 className="font-display font-extrabold text-2xl text-gray-800 mb-2">Iniciar Sesión</h1>
        <p className="text-gray-500 text-sm mb-6">Ingresá a tu cuenta para comprar y ver tus pedidos.</p>
        
        {location.state?.message && (
          <div className="bg-sage-50 text-sage-600 p-3 rounded-xl text-sm mb-6 flex items-center gap-2 text-left">
            <span>✅ {location.state.message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center gap-2 text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-2xl bg-accent-500 hover:bg-accent-600 disabled:bg-accent-300 text-white font-display font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex justify-center items-center"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" state={{ from }} className="text-accent-600 font-bold hover:underline">
            Registrate acá
          </Link>
        </p>
      </div>
    </div>
  );
}
