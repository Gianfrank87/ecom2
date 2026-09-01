import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { dbAll, dbGet, dbRun } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret';

// Enable CORS and JSON parsing
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ecomlau-mauve.vercel.app',
    'https://ecommercelaura.onrender.com'
  ],
  credentials: true,
}));
app.use(express.json());

// Middleware: require an authenticated user with the admin role
const requireAdmin = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' });
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'No tenés permisos de administrador.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Middleware: require client token
const requireClient = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' });
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};

// Helper: map product row to frontend shape
const mapProduct = (p) => ({
  id: String(p.id),
  name: p.nombre,
  description: p.descripcion,
  price: Number(p.precio),
  stock: p.stock,
  category: p.categoria,
  image: p.imagen_url,
  featured: Boolean(p.destacado),
  activo: Boolean(p.activo),
  orden: p.orden !== undefined && p.orden !== null ? Number(p.orden) : Number(p.id)
});

const mapOffer = async (o) => {
  const ids = JSON.parse(o.producto_ids || '[]');
  let products = [];
  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    const rows = await dbAll(`SELECT * FROM productos WHERE id IN (${placeholders})`, ids);
    products = rows.map(mapProduct);
  }
  
  const salesResult = await dbGet(
    'SELECT SUM(cantidad) as total FROM (SELECT DISTINCT pedido_id, cantidad FROM pedido_items WHERE oferta_id = ?)', 
    [o.id]
  );
  
  return {
    id: String(o.id),
    nombre: o.nombre,
    producto_ids: ids,
    products,
    descuento_o_precio_paquete: Number(o.descuento_o_precio_paquete),
    tipo_descuento: o.tipo_descuento || 'precio_paquete',
    prioridad: o.prioridad,
    activa: Boolean(o.activa),
    desactivada_por_stock: Boolean(o.desactivada_por_stock),
    producto_sin_stock_id: o.producto_sin_stock_id ? String(o.producto_sin_stock_id) : null,
    producto_sin_stock_nombre: o.producto_sin_stock_nombre || null,
    vendidos: salesResult?.total || 0
  };
};

const deactivateOffersForProduct = async (productId, productName) => {
  const offers = await dbAll('SELECT id, producto_ids FROM ofertas WHERE activa = TRUE');
  const affectedOffers = offers.filter((offer) => {
    const productIds = JSON.parse(offer.producto_ids || '[]').map(String);
    return productIds.includes(String(productId));
  });

  for (const offer of affectedOffers) {
    await dbRun(
      `UPDATE ofertas
       SET activa = FALSE, desactivada_por_stock = TRUE,
           producto_sin_stock_id = ?, producto_sin_stock_nombre = ?
       WHERE id = ?`,
      [productId, productName, offer.id]
    );
  }

  return affectedOffers.length;
};

// ─────────────────────────────────────────
// AUTH CLIENTES
// ─────────────────────────────────────────

// POST /api/clients/register
app.post('/api/clients/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    // Check if email exists
    const existing = await dbGet('SELECT id FROM clientes WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const result = await dbRun(
      'INSERT INTO clientes (nombre, email, password_hash) VALUES (?, ?, ?) RETURNING id',
      [name, email, hash]
    );
    const newClientId = result.rows?.[0]?.id ?? result.lastID;

    const token = jwt.sign(
      { id: newClientId, email, name, role: 'cliente' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { id: newClientId, name, email, role: 'cliente' },
      message: 'Registro exitoso' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clients/login
app.post('/api/clients/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email o usuario y contraseña son requeridos' });
    }

    const client = await dbGet(
      'SELECT * FROM clientes WHERE lower(email) = lower(?) OR lower(nombre) = lower(?)',
      [email, email]
    );
    if (!client) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, client.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: client.id, email: client.email, name: client.nombre, role: client.rol || 'cliente' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: client.id, name: client.nombre, email: client.email, role: client.rol || 'cliente' },
      message: 'Login exitoso' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/verify
app.get('/api/clients/verify', requireClient, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ─────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────

// GET /api/products
app.get('/api/products', async (req, res) => {
  try {
    const products = await dbAll('SELECT * FROM productos WHERE activo = TRUE ORDER BY orden ASC, id ASC');
    res.json(products.map(mapProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await dbGet('SELECT * FROM productos WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(mapProduct(product));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products (protected)
app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category, image, featured } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precio, categoría)' });
    }

    const normalizedCategory = String(category).trim().toLowerCase();
    const maxOrdenRow = await dbGet('SELECT COALESCE(MAX(orden), 0) as maxOrden FROM productos');
    const nextOrden = (maxOrdenRow?.maxOrden || 0) + 1;
    const result = await dbRun(
      `INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url, destacado, activo, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?) RETURNING id`,
      [name, description, Number(price), Number(stock) || 0, normalizedCategory, image, Boolean(featured), nextOrden]
    );
    const newProductId = result.rows?.[0]?.id ?? result.lastID;
    res.status(201).json({ id: String(newProductId), message: 'Producto creado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/reorder (protected admin)
app.patch('/api/products/reorder', requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de IDs para reordenar' });
    }
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      await dbRun('UPDATE productos SET orden = ? WHERE id = ?', [index + 1, id]);
    }
    res.json({ message: 'Orden actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id (protected)
app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, category, image, featured } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const check = await dbGet('SELECT id FROM productos WHERE id = ?', [req.params.id]);
    if (!check) return res.status(404).json({ error: 'Producto no encontrado' });
    await dbRun(
      `UPDATE productos SET nombre=?, descripcion=?, precio=?, stock=?, categoria=?, imagen_url=?, destacado=? WHERE id=?`,
      [name, description, Number(price), Number(stock) || 0, category, image, Boolean(featured), req.params.id]
    );
    if (Number(stock) === 0) await deactivateOffersForProduct(check.id, name);
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (protected)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const check = await dbGet('SELECT id, nombre FROM productos WHERE id = ?', [req.params.id]);
    if (!check) return res.status(404).json({ error: 'Producto no encontrado' });
    const deactivatedOffers = await deactivateOffersForProduct(check.id, check.nombre);
    await dbRun('DELETE FROM productos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado exitosamente', deactivatedOffers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/products/:id/stock (protected admin)
app.patch('/api/products/:id/stock', requireAdmin, async (req, res) => {
  try {
    const delta = Number(req.body.delta);
    if (!Number.isInteger(delta) || delta === 0) {
      return res.status(400).json({ error: 'El delta de stock debe ser un entero distinto de cero' });
    }

    const product = await dbGet('SELECT id, nombre, stock FROM productos WHERE id = ?', [req.params.id]);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const newStock = Math.max(0, Number(product.stock) + delta);
    await dbRun('UPDATE productos SET stock = ? WHERE id = ?', [newStock, product.id]);
    const deactivatedOffers = newStock === 0
      ? await deactivateOffersForProduct(product.id, product.nombre)
      : 0;

    res.json({ stock: newStock, deactivatedOffers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categorias ORDER BY nombre ASC');
    res.json(categories.map((c) => ({ id: String(c.id), name: c.nombre })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// OFFERS
// ─────────────────────────────────────────

// GET /api/offers/active — public, for Home & Catalog
app.get('/api/offers/active', async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM ofertas WHERE activa = TRUE ORDER BY prioridad DESC');
    const offers = await Promise.all(rows.map(mapOffer));
    res.json(offers.filter((offer) => (
      offer.products.length === offer.producto_ids.length && offer.products.every((product) => product.stock > 0)
    )));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/offers — all (admin only)
app.get('/api/offers', requireAdmin, async (req, res) => {
  try {
    const rows = await dbAll('SELECT * FROM ofertas ORDER BY prioridad DESC');
    const offers = await Promise.all(rows.map(mapOffer));
    res.json(offers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/offers (protected)
app.post('/api/offers', requireAdmin, async (req, res) => {
  try {
    const { nombre, producto_ids, descuento_o_precio_paquete, tipo_descuento, prioridad, activa } = req.body;
    if (!nombre || !producto_ids || producto_ids.length < 2) {
      return res.status(400).json({ error: 'Se requiere nombre y al menos 2 productos.' });
    }
    const result = await dbRun(
      `INSERT INTO ofertas (nombre, producto_ids, descuento_o_precio_paquete, tipo_descuento, prioridad, activa) VALUES (?,?,?,?,?,?) RETURNING id`,
      [nombre, JSON.stringify(producto_ids), Number(descuento_o_precio_paquete) || 0, tipo_descuento || 'precio_paquete', Number(prioridad) || 0, Boolean(activa)]
    );
    const newOfferId = result.rows?.[0]?.id ?? result.lastID;
    res.status(201).json({ id: String(newOfferId), message: 'Oferta creada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/offers/:id (protected)
app.put('/api/offers/:id', requireAdmin, async (req, res) => {
  try {
    const { nombre, producto_ids, descuento_o_precio_paquete, tipo_descuento, prioridad, activa } = req.body;
    const check = await dbGet('SELECT id FROM ofertas WHERE id = ?', [req.params.id]);
    if (!check) return res.status(404).json({ error: 'Oferta no encontrada' });
    await dbRun(
      `UPDATE ofertas SET nombre=?, producto_ids=?, descuento_o_precio_paquete=?, tipo_descuento=?, prioridad=?, activa=?, desactivada_por_stock=0, producto_sin_stock_id=NULL, producto_sin_stock_nombre=NULL WHERE id=?`,
      [nombre, JSON.stringify(producto_ids), Number(descuento_o_precio_paquete) || 0, tipo_descuento || 'precio_paquete', Number(prioridad) || 0, Boolean(activa), req.params.id]
    );
    res.json({ message: 'Oferta actualizada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/offers/:id/toggle — activate/deactivate (protected)
app.patch('/api/offers/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const offer = await dbGet('SELECT id, activa FROM ofertas WHERE id = ?', [req.params.id]);
    if (!offer) return res.status(404).json({ error: 'Oferta no encontrada' });
    const newState = offer.activa ? false : true;
    await dbRun(
      `UPDATE ofertas
       SET activa = ?, desactivada_por_stock = FALSE,
           producto_sin_stock_id = NULL, producto_sin_stock_nombre = NULL
       WHERE id = ?`,
      [newState, req.params.id]
    );
    res.json({ message: `Oferta ${newState ? 'activada' : 'desactivada'}`, activa: Boolean(newState) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/offers/:id (protected)
app.delete('/api/offers/:id', requireAdmin, async (req, res) => {
  try {
    const check = await dbGet('SELECT id FROM ofertas WHERE id = ?', [req.params.id]);
    if (!check) return res.status(404).json({ error: 'Oferta no encontrada' });
    await dbRun('DELETE FROM ofertas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Oferta eliminada exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────

// GET /api/orders (admin only)
app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await dbAll(`
      SELECT p.*, c.nombre as cliente_nombre, c.email as cliente_email 
      FROM pedidos p
      JOIN clientes c ON p.cliente_id = c.id
      ORDER BY p.fecha DESC
    `);
    
    // For each order, fetch items and product details
    for (const order of orders) {
      const items = await dbAll(`
        SELECT pi.*, pr.nombre as producto_nombre
        FROM pedido_items pi
        JOIN productos pr ON pi.producto_id = pr.id
        WHERE pi.pedido_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/status (admin only)
app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    if (!['pendiente', 'enviado', 'completado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    
    const check = await dbGet('SELECT id FROM pedidos WHERE id = ?', [req.params.id]);
    if (!check) return res.status(404).json({ error: 'Pedido no encontrado' });
    
    await dbRun('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, req.params.id]);
    res.json({ message: 'Estado actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const getOrderWithMessageAccess = async (orderId, user) => {
  const order = await dbGet(
    `SELECT p.id, p.cliente_id, p.total, p.estado, p.fecha, c.nombre AS cliente_nombre, c.email AS cliente_email
     FROM pedidos p JOIN clientes c ON p.cliente_id = c.id WHERE p.id = ?`,
    [orderId]
  );
  if (!order) return { error: 'Pedido no encontrado', status: 404 };
  if (user.role !== 'admin' && String(order.cliente_id) !== String(user.id)) {
    return { error: 'No tenés permiso para acceder a este pedido.', status: 403 };
  }
  return { order };
};

const getLatestMessageThread = async (orderId) => dbGet(
  `SELECT hilo_id, cerrado FROM mensajes
   WHERE pedido_id = ? ORDER BY hilo_id DESC, id DESC LIMIT 1`,
  [orderId]
);

// GET /api/orders/:id/messages (owner or admin)
app.get('/api/orders/:id/messages', requireClient, async (req, res) => {
  try {
    const access = await getOrderWithMessageAccess(req.params.id, req.user);
    if (access.error) return res.status(access.status).json({ error: access.error });
    const latest = await getLatestMessageThread(req.params.id);
    const messages = latest ? await dbAll(
      'SELECT id, pedido_id, remitente, contenido, fecha, leido, hilo_id, tipo, cerrado FROM mensajes WHERE pedido_id = ? AND hilo_id = ? ORDER BY fecha ASC, id ASC',
      [req.params.id, latest.hilo_id]
    ) : [];
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/:id/messages (owner or admin)
app.post('/api/orders/:id/messages', requireClient, async (req, res) => {
  try {
    const access = await getOrderWithMessageAccess(req.params.id, req.user);
    if (access.error) return res.status(access.status).json({ error: access.error });
    const contenido = String(req.body.contenido || '').trim();
    if (!contenido) return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    if (contenido.length > 2000) return res.status(400).json({ error: 'El mensaje no puede superar los 2000 caracteres.' });

    const remitente = req.user.role === 'admin' ? 'admin' : 'cliente';
    const latest = await getLatestMessageThread(req.params.id);
    if (latest?.cerrado && !(req.body.nuevo_hilo === true && remitente === 'cliente')) {
      return res.status(409).json({ error: 'Este reclamo está cerrado. Abrí un reclamo nuevo para continuar.' });
    }
    const hiloId = latest ? (latest.cerrado ? latest.hilo_id + 1 : latest.hilo_id) : 1;
    const result = await dbRun(
      'INSERT INTO mensajes (pedido_id, remitente, contenido, leido, hilo_id, tipo, cerrado) VALUES (?, ?, ?, FALSE, ?, ?, FALSE) RETURNING id',
      [req.params.id, remitente, contenido, hiloId, 'mensaje']
    );
    const messageId = result.rows?.[0]?.id ?? result.lastID;
    const message = await dbGet('SELECT id, pedido_id, remitente, contenido, fecha, leido, hilo_id, tipo, cerrado FROM mensajes WHERE id = ?', [messageId]);
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/messages/close (admin only)
app.patch('/api/orders/:id/messages/close', requireAdmin, async (req, res) => {
  try {
    const access = await getOrderWithMessageAccess(req.params.id, req.user);
    if (access.error) return res.status(access.status).json({ error: access.error });
    const latest = await getLatestMessageThread(req.params.id);
    if (!latest || latest.cerrado) return res.status(400).json({ error: 'El reclamo ya está cerrado o no tiene mensajes.' });
    const result = await dbRun(
      `INSERT INTO mensajes (pedido_id, remitente, contenido, fecha, leido, hilo_id, tipo, cerrado)
       VALUES (?, 'admin', 'El administrador dio por cerrado este reclamo', CURRENT_TIMESTAMP, TRUE, ?, 'sistema', TRUE) RETURNING id`,
      [req.params.id, latest.hilo_id]
    );
    const messageId = result.rows?.[0]?.id ?? result.lastID;
    const message = await dbGet('SELECT id, pedido_id, remitente, contenido, fecha, leido, hilo_id, tipo, cerrado FROM mensajes WHERE id = ?', [messageId]);
    res.json({ cerrado: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/messages/reopen (owner only)
app.patch('/api/orders/:id/messages/reopen', requireClient, async (req, res) => {
  try {
    const access = await getOrderWithMessageAccess(req.params.id, req.user);
    if (access.error) return res.status(access.status).json({ error: access.error });
    if (req.user.role === 'admin') return res.status(403).json({ error: 'Sólo el cliente puede reabrir este reclamo.' });

    const latest = await getLatestMessageThread(req.params.id);
    if (!latest?.cerrado) return res.status(400).json({ error: 'El reclamo ya está abierto.' });

    const nextThreadId = latest.hilo_id + 1;
    const result = await dbRun(
      `INSERT INTO mensajes (pedido_id, remitente, contenido, fecha, leido, hilo_id, tipo, cerrado)
       VALUES (?, 'cliente', ?, CURRENT_TIMESTAMP, TRUE, ?, 'sistema', FALSE) RETURNING id`,
      [req.params.id, `${req.user.name} reabrió el reclamo`, nextThreadId]
    );
    const messageId = result.rows?.[0]?.id ?? result.lastID;
    const message = await dbGet('SELECT id, pedido_id, remitente, contenido, fecha, leido, hilo_id, tipo, cerrado FROM mensajes WHERE id = ?', [messageId]);
    res.json({ reabierto: true, message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/orders/:id/messages/read (owner or admin)
app.patch('/api/orders/:id/messages/read', requireClient, async (req, res) => {
  try {
    const access = await getOrderWithMessageAccess(req.params.id, req.user);
    if (access.error) return res.status(access.status).json({ error: access.error });
    const remitente = req.body.remitente === 'admin' ? 'admin' : 'cliente';
    await dbRun(
      'UPDATE mensajes SET leido = TRUE WHERE pedido_id = ? AND remitente = ? AND leido = FALSE',
      [req.params.id, remitente]
    );
    res.json({ message: 'Mensajes marcados como leídos.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/messages (admin only, grouped by order)
app.get('/api/messages', requireAdmin, async (req, res) => {
  try {
    const rows = await dbAll(
      `SELECT m.id, m.pedido_id, m.remitente, m.contenido, m.fecha, m.leido, m.hilo_id, m.tipo, m.cerrado,
              p.total, p.estado, p.fecha AS pedido_fecha,
              c.nombre AS cliente_nombre, c.email AS cliente_email
       FROM mensajes m
       JOIN pedidos p ON p.id = m.pedido_id
       JOIN clientes c ON c.id = p.cliente_id
       ORDER BY m.fecha ASC, m.id ASC`
    );
    const latestThreadByOrder = new Map();
    for (const row of rows) {
      const knownThread = latestThreadByOrder.get(row.pedido_id);
      if (!knownThread || row.hilo_id > knownThread) latestThreadByOrder.set(row.pedido_id, row.hilo_id);
    }
    const grouped = new Map();
    for (const row of rows.filter(row => row.hilo_id === latestThreadByOrder.get(row.pedido_id))) {
      if (!grouped.has(row.pedido_id)) {
        grouped.set(row.pedido_id, {
          pedido_id: row.pedido_id,
          total: row.total,
          estado: row.estado,
          pedido_fecha: row.pedido_fecha,
          cliente_nombre: row.cliente_nombre,
          cliente_email: row.cliente_email,
          mensajes: [],
          no_leidos: 0,
          cerrado: false
        });
      }
      const thread = grouped.get(row.pedido_id);
      thread.mensajes.push({
        id: row.id,
        pedido_id: row.pedido_id,
        remitente: row.remitente,
        contenido: row.contenido,
        fecha: row.fecha,
        leido: Boolean(row.leido),
        hilo_id: row.hilo_id,
        tipo: row.tipo || 'mensaje',
        cerrado: Boolean(row.cerrado)
      });
      thread.cerrado = Boolean(row.cerrado);
      if (row.remitente === 'cliente' && !row.leido) thread.no_leidos += 1;
    }
    res.json([...grouped.values()].reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clients/orders (protected client)
app.get('/api/clients/orders', requireClient, async (req, res) => {
  try {
    const orders = await dbAll(`
      SELECT p.*,
        (SELECT COUNT(*) FROM mensajes m WHERE m.pedido_id = p.id) AS mensajes_count,
        (SELECT COUNT(*) FROM mensajes m WHERE m.pedido_id = p.id AND m.remitente = 'admin' AND m.tipo = 'mensaje' AND m.leido = FALSE) AS mensajes_no_leidos,
        COALESCE((SELECT m.cerrado FROM mensajes m WHERE m.pedido_id = p.id ORDER BY m.hilo_id DESC, m.id DESC LIMIT 1), FALSE) AS hilo_cerrado
      FROM pedidos p
      WHERE cliente_id = ? 
      ORDER BY fecha DESC
    `, [req.user.id]);
    
    // For each order, fetch items and product details
    for (const order of orders) {
      const items = await dbAll(`
        SELECT pi.*, pr.nombre as producto_nombre, pr.imagen_url as producto_imagen
        FROM pedido_items pi
        JOIN productos pr ON pi.producto_id = pr.id
        WHERE pi.pedido_id = ?
      `, [order.id]);
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders (protected client)
app.post('/api/orders', requireClient, async (req, res) => {
  let transactionStarted = false;
  try {
    const { items, total } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El pedido no tiene items' });
    }

    // PostgreSQL transaction syntax.
    await dbRun('BEGIN');
    transactionStarted = true;

    const requestedByProduct = new Map();
    for (const item of items) {
      const products = item.isOffer ? item.products : [item];
      for (const product of products || []) {
        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity <= 0) {
          throw Object.assign(new Error('La cantidad solicitada no es válida.'), { status: 400 });
        }
        const productId = String(product.id);
        const current = requestedByProduct.get(productId) || { quantity: 0, name: product.name || 'Producto' };
        current.quantity += quantity;
        requestedByProduct.set(productId, current);
      }
    }

    for (const [productId, requested] of requestedByProduct) {
      const product = await dbGet('SELECT id, nombre, stock FROM productos WHERE id = ?', [productId]);
      if (!product) {
        throw Object.assign(new Error(`El producto ${requested.name} ya no está disponible.`), { status: 409 });
      }
      if (requested.quantity > Number(product.stock)) {
        throw Object.assign(
          new Error(`Solo quedan ${product.stock} unidades de ${product.nombre}.`),
          { status: 409, productId: product.id, available: product.stock, productName: product.nombre }
        );
      }
    }

    // 1. Crear el pedido, only after every item passed validation.
    const orderResult = await dbRun(
      'INSERT INTO pedidos (cliente_id, total, estado) VALUES (?, ?, ?) RETURNING id',
      [req.user.id, Number(total), 'pendiente']
    );
    const pedidoId = orderResult.rows?.[0]?.id ?? orderResult.lastID;

    // 2. Insertar items y descontar stock
    for (const item of items) {
      if (item.isOffer) {
        const pricePerItem = item.price / item.products.length;
        for (const p of item.products) {
          await dbRun(
            'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, oferta_id) VALUES (?, ?, ?, ?, ?)',
            [pedidoId, p.id, item.quantity, pricePerItem, item.offerId]
          );
          await dbRun(
            'UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id = ?',
            [item.quantity, p.id]
          );
          const product = await dbGet('SELECT id, nombre, stock FROM productos WHERE id = ?', [p.id]);
          if (product?.stock === 0) await deactivateOffersForProduct(product.id, product.nombre);
        }
      } else {
        await dbRun(
          'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [pedidoId, item.id, item.quantity, item.price]
        );
        await dbRun(
          'UPDATE productos SET stock = GREATEST(0, stock - ?) WHERE id = ?',
          [item.quantity, item.id]
        );
        const product = await dbGet('SELECT id, nombre, stock FROM productos WHERE id = ?', [item.id]);
        if (product?.stock === 0) await deactivateOffersForProduct(product.id, product.nombre);
      }
    }

    await dbRun('COMMIT');
    transactionStarted = false;
    res.status(201).json({ 
      orderId: pedidoId, 
      message: 'Pedido creado exitosamente' 
    });
  } catch (err) {
    if (transactionStarted) {
      try { await dbRun('ROLLBACK'); } catch (_) {}
    }
    res.status(err.status || 500).json({
      error: err.message,
      productId: err.productId,
      available: err.available,
      productName: err.productName
    });
  }
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});
