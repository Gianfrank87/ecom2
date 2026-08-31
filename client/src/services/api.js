const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// All protected requests use the single authenticated session token.
const getSessionToken = () => localStorage.getItem('huellitas_client_token');

// Helper: build auth headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getSessionToken()}`
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

  updateProductStock: async (id, delta) => {
    const res = await fetch(`${API_URL}/products/${id}/stock`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ delta })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al actualizar el stock');
    }
    return res.json();
  },

  reorderProducts: async (ids) => {
    const res = await fetch(`${API_URL}/products/reorder`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error('Error al reordenar los productos');
    return res.json();
  },

  getCategories: async () => {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) throw new Error('Error al obtener categorías');
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
      const error = new Error(data.error || 'Error al crear pedido');
      error.productId = data.productId;
      error.available = data.available;
      error.productName = data.productName;
      throw error;
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
  },

  getOrderMessages: async (orderId) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/messages`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener los mensajes');
    return res.json();
  },

  sendOrderMessage: async (orderId, contenido, nuevoHilo = false) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/messages`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ contenido, nuevo_hilo: nuevoHilo })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al enviar el mensaje');
    }
    return res.json();
  },

  markOrderMessagesRead: async (orderId, remitente) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/messages/read`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ remitente })
    });
    if (!res.ok) throw new Error('Error al marcar mensajes como leídos');
    return res.json();
  },

  closeOrderMessages: async (orderId) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/messages/close`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al cerrar el reclamo');
    }
    return res.json();
  },

  reopenOrderMessages: async (orderId) => {
    const res = await fetch(`${API_URL}/orders/${orderId}/messages/reopen`, {
      method: 'PATCH',
      headers: authHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error al reabrir el reclamo');
    }
    return res.json();
  },

  getAdminMessages: async () => {
    const res = await fetch(`${API_URL}/messages`, {
      headers: authHeaders()
    });
    if (!res.ok) throw new Error('Error al obtener los mensajes');
    return res.json();
  }
};
