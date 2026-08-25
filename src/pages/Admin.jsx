import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Edit2, LogOut, FileText, CheckCircle, XCircle, Package, Tag, ShoppingCart, Calendar, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
    if (formData.price === '' || Number(formData.price) <= 0) e.price = 'Precio inválido.';
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

  const inp = (extra) => `w-full px-3 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900 transition-all ${extra}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-xs">Nombre</label>
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Nombre del producto"
          className={inp(errors.name ? 'border-red-400' : 'border-gray-200')} />
        {errors.name && <p className="err">{errors.name}</p>}
      </div>
      <div>
        <label className="label-xs">Categoría</label>
        <select name="category" value={formData.category} onChange={handleChange}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900">
          {['alimentos','accesorios','higiene','juguetes','salud'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Precio (ARS)</label>
          <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="0"
            className={inp(errors.price ? 'border-red-400' : 'border-gray-200')} />
          {errors.price && <p className="err">{errors.price}</p>}
        </div>
        <div>
          <label className="label-xs">Stock</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} placeholder="0"
            className={inp(errors.stock ? 'border-red-400' : 'border-gray-200')} />
          {errors.stock && <p className="err">{errors.stock}</p>}
        </div>
      </div>
      <div>
        <label className="label-xs">Descripción</label>
        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Detalle..."
          className={inp(errors.description ? 'border-red-400' : 'border-gray-200')} />
        {errors.description && <p className="err">{errors.description}</p>}
      </div>
      <div>
        <label className="label-xs">URL de Imagen</label>
        <input name="image" value={formData.image} onChange={handleChange} placeholder="https://..."
          className={inp(errors.image ? 'border-red-400' : 'border-gray-200')} />
        {errors.image && <p className="err">{errors.image}</p>}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-[#e52521] cursor-pointer" />
        <label htmlFor="featured" className="text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer">Destacar en Home ⭐</label>
      </div>
      <div className="flex gap-2 pt-2">
        {editProduct && (
          <button type="button" onClick={onCancel}
            className="w-1/3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer">
            Cancelar
          </button>
        )}
        <button type="submit"
          className="flex-grow py-2.5 rounded-xl bg-[#e52521] hover:bg-[#c91d19] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer">
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
  }, [editOffer]);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre de la oferta es obligatorio.';
    if (form.producto_ids.length < 2) e.producto_ids = 'Seleccioná al menos 2 productos para el paquete.';
    if (form.descuento_o_precio_paquete === '' || Number(form.descuento_o_precio_paquete) <= 0) e.descuento = 'Valor de oferta inválido.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const payload = {
      ...form,
      descuento_o_precio_paquete: Number(form.descuento_o_precio_paquete),
      prioridad: Number(form.prioridad)
    };
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

  const toggleProduct = (id) => {
    setForm(f => {
      const ids = f.producto_ids.includes(id)
        ? f.producto_ids.filter(pId => pId !== id)
        : [...f.producto_ids, id];
      return { ...f, producto_ids: ids };
    });
    if (errors.producto_ids) setErrors(e => ({ ...e, producto_ids: '' }));
  };

  const inp = (extra = '') => `w-full px-3 py-2 rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900 transition-all ${extra}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label-xs">Nombre del Paquete u Oferta</label>
        <input name="nombre" value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))}
          placeholder="Ej: Kit Baño Completo" className={inp(errors.nombre ? 'border-red-400' : 'border-gray-200')} />
        {errors.nombre && <p className="err">{errors.nombre}</p>}
      </div>

      <div>
        <label className="label-xs">Seleccionar Productos del Pack (mínimo 2)</label>
        <div className="max-h-48 overflow-y-auto space-y-1.5 border border-gray-200 rounded-xl p-2 bg-gray-50">
          {products.map(p => {
            const selected = form.producto_ids.includes(p.id);
            const disabled = p.stock <= 0;
            return (
              <label key={p.id} onClick={() => !disabled && toggleProduct(p.id)}
                className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer border transition-all ${
                  selected ? 'border-[#e52521] bg-red-50/70 font-bold' : disabled ? 'border-gray-100 opacity-40 cursor-not-allowed' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="flex items-center gap-2 min-w-0">
                  <input type="checkbox" checked={selected} disabled={disabled} onChange={() => {}}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-[#e52521] cursor-pointer" />
                  <span className="truncate text-gray-800">{p.name}</span>
                </div>
                <span className="text-[10px] font-bold text-gray-900 shrink-0">
                  ${p.price} {disabled && '(Sin stock)'}
                </span>
              </label>
            );
          })}
        </div>
        {errors.producto_ids && <p className="err">{errors.producto_ids}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-xs">Tipo de Oferta</label>
          <select value={form.tipo_descuento} onChange={e => setForm(f => ({...f, tipo_descuento: e.target.value}))}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900">
            <option value="precio_paquete">Precio Fijo del Pack ($)</option>
            <option value="porcentaje">Porcentaje Descuento (%)</option>
          </select>
        </div>
        <div>
          <label className="label-xs">{form.tipo_descuento === 'porcentaje' ? '% Descuento' : 'Precio Total Pack ($)'}</label>
          <input type="number" value={form.descuento_o_precio_paquete}
            onChange={e => setForm(f => ({...f, descuento_o_precio_paquete: e.target.value}))}
            placeholder="Ej: 15000 o 20" className={inp(errors.descuento ? 'border-red-400' : 'border-gray-200')} />
          {errors.descuento && <p className="err">{errors.descuento}</p>}
        </div>
      </div>

      <div>
        <label className="label-xs">Prioridad de muestra (0 a 10)</label>
        <input type="number" value={form.prioridad} onChange={e => setForm(f => ({...f, prioridad: e.target.value}))}
          placeholder="0" className={inp('border-gray-200')} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="activa" checked={form.activa} onChange={e => setForm(f => ({...f, activa: e.target.checked}))}
          className="w-4 h-4 rounded border-gray-300 text-[#e52521] cursor-pointer" />
        <label htmlFor="activa" className="text-xs font-bold text-gray-700 uppercase tracking-wide cursor-pointer">Oferta Activa</label>
      </div>

      <div className="flex gap-2 pt-2">
        {editOffer && (
          <button type="button" onClick={onCancel}
            className="w-1/3 py-2.5 rounded-xl border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors cursor-pointer">
            Cancelar
          </button>
        )}
        <button type="submit"
          className="flex-grow py-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer">
          {editOffer ? 'Guardar Oferta' : 'Crear Oferta'}
        </button>
      </div>
    </form>
  );
}

// ─────────────── SORTABLE ITEM COMPONENT ───────────────
function SortableProductRow({ p, onEdit, onDelete, formatPrice, isDragDisabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: p.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 'auto',
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`hover:bg-gray-50 transition-colors ${isDragging ? 'bg-amber-50 shadow-md' : ''}`}
    >
      <td className="py-3 px-2">
        <div className="flex items-center gap-2">
          {!isDragDisabled && (
            <button
              {...attributes}
              {...listeners}
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded hover:bg-gray-100 touch-none shrink-0"
              title="Arrastrar para reordenar"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 shrink-0 p-0.5">
            <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="font-extrabold text-xs text-gray-900 line-clamp-1">{p.name}</p>
            {p.featured && (
              <span className="text-[9px] font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">⭐ Destacado</span>
            )}
          </div>
        </div>
      </td>
      <td className="py-3 px-2 text-xs text-gray-500 capitalize font-medium">{p.category}</td>
      <td className="py-3 px-2 font-extrabold text-xs text-gray-900">{formatPrice(p.price)}</td>
      <td className="py-3 px-2 text-xs">
        {p.stock > 0 ? (
          <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-black">{p.stock}</span>
        ) : (
          <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded font-black">Agotado</span>
        )}
      </td>
      <td className="py-3 px-2 text-right">
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => onEdit(p)}
            className="p-1.5 text-gray-500 hover:text-[#e52521] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(p.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Admin() {
  const { isAdmin, adminLogin, adminLogout, authLoading } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('products');
  const [salesView, setSalesView] = useState('pending');

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [stockFilter, setStockFilter] = useState('all');
  const [stockSort, setStockSort] = useState('none');

  const [editProduct, setEditProduct] = useState(null);
  const [editOffer, setEditOffer] = useState(null);

  const [isShakingOffer, setIsShakingOffer] = useState(false);

  const [feedback, setFeedback] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(products, oldIndex, newIndex);
    setProducts(reordered);

    try {
      const ids = reordered.map((p) => p.id);
      await api.reorderProducts(ids);
      showFeedback('Orden de productos guardado.');
    } catch (err) {
      showFeedback(err.message, 'error');
      refreshProducts();
    }
  };

  const triggerEditProduct = (p) => {
    setEditProduct(p);
  };

  const triggerEditOffer = (o) => {
    setEditOffer(o);
    setIsShakingOffer(true);
    setTimeout(() => setIsShakingOffer(false), 450);
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

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#e52521]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xs text-left space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-[#e52521] border border-red-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl text-gray-900">Panel de Control Admin</h1>
              <p className="text-xs text-gray-400 font-semibold">Acceso exclusivo para administradores</p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Usuario</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Admin"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900" required />
            </div>
            <div>
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e52521] text-xs font-semibold text-gray-900" required />
            </div>
            {loginError && <p className="text-red-600 text-xs font-bold">⚠️ {loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-[#e52521] hover:bg-[#c91d19] text-white font-black text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-60">
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

  const pendingOrdersCount = orders.filter(o => o.estado === 'pendiente').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {feedback && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 text-xs font-extrabold animate-bounce ${
          feedback.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
          feedback.type === 'error' ? 'bg-red-50 border-red-300 text-red-800' : 'bg-blue-50 border-blue-300 text-blue-800'
        }`}>
          {feedback.type === 'error' ? <XCircle className="w-5 h-5 text-red-600" /> : <CheckCircle className="w-5 h-5 text-emerald-600" />}
          {feedback.message}
        </div>
      )}

      {editProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto relative text-left">
            <button
              type="button"
              onClick={() => setEditProduct(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between mb-4 pr-8">
              <h2 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#e52521]" />
                Editar Producto #{editProduct.id}
              </h2>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full shadow-xs">
                ✏️ Modo Edición
              </span>
            </div>

            <ProductForm
              editProduct={editProduct}
              onSaved={() => {
                refreshProducts();
                setEditProduct(null);
              }}
              onCancel={() => setEditProduct(null)}
              showFeedback={showFeedback}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-gray-200 pb-4 gap-4 text-left">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Panel Admin</h1>
          <p className="text-gray-500 text-xs font-semibold mt-0.5">Gestioná productos, ofertas y ventas de la tienda.</p>
        </div>
        <button onClick={adminLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-700 hover:text-red-600 bg-white border border-gray-300 rounded-xl transition-all cursor-pointer hover:border-red-300">
          <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión
        </button>
      </div>

      <div className="flex gap-2 mb-8">
        <button onClick={() => handleTabChange('products')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
            activeTab === 'products' ? 'bg-[#e52521] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold'
          }`}>
          <Package className="w-4 h-4" /> Productos
        </button>
        <button onClick={() => handleTabChange('offers')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
            activeTab === 'offers' ? 'bg-[#0f172a] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold'
          }`}>
          <Tag className="w-4 h-4" /> Ofertas
          {offers.filter(o => o.activa).length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {offers.filter(o => o.activa).length}
            </span>
          )}
        </button>
        <button onClick={() => handleTabChange('sales')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-extrabold transition-all cursor-pointer ${
            activeTab === 'sales' ? 'bg-[#059669] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold'
          }`}>
          <ShoppingCart className="w-4 h-4" /> Ventas
          {pendingOrdersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#e52521] text-white text-[10px] font-black flex items-center justify-center animate-pulse">
              {pendingOrdersCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'products' && (() => {
        const isDragDisabled = stockFilter !== 'all' || stockSort !== 'none';
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
            <div className="lg:col-span-4 rounded-xl p-6 bg-white border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#e52521]" />
                  Crear Nuevo Producto
                </h2>
              </div>
              <ProductForm
                editProduct={null}
                onSaved={() => refreshProducts()}
                onCancel={() => {}}
                showFeedback={showFeedback}
              />
            </div>

            <div className="lg:col-span-8 bg-white border border-gray-200 rounded-xl p-6 shadow-xs overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="font-extrabold text-base text-gray-900">Listado de Productos ({filteredProducts.length})</h2>
                  {!isDragDisabled && (
                    <p className="text-[11px] text-gray-400 font-semibold">Arrastrá las filas desde el icono <GripVertical className="w-3 h-3 inline align-middle" /> para reordenar el catálogo público.</p>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <select 
                    value={stockFilter} 
                    onChange={e => setStockFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e52521]"
                  >
                    <option value="all">Todos los stocks</option>
                    <option value="low">Stock bajo (&lt; 5)</option>
                    <option value="out">Sin stock</option>
                  </select>
                  
                  <select 
                    value={stockSort} 
                    onChange={e => setStockSort(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e52521]"
                  >
                    <option value="none">Orden por defecto</option>
                    <option value="asc">Menor a mayor stock</option>
                    <option value="desc">Mayor a menor stock</option>
                  </select>
                </div>
              </div>

              {isDragDisabled && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 mb-4 text-[11px] text-amber-900 font-bold">
                  💡 El reordenamiento manual por arrastrar y soltar se activa al seleccionar "Todos los stocks" y "Orden por defecto".
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="overflow-x-auto max-h-[600px]">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-[11px] font-black text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-2">Producto</th>
                        <th className="py-3 px-2">Categoría</th>
                        <th className="py-3 px-2">Precio</th>
                        <th className="py-3 px-2">Stock</th>
                        <th className="py-3 px-2 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <SortableContext
                      items={filteredProducts.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map(p => (
                          <SortableProductRow
                            key={p.id}
                            p={p}
                            onEdit={triggerEditProduct}
                            onDelete={handleDeleteProduct}
                            formatPrice={formatPrice}
                            isDragDisabled={isDragDisabled}
                          />
                        ))}
                      </tbody>
                    </SortableContext>
                  </table>
                </div>
              </DndContext>
            </div>
          </div>
        );
      })()}

      {activeTab === 'offers' && (
        <div className="grid lg:grid-cols-12 gap-8 items-start text-left">
          <div className={`lg:col-span-4 rounded-xl p-6 bg-white border transition-all duration-300 space-y-4 ${
            isShakingOffer ? 'animate-shake' : ''
          } ${
            editOffer
              ? 'border-2 border-amber-400 bg-amber-50/20 shadow-lg'
              : 'border-gray-200 shadow-xs'
          }`}>
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0f172a]" />
                {editOffer ? 'Editar Oferta' : 'Crear Nueva Oferta'}
              </h2>
              {editOffer && (
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full shadow-xs">
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

          <div className="lg:col-span-8 space-y-4">
            {offers.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-xs">
                <div className="text-4xl mb-3">🏷️</div>
                <p className="font-extrabold text-gray-900 mb-1">Sin ofertas registradas</p>
                <p className="text-gray-500 text-xs">Creá tu primera oferta de paquete usando el formulario.</p>
              </div>
            )}

            {offers.map(o => (
              <div key={o.id} className={`bg-white rounded-xl border p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-xs transition-all ${
                o.activa ? 'border-gray-200' : 'border-gray-100 opacity-60'
              }`}>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                      o.activa ? 'bg-red-100 text-[#e52521]' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {o.activa ? '🔥 ACTIVA' : 'Inactiva'}
                    </span>
                    <span className="text-[10px] text-gray-500 font-extrabold">Prioridad: {o.prioridad}</span>
                  </div>
                  <h3 className="font-extrabold text-sm text-gray-900">{o.nombre}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {o.products.map(p => (
                      <div key={p.id} className="flex items-center gap-1 bg-gray-50 rounded-md px-2 py-1 border border-gray-200">
                        <img src={p.image} alt={p.name} className="w-5 h-5 rounded object-contain" />
                        <span className="text-[10px] text-gray-700 font-bold line-clamp-1 max-w-[80px]">{p.name}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-900 font-black mt-2">
                    {o.tipo_descuento === 'porcentaje'
                      ? `${o.descuento_o_precio_paquete}% de descuento`
                      : `Precio paquete: ${formatPrice(o.descuento_o_precio_paquete)}`}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">
                    🛒 Vendidos: <span className="text-gray-800 font-black">{o.vendidos || 0}</span>
                  </p>
                </div>

                <div className="flex sm:flex-col gap-2 shrink-0">
                  <button onClick={() => handleToggleOffer(o.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all cursor-pointer ${
                      o.activa
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}>
                    {o.activa ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => triggerEditOffer(o)}
                    className="p-1.5 text-gray-500 hover:text-[#e52521] hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Editar">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteOffer(o.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'sales' && (() => {
        const filteredOrders = orders.filter(o =>
          salesView === 'pending' ? o.estado === 'pendiente' : o.estado !== 'pendiente'
        );

        return (
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold text-base text-gray-900">
                Historial de Ventas
              </h2>
              <div className="flex gap-1 bg-gray-200 p-1 rounded-xl">
                <button
                  onClick={() => setSalesView('pending')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    salesView === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  ⏳ No resueltos
                  {pendingOrdersCount > 0 && (
                    <span className="bg-[#e52521] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setSalesView('resolved')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    salesView === 'resolved'
                      ? 'bg-[#059669] text-white shadow-sm'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  ✅ Resueltos
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-xs">
                <div className="text-4xl mb-3">{salesView === 'pending' ? '🎉' : '📦'}</div>
                <p className="font-extrabold text-gray-900 mb-1">
                  {salesView === 'pending' ? '¡Sin pedidos pendientes! Todo al día.' : 'Sin pedidos resueltos todavía.'}
                </p>
                <p className="text-gray-500 text-xs font-semibold">
                  {salesView === 'pending' ? 'Todos los pedidos ingresados han sido procesados.' : 'Los pedidos enviados y completados se muestran acá.'}
                </p>
              </div>
            )}

            <div className="grid gap-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col md:flex-row gap-6 shadow-xs hover:shadow-sm transition-shadow">
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase bg-gray-100 text-gray-900 px-2 py-1 rounded">
                        PEDIDO #{order.id}
                      </span>
                      <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(order.fecha).toLocaleString()}
                      </span>
                    </div>
                    
                    <div>
                      <p className="text-sm font-extrabold text-gray-900">{order.cliente_nombre}</p>
                      <p className="text-xs text-gray-500 font-medium">{order.cliente_email}</p>
                    </div>
                  </div>

                  <div className="flex-[2] bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-[10px] uppercase font-black tracking-wider text-gray-400 mb-2">Productos ({order.items?.length || 0})</p>
                    <div className="space-y-1.5 max-h-28 overflow-y-auto pr-2">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-900 line-clamp-1 flex-1 pr-2">
                            <span className="font-extrabold text-[#e52521] mr-1">{item.cantidad}x</span>
                            {item.producto_nombre}
                          </span>
                          <span className="font-bold text-gray-600 shrink-0">
                            {formatPrice(item.precio_unitario)} c/u
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between items-end gap-3 min-w-[140px]">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-black text-gray-400">Total</p>
                      <p className="font-black text-xl text-gray-900">{formatPrice(order.total)}</p>
                    </div>

                    <div className="w-full">
                      <label className="block text-[10px] uppercase font-black text-gray-400 mb-1 text-right">Estado</label>
                      <select
                        value={order.estado}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`w-full text-xs font-extrabold px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#e52521] transition-colors cursor-pointer ${
                          order.estado === 'completado' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' :
                          order.estado === 'enviado' ? 'bg-blue-100 border-blue-300 text-blue-900' :
                          'bg-amber-100 border-amber-300 text-amber-950'
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
