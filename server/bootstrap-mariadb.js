import { closeDatabase, dbAll, dbGet, withTransaction } from './db.js';
import { validateDatabaseSchema } from './schema.js';

// Explicit destination confirmation is required even though this is additive.
try {
  const identity = await validateDatabaseSchema();
  const categories = ['collares', 'correas', 'alimentos', 'juguetes', 'consejos'];
  const existing = new Set((await dbAll('SELECT nombre FROM categorias')).map(row => row.nombre));
  const missing = categories.filter(name => !existing.has(name));
  console.log(`Destino: ${identity.name} (${identity.version}). Categorias faltantes: ${missing.join(', ') || 'ninguna'}.`);
  if (!process.argv.includes('--apply')) {
    console.log(`Dry-run: no se modificaron datos. Para confirmar: node bootstrap-mariadb.js --apply --database=${identity.name}`);
  } else {
    const confirmed = process.argv.find(arg => arg.startsWith('--database='))?.slice('--database='.length);
    if (confirmed !== identity.name) throw new Error('Falta confirmar el nombre exacto de la base mediante --database=...');
    await withTransaction(async transaction => {
      for (const category of categories) {
        await transaction.run('INSERT INTO categorias (nombre) VALUES (?) ON DUPLICATE KEY UPDATE nombre = VALUES(nombre)', [category]);
      }
    });
    const count = await dbGet('SELECT COUNT(*) AS total FROM categorias');
    console.log(`Categorias preparadas (${count.total} en total). No se eliminaron registros ni se modifico la estructura.`);
  }
} catch (error) {
  console.error(error.code || error.message);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
