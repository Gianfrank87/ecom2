import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(DB_PATH);

// Helper to run query with promise
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// Helper to get all results
export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

// Helper to get single result
export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Initialize database schema
export const initDB = () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        console.log('Inicializando Base de Datos...');

        // 1. categorias Table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(100) NOT NULL UNIQUE
          )
        `);

        // 2. productos Table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10, 2) NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            categoria VARCHAR(100) NOT NULL,
            imagen_url TEXT,
            activo BOOLEAN DEFAULT 1,
            destacado BOOLEAN DEFAULT 0,
            orden INTEGER DEFAULT 0,
            FOREIGN KEY (categoria) REFERENCES categorias(nombre)
          )
        `);

        // 3. clientes Table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            rol VARCHAR(20) NOT NULL DEFAULT 'cliente',
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Migration: add role to existing client databases
        try {
          await dbRun(`ALTER TABLE clientes ADD COLUMN rol VARCHAR(20) NOT NULL DEFAULT 'cliente'`);
        } catch (_) {}

        // 4. pedidos Table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total DECIMAL(10, 2) NOT NULL,
            estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
            FOREIGN KEY (cliente_id) REFERENCES clientes(id)
          )
        `);

        // 5. pedido_items Table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS pedido_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            producto_id INTEGER NOT NULL,
            oferta_id INTEGER,
            cantidad INTEGER NOT NULL,
            precio_unitario DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
            FOREIGN KEY (producto_id) REFERENCES productos(id)
          )
        `);

        // 6. mensajes Table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS mensajes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER NOT NULL,
            remitente VARCHAR(20) NOT NULL CHECK (remitente IN ('cliente', 'admin')),
            contenido TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            leido BOOLEAN DEFAULT 0,
            hilo_id INTEGER NOT NULL DEFAULT 1,
            tipo VARCHAR(20) NOT NULL DEFAULT 'mensaje',
            cerrado BOOLEAN NOT NULL DEFAULT 0,
            FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
          )
        `);

        try {
          await dbRun(`ALTER TABLE mensajes ADD COLUMN hilo_id INTEGER NOT NULL DEFAULT 1`);
        } catch (_) {}
        try {
          await dbRun(`ALTER TABLE mensajes ADD COLUMN tipo VARCHAR(20) NOT NULL DEFAULT 'mensaje'`);
        } catch (_) {}
        try {
          await dbRun(`ALTER TABLE mensajes ADD COLUMN cerrado BOOLEAN NOT NULL DEFAULT 0`);
        } catch (_) {}

        // 7. ofertas Table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS ofertas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(255) NOT NULL,
            producto_ids TEXT,
            descuento_o_precio_paquete DECIMAL(10, 2) NOT NULL,
            tipo_descuento VARCHAR(50) DEFAULT 'precio_paquete',
            prioridad INTEGER DEFAULT 0,
            activa BOOLEAN DEFAULT 1,
            desactivada_por_stock BOOLEAN DEFAULT 0,
            producto_sin_stock_id INTEGER,
            producto_sin_stock_nombre VARCHAR(255)
          )
        `);

        // Migration: add tipo_descuento if it doesn't exist (for existing DBs)
        try {
          await dbRun(`ALTER TABLE ofertas ADD COLUMN tipo_descuento VARCHAR(50) DEFAULT 'precio_paquete'`);
        } catch (_) {}

        try {
          await dbRun(`ALTER TABLE ofertas ADD COLUMN desactivada_por_stock BOOLEAN DEFAULT 0`);
        } catch (_) {}
        try {
          await dbRun(`ALTER TABLE ofertas ADD COLUMN producto_sin_stock_id INTEGER`);
        } catch (_) {}
        try {
          await dbRun(`ALTER TABLE ofertas ADD COLUMN producto_sin_stock_nombre VARCHAR(255)`);
        } catch (_) {}

        // Migration: add oferta_id to pedido_items
        try {
          await dbRun(`ALTER TABLE pedido_items ADD COLUMN oferta_id INTEGER`);
        } catch (_) {}

        // Migration: add orden to productos
        try {
          await dbRun(`ALTER TABLE productos ADD COLUMN orden INTEGER DEFAULT 0`);
        } catch (_) {}
        try {
          await dbRun(`UPDATE productos SET orden = id WHERE orden = 0 OR orden IS NULL`);
        } catch (_) {}

        console.log('Tablas validadas.');

        // Seed data if empty
        await seedData();

        const adminEmail = 'admin@huellitas.local';
        const adminHash = await bcrypt.hash('Admin', 10);
        const admin = await dbGet(
          'SELECT id FROM clientes WHERE lower(nombre) = lower(?) OR lower(email) = lower(?)',
          ['Admin', adminEmail]
        );
        if (admin) {
          await dbRun('UPDATE clientes SET rol = ?, password_hash = ? WHERE id = ?', ['admin', adminHash, admin.id]);
        } else {
          await dbRun(
            'INSERT INTO clientes (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
            ['Admin', adminEmail, adminHash, 'admin']
          );
        }

        resolve();
      } catch (err) {
        console.error('Error al inicializar la base de datos', err);
        reject(err);
      }
    });
  });
};

const seedData = async () => {
  // Check if categories are empty
  const catCount = await dbGet('SELECT COUNT(*) as count FROM categorias');
  if (catCount.count === 0) {
    console.log('Sembrando categorías...');
    const categories = ['alimentos', 'accesorios', 'higiene', 'juguetes', 'salud'];
    for (const cat of categories) {
      await dbRun('INSERT INTO categorias (nombre) VALUES (?)', [cat]);
    }
  }

  // Check if products are empty
  const prodCount = await dbGet('SELECT COUNT(*) as count FROM productos');
  if (prodCount.count === 0) {
    console.log('Sembrando productos iniciales...');
    
    // Read the mock JSON file from parent directory
    const mockJsonPath = path.join(__dirname, '..', 'src', 'data', 'products.json');
    if (fs.existsSync(mockJsonPath)) {
      const fileData = fs.readFileSync(mockJsonPath, 'utf-8');
      const productsList = JSON.parse(fileData);
      
      for (const prod of productsList) {
        await dbRun(
          `INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url, destacado, activo) 
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [
            prod.name,
            prod.description,
            prod.price,
            prod.stock,
            prod.category,
            prod.image,
            prod.featured ? 1 : 0
          ]
        );
      }
      console.log(`${productsList.length} productos sembrados correctamente.`);
    } else {
      console.log('Archivo products.json no encontrado en la ruta esperada.');
    }
  }
};

export default db;
