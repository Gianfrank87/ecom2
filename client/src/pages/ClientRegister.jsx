import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ClientRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, completá todos los campos.');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await api.clientRegister(formData.name, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login', { state: { from, message: 'Registro exitoso. Iniciá sesión para continuar.' } });
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-[calc(100vh-180px)] bg-[#d8b538] flex items-center justify-center py-12 px-4 text-left">
        <div className="bg-white border border-[#352820]/30 rounded-none p-8 sm:p-10 shadow-2xl max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-none flex items-center justify-center mx-auto text-emerald-700">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-extrabold text-2xl text-[#352820]">¡Registro Exitoso!</h2>
          <p className="text-gray-600 text-xs font-semibold">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-180px)] bg-[#d8b538] flex items-center justify-center py-12 px-4 text-left">
      <div className="bg-white border border-[#352820]/30 rounded-none p-8 sm:p-10 shadow-2xl max-w-md w-full text-center">
        <h1 className="font-extrabold text-2xl sm:text-3xl text-[#352820] tracking-tight mb-2">Crear Cuenta</h1>
        <p className="text-gray-600 text-xs sm:text-sm mb-6 font-medium">Registrate para realizar compras y guardar tu historial en NigDiz.</p>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 rounded-none p-3 text-xs mb-6 flex items-center gap-2 text-left font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-extrabold text-[#352820] uppercase tracking-wider mb-1.5">Nombre Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Laura González"
              className="w-full px-4 py-2.5 rounded-none border border-[#352820]/30 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#352820] focus:border-[#352820] text-xs font-semibold text-[#352820] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-[#352820] uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-none border border-[#352820]/30 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#352820] focus:border-[#352820] text-xs font-semibold text-[#352820] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-[#352820] uppercase tracking-wider mb-1.5">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-2.5 rounded-none border border-[#352820]/30 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#352820] focus:border-[#352820] text-xs font-semibold text-[#352820] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold text-[#352820] uppercase tracking-wider mb-1.5">Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repetí tu contraseña"
              className="w-full px-4 py-2.5 rounded-none border border-[#352820]/30 bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#352820] focus:border-[#352820] text-xs font-semibold text-[#352820] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-none bg-[#352820] hover:bg-[#4b382b] disabled:bg-gray-300 text-[#f0dc78] font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer flex justify-center items-center"
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-600 font-medium">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" state={{ from }} className="text-[#352820] font-extrabold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
