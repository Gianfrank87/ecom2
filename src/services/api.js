const API_URL = 'http://localhost:5000/api';

// Get stored admin token
const getAdminToken = () => localStorage.getItem('huellitas_admin_token');

// Helper: build auth headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAdminToken()}`
});

export const api = {
  // ─── Products (public reads, protected writes) ───
  getProducts: async () => {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) throw new Error('Error al obtener los productos');
    return res.json();
  },

  getProduct: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`);
    if (!res.ok) throw new Error('Producto no encontrado');
    return res.json();
  },

  createProduct: async (productData) => {
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Error al crear el producto');
    return res.json();
  },

  updateProduct: async (id, productData) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(productData)
    });
    if (!res.ok) throw new Error('Error al actualizar el producto');
    return res.json();
  },

  deleteProduct: async (id) => {
    const res = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar el producto');
    return res.json();
  },

  getCategories: async () => {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error('Error al obtener categorías');
    return res.json();
  },

  // ─── Admin Auth ───
  adminLogin: async (username, password) => {
    const res = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Credenciales incorrectas');
    }
    return res.json(); // { token, message }
  },

  verifyAdmin: async (token) => {
    const res = await fetch(`${API_URL}/admin/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Token inválido');
    return res.json();
  },

  // ─── Offers ───
  getActiveOffers: async () => {
    const res = await fetch(`${API_URL}/offers/active`);
    if (!res.ok) throw new Error('Error al obtener ofertas activas');
    return res.json();
  },

  getAllOffers: async () => {
    const res = await fetch(`${API_URL}/offers`, { headers: authHeaders() });
    if (!res.ok) throw new Error('Error al obtener ofertas');
    return res.json();
  },

  createOffer: async (offerData) => {
    const res = await fetch(`${API_URL}/offers`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(offerData)
    });
    if (!res.ok) throw new Error('Error al crear la oferta');
    return res.json();
  },

  updateOffer: async (id, offerData) => {
    const res = await fetch(`${API_URL}/offers/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(offerData)
    });
    if (!res.ok) throw new Error('Error al actualizar la oferta');
    return res.json();
  },

  toggleOffer: async (id) => {
    const res = await fetch(`${API_URL}/offers/${id}/toggle`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Error al cambiar estado de la oferta');
    return res.json();
  },

  deleteOffer: async (id) => {
    const res = await fetch(`${API_URL}/offers/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar la oferta');
    return res.json();
  },

  // ─── Client Auth ───
  clientRegister: async (name, email, password) => {
    const res = await fetch(`${API_URL}/clients/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al registrar');
    }
    return res.json();
  },

  clientLogin: async (email, password) => {
    const res = await fetch(`${API_URL}/clients/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Credenciales incorrectas');
    }
    return res.json();
  },

  verifyClient: async (token) => {
    const res = await fetch(`${API_URL}/clients/verify`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Token inválido');
    return res.json();
  },

  // ─── Orders ───
  getOrders: async () => {
    const res = await fetch(`${API_URL}/orders`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener pedidos');
    return res.json();
  },

  updateOrderStatus: async (id, estado) => {
    const res = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ estado })
    });
    if (!res.ok) throw new Error('Error al actualizar estado');
    return res.json();
  },

  createOrder: async (orderData, token) => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al crear pedido');
    }
    return res.json();
  },

  getClientOrders: async (token) => {
    const res = await fetch(`${API_URL}/clients/orders`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Error al obtener pedidos');
    return res.json();
  }
};
