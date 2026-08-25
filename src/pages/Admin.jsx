import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Edit2, LogOut, FileText, CheckCircle, XCircle, Package, Tag, ShoppingCart, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// ─────────────── PRODUCT FORM ───────────────
function ProductForm({ editProduct, onSaved, onCancel, showFeedback }) {
  const EMPTY = { name: '', category: 'alimentos', price: '', description: '', image: '', stock: '', featured: false };
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editProduct) {
      setFormData({
        name: editProduct.name || '',
        category: editProduct.category || 'alimentos',
        price: editProduct.price !== undefined ? editProduct.price : '',
        description: editProduct.description || '',
        image: editProduct.image || '',
        stock: editProduct.stock !== undefined ? editProduct.stock : '',
        featured: Boolean(editProduct.featured)
      });
    } else {
      setFormData(EMPTY);
    }
    setErrors({});
  }, [editProduct]);

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'El nombre es obligatorio.';
    if (!formData.price || Number(formData.price) <= 0) e.price = 'Precio inválido.';
    if (!formData.description.trim()) e.description = 'La descripción es obligatoria.';
    if (!formData.image.trim() || !/^https?:\/\/.+/i.test(formData.image)) e.image = 'URL de imagen inválida.';
    if (formData.stock === '' || Number(formData.stock) < 0) e.stock = 'Stock inválido.';
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
    try {
      if (editProduct) {
        await api.updateProduct(editProduct.id, payload);
        showFeedback('Producto actualizado.');
      } else {
        await api.createProduct(payload);
        showFeedback('Producto creado.');
      }
      onSaved();
    } catch (err) { showFeedback(err.message, 'error'); }
  };

  const inp = (extra) => `w-full px-3 py-2 rounded-xl border bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all ${extra}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-xs">Nombre</label>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del producto"
          className={inp(errors.name ? 'border-red-400' : 'border-accent-100')} />
        {errors.name && <p className="err">{errors.name}</p>}
      </div>
      <div>
        <label className="label-xs">Categoría</label>
        <select name="category" value={formData.category} onChange={handleChange}
          className="w-full px-3 py-2 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-display font-semibold text-gray-700">
          {['alimentos','accesorios','higiene','juguetes','salud'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Precio (ARS)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0"
            className={inp(errors.price ? 'border-red-400' : 'border-accent-100')} />
          {errors.price && <p className="err">{errors.price}</p>}
        </div>
        <div>
          <label className="label-xs">Stock</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="0"
            className={inp(errors.stock ? 'border-red-400' : 'border-accent-100')} />
          {errors.stock && <p className="err">{errors.stock}</p>}
        </div>
      </div>
      <div>
        <label className="label-xs">Descripción</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Detalle..."
          className={inp(errors.description ? 'border-red-400' : 'border-accent-100')} />
        {errors.description && <p className="err">{errors.description}</p>}
      </div>
      <div>
        <label className="label-xs">URL de Imagen</label>
        <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..."
          className={inp(errors.image ? 'border-red-400' : 'border-accent-100')} />
        {errors.image && <p className="err">{errors.image}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange}
          className="w-4 h-4 rounded border-accent-100 text-accent-500 cursor-pointer" />
        <label htmlFor="featured" className="text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer">Destacar en Home ⭐</label>
      </div>
      <div className="flex gap-2 pt-2">
        {editProduct && (
          <button type="button" onClick={onCancel}
            className="w-1/3 py-2.5 rounded-xl border border-accent-100 text-gray-500 text-xs font-display font-bold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
        )}
        <button type="submit"
          className="flex-grow py-2.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-xs tracking-wide shadow-md transition-all hover:translate-y-[-1px] cursor-pointer">
          {editProduct ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
}

// ─────────────── OFFER FORM ───────────────
function OfferForm({ editOffer, products, onSaved, onCancel, showFeedback }) {
  const EMPTY = { nombre: '', producto_ids: [], descuento_o_precio_paquete: '', tipo_descuento: 'precio_paquete', prioridad: 0, activa: true };
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editOffer) {
      setForm({
        nombre: editOffer.nombre || '',
        producto_ids: editOffer.producto_ids || [],
        descuento_o_precio_paquete: editOffer.descuento_o_precio_paquete !== undefined ? editOffer.descuento_o_precio_paquete : '',
        tipo_descuento: editOffer.tipo_descuento || 'precio_paquete',
        prioridad: editOffer.prioridad !== undefined ? editOffer.prioridad : 0,
        activa: Boolean(editOffer.activa)
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [editOffer]);

  const toggleProduct = (id) => {
    const numId = Number(id);
    setForm(f => ({
      ...f,
      producto_ids: f.producto_ids.includes(numId)
        ? f.producto_ids.filter(x => x !== numId)
        : f.producto_ids.length < 3 ? [...f.producto_ids, numId] : f.producto_ids
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre de la oferta es obligatorio.';
    if (form.producto_ids.length < 2) e.productos = 'Seleccioná al menos 2 productos.';
    if (!form.descuento_o_precio_paquete || Number(form.descuento_o_precio_paquete) <= 0)
      e.descuento = 'Valor de descuento inválido.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = { ...form, descuento_o_precio_paquete: Number(form.descuento_o_precio_paquete), prioridad: Number(form.prioridad) };
    try {
      if (editOffer) {
        await api.updateOffer(editOffer.id, payload);
        showFeedback('Oferta actualizada.');
      } else {
        await api.createOffer(payload);
        showFeedback('Oferta creada.');
      }
      onSaved();
    } catch (err) { showFeedback(err.message, 'error'); }
  };

  const inp = (extra = '') => `w-full px-3 py-2 rounded-xl border bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body transition-all ${extra}`;
  const selectedTotal = form.producto_ids.reduce((sum, id) => {
    const p = products.find(x => Number(x.id) === id);
    return sum + (p ? p.price : 0);
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-xs">Nombre de la Oferta</label>
        <input name="nombre" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
          placeholder="Ej: Kit Baño Completo" className={inp(errors.nombre ? 'border-red-400' : 'border-accent-100')} />
        {errors.nombre && <p className="err">{errors.nombre}</p>}
      </div>

      <div>
        <label className="label-xs">Productos del pack (mín. 2, máx. 3)</label>
        <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
          {products.map(p => {
            const selected = form.producto_ids.includes(Number(p.id));
            const disabled = !selected && form.producto_ids.length >= 3;
            return (
              <label key={p.id} className={`flex items-center gap-2.5 p-2 rounded-xl border cursor-pointer transition-all ${
                selected ? 'border-accent-400 bg-accent-50' : disabled ? 'border-gray-100 opacity-40 cursor-not-allowed' : 'border-gray-100 hover:border-accent-200'
              }`}>
                <input type="checkbox" checked={selected} disabled={disabled} onChange={() => toggleProduct(p.id)}
                  className="w-3.5 h-3.5 rounded border-accent-100 text-accent-500 cursor-pointer" />
                <img src={p.image} alt={p.name} className="w-7 h-7 rounded-lg object-cover border border-gray-100 shrink-0" />
                <span className="text-xs font-medium text-gray-700 line-clamp-1 flex-grow">{p.name}</span>
                <span className="text-[10px] font-bold text-accent-600 shrink-0">
                  {new Intl.NumberFormat('es-AR', {style:'currency',currency:'ARS',minimumFractionDigits:0}).format(p.price)}
                </span>
              </label>
            );
          })}
        </div>
        {errors.productos && <p className="err">{errors.productos}</p>}
        {selectedTotal > 0 && (
          <p className="text-[10px] text-gray-400 mt-1">Total sin descuento: <strong>
            {new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:0}).format(selectedTotal)}
          </strong></p>
        )}
      </div>

      <div>
        <label className="label-xs">Tipo de Descuento</label>
        <select value={form.tipo_descuento} onChange={e => setForm(f => ({...f, tipo_descuento: e.target.value}))}
          className="w-full px-3 py-2 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-display font-semibold text-gray-700">
          <option value="precio_paquete">Precio de paquete (fijo)</option>
          <option value="porcentaje">Descuento en porcentaje (%)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">{form.tipo_descuento === 'porcentaje' ? 'Descuento (%)' : 'Precio del Paquete (ARS)'}</label>
          <input type="number" value={form.descuento_o_precio_paquete}
            onChange={e => setForm(f => ({...f, descuento_o_precio_paquete: e.target.value}))}
            placeholder={form.tipo_descuento === 'porcentaje' ? 'Ej: 15' : 'Ej: 12000'}
            className={inp(errors.descuento ? 'border-red-400' : 'border-accent-100')} />
          {errors.descuento && <p className="err">{errors.descuento}</p>}
        </div>
        <div>
          <label className="label-xs">Prioridad (mayor = primero)</label>
          <input type="number" value={form.prioridad} onChange={e => setForm(f => ({...f, prioridad: e.target.value}))}
            placeholder="0" className={inp('border-accent-100')} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="activa" checked={form.activa} onChange={e => setForm(f => ({...f, activa: e.target.checked}))}
          className="w-4 h-4 rounded border-accent-100 text-accent-500 cursor-pointer" />
        <label htmlFor="activa" className="text-xs font-bold text-gray-600 uppercase tracking-wide cursor-pointer">Oferta Activa</label>
      </div>

      <div className="flex gap-2 pt-2">
        {editOffer && (
          <button type="button" onClick={onCancel}
            className="w-1/3 py-2.5 rounded-xl border border-accent-100 text-gray-500 text-xs font-display font-bold hover:bg-gray-50">
            Cancelar
          </button>
        )}
        <button type="submit"
          className="flex-grow py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-display font-bold text-xs tracking-wide shadow-md transition-all hover:translate-y-[-1px] cursor-pointer">
          {editOffer ? 'Guardar Oferta' : 'Crear Oferta'}
        </button>
      </div>
    </form>
  );
}

// ─────────────── MAIN ADMIN COMPONENT ───────────────
export default function Admin() {
  const { isAdmin, authLoading, adminLogin, adminLogout } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'offers' | 'sales'
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);

  const [salesView, setSalesView] = useState('pending'); // 'pending' | 'resolved'
  const pendingOrdersCount = orders.filter(o => o.estado === 'pendiente').length;

  const [stockFilter, setStockFilter] = useState('all'); // all, low, out
  const [stockSort, setStockSort] = useState('none'); // none, asc, desc
  const [editProduct, setEditProduct] = useState(null);
  const [editOffer, setEditOffer] = useState(null);
  const [isShakingProduct, setIsShakingProduct] = useState(false);
  const [isShakingOffer, setIsShakingOffer] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const triggerEditProduct = (p) => {
    setEditProduct(p);
    setIsShakingProduct(true);
    setTimeout(() => setIsShakingProduct(false), 450);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerEditOffer = (o) => {
    setEditOffer(o);
    setIsShakingOffer(true);
    setTimeout(() => setIsShakingOffer(false), 450);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(v);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const refreshProducts = () => api.getProducts().then(setProducts).catch(console.error);
  const refreshOffers = () => api.getAllOffers().then(setOffers).catch(console.error);
  const refreshOrders = () => api.getOrders().then(setOrders).catch(console.error);

  useEffect(() => {
    if (isAdmin) {
      refreshProducts();
      refreshOffers();
      refreshOrders();
    }
  }, [isAdmin]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const data = await api.adminLogin(username, password);
      adminLogin(data.token);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.deleteProduct(id);
      showFeedback('Producto eliminado.', 'info');
      refreshProducts();
      if (editProduct?.id === id) setEditProduct(null);
    } catch (err) { showFeedback(err.message, 'error'); }
  };

  const handleToggleOffer = async (id) => {
    try {
      const result = await api.toggleOffer(id);
      showFeedback(`Oferta ${result.activa ? 'activada' : 'desactivada'}.`);
      refreshOffers();
    } catch (err) { showFeedback(err.message, 'error'); }
  };

  const handleDeleteOffer = async (id) => {
    if (!window.confirm('¿Eliminar esta oferta?')) return;
    try {
      await api.deleteOffer(id);
      showFeedback('Oferta eliminada.', 'info');
      refreshOffers();
      if (editOffer?.id === id) setEditOffer(null);
    } catch (err) { showFeedback(err.message, 'error'); }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await api.updateOrderStatus(id, status);
      showFeedback('Estado actualizado.');
      refreshOrders();
    } catch (err) { showFeedback(err.message, 'error'); }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // ── Loading state ──
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50svh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent-500" />
      </div>
    );
  }

  // ── LOGIN FORM ──
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="bg-white border border-accent-100 rounded-3xl p-8 shadow-premium text-left space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center text-sage-600 border border-sage-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-xl text-gray-800">Panel de Administración</h1>
              <p className="text-xs text-gray-500">Ingresá tus credenciales para administrar la tienda.</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Usuario</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Admin"
                className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body" required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-accent-100 bg-primary-50 focus:outline-none focus:ring-2 focus:ring-accent-400 text-sm font-body" required />
            </div>
            {loginError && <p className="text-red-500 text-xs font-medium">⚠️ {loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="w-full py-3.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-display font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-60">
              {loginLoading ? 'Verificando...' : 'Ingresar al Panel'}
            </button>
          </form>

          <div className="pt-2 border-t border-gray-100 text-center">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Demo: Admin / Admin</span>
          </div>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Feedback toast */}
      {feedback && (
        <div className="fixed top-24 right-6 z-50 shadow-premium max-w-sm rounded-xl overflow-hidden pointer-events-auto">
          <div className={`px-4 py-3 border-l-4 flex items-center gap-3 bg-white text-sm font-semibold ${
            feedback.type === 'success' ? 'border-sage-500 text-sage-800' :
            feedback.type === 'error' ? 'border-red-400 text-red-700' : 'border-accent-400 text-accent-800'
          }`}>
            {feedback.type === 'error' ? <XCircle className="w-5 h-5 text-red-400" /> : <CheckCircle className="w-5 h-5 text-sage-500" />}
            {feedback.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-accent-100 pb-4 gap-4 text-left">
        <div>
          <h1 className="text-3xl font-display font-extrabold text-[#382d24]">Panel Admin</h1>
          <p className="text-gray-500 text-sm">Gestiona productos y ofertas de la tienda.</p>
        </div>
        <button onClick={adminLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 hover:text-red-500 bg-white border border-gray-200 rounded-xl transition-all cursor-pointer hover:border-red-200">
          <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => handleTabChange('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-bold transition-all ${
            activeTab === 'products' ? 'bg-accent-500 text-white shadow-sm' : 'bg-white border border-accent-100 text-gray-600 hover:bg-accent-50'
          }`}>
          <Package className="w-4 h-4" /> Productos
        </button>
        <button onClick={() => handleTabChange('offers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-bold transition-all ${
            activeTab === 'offers' ? 'bg-primary-500 text-white shadow-sm' : 'bg-white border border-accent-100 text-gray-600 hover:bg-primary-50'
          }`}>
          <Tag className="w-4 h-4" /> Ofertas
          {offers.filter(o => o.activa).length > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 text-[10px] font-black flex items-center justify-center">
              {offers.filter(o => o.activa).length}
            </span>
          )}
        </button>
        <button onClick={() => handleTabChange('sales')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-display font-bold transition-all ${
            activeTab === 'sales' ? 'bg-sage-500 text-white shadow-sm' : 'bg-white border border-accent-100 text-gray-600 hover:bg-sage-50'
          }`}>
          <ShoppingCart className="w-4 h-4" /> Ventas
          {pendingOrdersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {pendingOrdersCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── PRODUCTS TAB ─── */}
      {activeTab === 'products' && (() => {
        const filteredProducts = [...products]
          .filter(p => {
            if (stockFilter === 'low') return p.stock > 0 && p.stock < 5;
            if (stockFilter === 'out') return p.stock === 0;
            return true;
          })
          .sort((a, b) => {
            if (stockSort === 'asc') return a.stock - b.stock;
            if (stockSort === 'desc') return b.stock - a.stock;
            return 0;
          });

        return (
          <div className="grid lg:grid-cols-12 gap-8 items-start text-left">
            {/* Form */}
            <div className={`lg:col-span-4 rounded-3xl p-6 transition-all duration-300 space-y-4 ${
              isShakingProduct ? 'animate-shake' : ''
            } ${
              editProduct
                ? 'bg-amber-50/40 border-2 border-amber-400 ring-4 ring-amber-200/50 shadow-xl'
                : 'bg-white border border-accent-100 shadow-premium'
            }`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-lg text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent-500" />
                {editProduct ? 'Editar Producto' : 'Crear Producto'}
              </h2>
              {editProduct && (
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                  ✏️ Modo Edición
                </span>
              )}
            </div>
            <ProductForm
              editProduct={editProduct}
              onSaved={() => { refreshProducts(); setEditProduct(null); }}
              onCancel={() => setEditProduct(null)}
              showFeedback={showFeedback}
            />
          </div>

          {/* Table */}
          <div className="lg:col-span-8 bg-white border border-accent-100 rounded-3xl p-6 shadow-premium overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
              <h2 className="font-display font-extrabold text-lg text-gray-800">Listado ({filteredProducts.length})</h2>
              
              <div className="flex items-center gap-3">
                <select 
                  value={stockFilter} 
                  onChange={e => setStockFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  <option value="all">Todos los stocks</option>
                  <option value="low">Stock bajo (&lt; 5)</option>
                  <option value="out">Sin stock</option>
                </select>
                
                <select 
                  value={stockSort} 
                  onChange={e => setStockSort(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent-400"
                >
                  <option value="none">Orden por defecto</option>
                  <option value="asc">Menor a mayor stock</option>
                  <option value="desc">Mayor a menor stock</option>
                </select>

                <button onClick={() => setEditProduct(null)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-display font-bold text-white bg-sage-500 hover:bg-sage-600 rounded-xl shadow-sm transition-all cursor-pointer">
                  <Plus className="w-4 h-4" /> Nuevo
                </button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-2">Producto</th>
                    <th className="py-3 px-2">Categoría</th>
                    <th className="py-3 px-2">Precio</th>
                    <th className="py-3 px-2">Stock</th>
                    <th className="py-3 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-primary-50/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="max-w-[180px]">
                            <p className="font-display font-bold text-xs text-gray-800 line-clamp-1">{p.name}</p>
                            {p.featured && <span className="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">⭐ Destacado</span>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-500 capitalize">{p.category}</td>
                      <td className="py-3 px-2 font-display font-extrabold text-xs text-accent-700">{formatPrice(p.price)}</td>
                      <td className="py-3 px-2 text-xs">
                        {p.stock > 0
                          ? <span className="text-sage-700 bg-sage-50 px-2 py-0.5 rounded border border-sage-100 font-bold">{p.stock}</span>
                          : <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-bold">Agotado</span>}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => triggerEditProduct(p)}
                            className="p-1.5 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors cursor-pointer"
                            title="Editar">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ─── OFFERS TAB ─── */}
      {activeTab === 'offers' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start text-left">
          {/* Offer Form */}
          <div className={`lg:col-span-4 rounded-3xl p-6 transition-all duration-300 space-y-4 ${
            isShakingOffer ? 'animate-shake' : ''
          } ${
            editOffer
              ? 'bg-primary-50/40 border-2 border-primary-500 ring-4 ring-primary-200/50 shadow-xl'
              : 'bg-white border border-primary-200 shadow-premium'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-lg text-gray-800 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary-500" />
                {editOffer ? 'Editar Oferta' : 'Crear Oferta'}
              </h2>
              {editOffer && (
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-primary-500 text-white px-2.5 py-1 rounded-full animate-pulse shadow-sm">
                  ✏️ Modo Edición
                </span>
              )}
            </div>
            <OfferForm
              editOffer={editOffer}
              products={products}
              onSaved={() => { refreshOffers(); setEditOffer(null); }}
              onCancel={() => setEditOffer(null)}
              showFeedback={showFeedback}
            />
          </div>

          {/* Offers List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-display font-extrabold text-lg text-gray-800">Ofertas ({offers.length})</h2>
              <button onClick={() => setEditOffer(null)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-display font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-xl shadow-sm transition-all cursor-pointer">
                <Plus className="w-4 h-4" /> Nueva Oferta
              </button>
            </div>

            {offers.length === 0 && (
              <div className="bg-white border border-primary-100 rounded-3xl p-10 text-center">
                <div className="text-4xl mb-3">🏷️</div>
                <p className="font-display font-bold text-gray-700 mb-1">Sin ofertas todavía</p>
                <p className="text-gray-400 text-sm">Creá tu primera oferta de paquete en el formulario.</p>
              </div>
            )}

            {offers.map(o => (
              <div key={o.id} className={`bg-white rounded-2xl border-2 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm transition-all ${
                o.activa ? 'border-primary-300' : 'border-gray-100 opacity-60'
              }`}>
                {/* Info */}
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      o.activa ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {o.activa ? '🔥 ACTIVA' : 'inactiva'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">Prioridad: {o.prioridad}</span>
                  </div>
                  <h3 className="font-display font-bold text-sm text-gray-800">{o.nombre}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {o.products.map(p => (
                      <div key={p.id} className="flex items-center gap-1 bg-gray-50 rounded-lg px-2 py-1 border border-gray-100">
                        <img src={p.image} alt={p.name} className="w-5 h-5 rounded object-cover" />
                        <span className="text-[10px] text-gray-600 font-medium line-clamp-1 max-w-[80px]">{p.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-primary-700 font-extrabold mt-2">
                    {o.tipo_descuento === 'porcentaje'
                      ? `${o.descuento_o_precio_paquete}% de descuento`
                      : `Precio paquete: ${new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',minimumFractionDigits:0}).format(o.descuento_o_precio_paquete)}`}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">
                    🛒 Vendidos: <span className="text-gray-600">{o.vendidos || 0}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button onClick={() => handleToggleOffer(o.id)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-display font-bold transition-all cursor-pointer ${
                      o.activa
                        ? 'bg-sage-50 text-sage-700 hover:bg-sage-100 border border-sage-200'
                        : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200'
                    }`}>
                    {o.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => triggerEditOffer(o)}
                    className="p-1.5 text-gray-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors cursor-pointer"
                    title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteOffer(o.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── SALES TAB ─── */}
      {activeTab === 'sales' && (() => {
        const filteredOrders = orders.filter(o =>
          salesView === 'pending' ? o.estado === 'pendiente' : o.estado !== 'pendiente'
        );

        return (
          <div className="space-y-4 text-left">
            {/* Subview toggle */}
            <div className="flex items-center justify-between">
              <h2 className="font-display font-extrabold text-lg text-gray-800">
                Ventas
              </h2>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setSalesView('pending')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-display font-bold transition-all ${
                    salesView === 'pending'
                      ? 'bg-amber-400 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ⏳ No resueltos
                  {pendingOrdersCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSalesView('resolved')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-display font-bold transition-all ${
                    salesView === 'resolved'
                      ? 'bg-sage-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ✅ Resueltos
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 && (
              <div className="bg-white border border-sage-100 rounded-3xl p-10 text-center">
                <div className="text-4xl mb-3">{salesView === 'pending' ? '🎉' : '📦'}</div>
                <p className="font-display font-bold text-gray-700 mb-1">
                  {salesView === 'pending' ? '¡Sin pendientes! Todo atendido.' : 'Sin pedidos resueltos todavía.'}
                </p>
                <p className="text-gray-400 text-sm">
                  {salesView === 'pending' ? 'Todos los pedidos están procesados.' : 'Los pedidos enviados y completados aparecerán acá.'}
                </p>
              </div>
            )}

            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-2xl border border-accent-100 p-5 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Header Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        PEDIDO #{order.id}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.fecha).toLocaleString()}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-display font-bold text-gray-800">{order.cliente_nombre}</p>
                      <p className="text-xs text-gray-500">{order.cliente_email}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="flex-[2] bg-primary-50/50 p-3 rounded-xl border border-primary-100/50">
                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Productos ({order.items?.length || 0})</p>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-2">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span className="text-gray-700 line-clamp-1 flex-1 pr-2">
                            <span className="font-bold text-accent-600 mr-1">{item.cantidad}x</span>
                            {item.producto_nombre}
                          </span>
                          <span className="font-medium text-gray-500 shrink-0">
                            {formatPrice(item.precio_unitario)} c/u
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status & Total */}
                  <div className="flex-1 flex flex-col justify-between items-end gap-3 min-w-[140px]">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400">Total</p>
                      <p className="font-display font-black text-lg text-accent-700">{formatPrice(order.total)}</p>
                    </div>

                    <div className="w-full">
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 text-right">Estado</label>
                      <select
                        value={order.estado}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`w-full text-xs font-bold px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-accent-400 transition-colors cursor-pointer ${
                          order.estado === 'completado' ? 'bg-sage-50 border-sage-200 text-sage-700' :
                          order.estado === 'enviado' ? 'bg-primary-50 border-primary-200 text-primary-700' :
                          'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="enviado">Enviado</option>
                        <option value="completado">Completado</option>
                      </select>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
