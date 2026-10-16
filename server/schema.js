import { dbAll, dbGet } from './db.js';

// Read-only checks against MariaDB itself. No SQL file is needed at runtime.
export const validateDatabaseSchema = async () => {
  const identity = await dbGet('SELECT DATABASE() AS name, VERSION() AS version');
  if (!identity.name) throw new Error('No se selecciono una base de datos MariaDB.');
  const expected = ['categorias', 'clientes', 'productos', 'ofertas', 'pedidos', 'pedido_items', 'mensajes', 'configuraciones', 'pedido_auditoria'];
  const tables = await dbAll('SELECT TABLE_NAME AS name, ENGINE AS engine FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()');
  for (const table of expected) {
    const actual = tables.find(row => row.name === table);
    if (!actual) throw new Error(`Falta la tabla ${table} en MariaDB. El servidor no aplica migraciones automaticamente.`);
    if (actual.engine !== 'InnoDB') {
      throw new Error(`La tabla ${table} debe usar InnoDB para transacciones y bloqueos de stock.`);
    }
  }
  return identity;
};
