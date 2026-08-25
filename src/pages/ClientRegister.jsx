import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useClientAuth } from '../context/ClientAuthContext';
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
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.password) {
      setError('Por favor, completa todos los campos.');
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
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white border border-accent-100 rounded-3xl p-8 shadow-premium text-center space-y-4">
          <div className="w-16 h-16 bg-sage-50 border border-sage-100 rounded-full flex items-center justify-center mx-auto text-sage-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-gray-800">¡Registro Exitoso!</h2>
          <p className="text-gray-500 text-sm">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white border border-accent-100 rounded-3xl p-8 shadow-premium text-center">
        <h1 className="font-display font-extrabold text-2xl text-gray-800 mb-2">Crear Cuenta</h1>
        <p className="text-gray-500 text-sm mb-6">Registrate para realizar compras y guardar tu historial.</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center gap-2 text-left">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre Completo</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Laura González"
              className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimo 6 caracteres"
              className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repetí tu contraseña"
              className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 rounded-2xl bg-accent-500 hover:bg-accent-600 disabled:bg-accent-300 text-white font-display font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex justify-center items-center"
          >
            {loading ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" state={{ from }} className="text-accent-600 font-bold hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
