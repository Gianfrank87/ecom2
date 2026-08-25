import sqlite3 from 'sqlite3';
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
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

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

        // 6. ofertas Table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS ofertas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre VARCHAR(255) NOT NULL,
            producto_ids TEXT,
            descuento_o_precio_paquete DECIMAL(10, 2) NOT NULL,
            tipo_descuento VARCHAR(50) DEFAULT 'precio_paquete',
            prioridad INTEGER DEFAULT 0,
            activa BOOLEAN DEFAULT 1
          )
        `);

        // Migration: add tipo_descuento if it doesn't exist (for existing DBs)
        try {
          await dbRun(`ALTER TABLE ofertas ADD COLUMN tipo_descuento VARCHAR(50) DEFAULT 'precio_paquete'`);
        } catch (_) {}

        // Migration: add oferta_id to pedido_items
        try {
          await dbRun(`ALTER TABLE pedido_items ADD COLUMN oferta_id INTEGER`);
        } catch (_) {}

        // Migration: add orden to productos
        try {
          await dbRun(`ALTER TABLE productos ADD COLUMN orden INTEGER DEFAULT 0`);
          // Initialize orden from current id order
          await dbRun(`UPDATE productos SET orden = id WHERE orden = 0 OR orden IS NULL`);
        } catch (_) {}

        console.log('Tablas validadas.');

        // Seed data if empty
        await seedData();

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
