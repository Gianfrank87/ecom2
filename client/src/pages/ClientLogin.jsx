import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
import { api } from '../services/api';
import { AlertCircle } from 'lucide-react';

export default function ClientLogin() {
  const [identifier, setIdentifier] = useState('');
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

    if (!identifier || !password) {
      setError('Por favor, completá todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.clientLogin(identifier, password);
      clientLogin(data.token, data.user);
      navigate(from);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-180px)] bg-[#d8b538] flex items-center justify-center py-12 px-4 text-left">
      <div className="bg-white border border-[#352820]/30 rounded-none p-8 sm:p-10 shadow-2xl max-w-md w-full text-center">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-[#352820] tracking-tight mb-2">Iniciar Sesión</h1>
        <p className="text-gray-600 text-xs sm:text-sm mb-6 font-medium">Ingresá a tu cuenta para comprar y ver tus pedidos en NigDiz.</p>

        {location.state?.message && (
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-none p-3 text-xs mb-6 flex items-center gap-2 text-left font-bold">
            <span>✅ {location.state.message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-none p-3 text-xs mb-6 flex items-center gap-2 text-left font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-extrabold text-[#352820] uppercase tracking-wider mb-1.5">Email o usuario</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="tu@email.com o usuario"
              className="w-full px-4 py-2.5 rounded-none border border-[#352820]/30 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#352820] focus:border-[#352820] text-xs font-semibold text-[#352820] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-[#352820] uppercase tracking-wider mb-1.5">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-none border border-[#352820]/30 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#352820] focus:border-[#352820] text-xs font-semibold text-[#352820] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-none bg-[#352820] hover:bg-[#4b382b] disabled:bg-gray-300 text-[#f0dc78] font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex justify-center items-center"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-600 font-medium">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" state={{ from }} className="text-[#352820] font-extrabold hover:underline">
            Registrate acá
          </Link>
        </p>
      </div>
    </div>
  );
}
