import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDB, dbAll, dbGet, dbRun } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Simple in-memory admin token (hardcoded for dev)
const ADMIN_TOKEN = 'huellitas-admin-secret-token-2024';
const ADMIN_USER = 'Admin';
const ADMIN_PASS = 'Admin';
const JWT_SECRET = 'huellitas-client-secret-jwt-key-2024'; // For clients

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Middleware: require admin token
const requireAdmin = (req, res, next) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token requerido.' });
  }
  const token = auth.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Token inválido.' });
  }
  next();
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
  activo: Boolean(p.activo)
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
    vendidos: salesResult?.total || 0
  };
};

// ─────────────────────────────────────────
// AUTH ADMIN
// ─────────────────────────────────────────

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ token: ADMIN_TOKEN, message: 'Autenticación exitosa' });
  }
  return res.status(401).json({ error: 'Credenciales incorrectas' });
});

// GET /api/admin/verify — check if token is still valid
app.get('/api/admin/verify', requireAdmin, (req, res) => {
  res.json({ valid: true });
});

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
      'INSERT INTO clientes (nombre, email, password_hash) VALUES (?, ?, ?)',
      [name, email, hash]
    );

    const token = jwt.sign(
      { id: result.lastID, email, name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { id: result.lastID, name, email },
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
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const client = await dbGet('SELECT * FROM clientes WHERE email = ?', [email]);
    if (!client) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, client.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: client.id, email: client.email, name: client.nombre },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { id: client.id, name: client.nombre, email: client.email },
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
    const products = await dbAll('SELECT * FROM productos WHERE activo = 1');
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
    const result = await dbRun(
      `INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url, destacado, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [name, description, Number(price), Number(stock) || 0, category, image, featured ? 1 : 0]
    );
    res.status(201).json({ id: String(result.lastID), message: 'Producto creado exitosamente' });
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
      [name, description, Number(price), Number(stock) || 0, category, image, featured ? 1 : 0, req.params.id]
    );
    res.json({ message: 'Producto actualizado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id (protected)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const check = await dbGet('SELECT id FROM productos WHERE id = ?', [req.params.id]);
    if (!check) return res.status(404).json({ error: 'Producto no encontrado' });
    await dbRun('DELETE FROM productos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categorias');
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
    const rows = await dbAll('SELECT * FROM ofertas WHERE activa = 1 ORDER BY prioridad DESC');
    const offers = await Promise.all(rows.map(mapOffer));
    res.json(offers);
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
      `INSERT INTO ofertas (nombre, producto_ids, descuento_o_precio_paquete, tipo_descuento, prioridad, activa) VALUES (?,?,?,?,?,?)`,
      [nombre, JSON.stringify(producto_ids), Number(descuento_o_precio_paquete) || 0, tipo_descuento || 'precio_paquete', Number(prioridad) || 0, activa ? 1 : 0]
    );
    res.status(201).json({ id: String(result.lastID), message: 'Oferta creada exitosamente' });
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
      `UPDATE ofertas SET nombre=?, producto_ids=?, descuento_o_precio_paquete=?, tipo_descuento=?, prioridad=?, activa=? WHERE id=?`,
      [nombre, JSON.stringify(producto_ids), Number(descuento_o_precio_paquete) || 0, tipo_descuento || 'precio_paquete', Number(prioridad) || 0, activa ? 1 : 0, req.params.id]
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
    const newState = offer.activa ? 0 : 1;
    await dbRun('UPDATE ofertas SET activa = ? WHERE id = ?', [newState, req.params.id]);
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

// GET /api/clients/orders (protected client)
app.get('/api/clients/orders', requireClient, async (req, res) => {
  try {
    const orders = await dbAll(`
      SELECT * FROM pedidos 
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
  try {
    const { items, total } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'El pedido no tiene items' });
    }

    // 1. Crear el pedido
    const orderResult = await dbRun(
      'INSERT INTO pedidos (cliente_id, total, estado) VALUES (?, ?, ?)',
      [req.user.id, Number(total), 'pendiente']
    );
    const pedidoId = orderResult.lastID;

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
            'UPDATE productos SET stock = MAX(0, stock - ?) WHERE id = ?',
            [item.quantity, p.id]
          );
        }
      } else {
        await dbRun(
          'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [pedidoId, item.id, item.quantity, item.price]
        );
        await dbRun(
          'UPDATE productos SET stock = MAX(0, stock - ?) WHERE id = ?',
          [item.quantity, item.id]
        );
      }
    }

    res.status(201).json({ 
      orderId: pedidoId, 
      message: 'Pedido creado exitosamente' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Error iniciando base de datos y servidor', err);
});
