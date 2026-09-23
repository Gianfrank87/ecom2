// Integration check: runs only against the isolated local database and removes its own data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const settings = JSON.parse(fs.readFileSync(path.join(root, '.local/settings.json'), 'utf8'));
const { Client } = createRequire(path.join(root, 'server/package.json'))('pg');
const db = new Client({ host: '127.0.0.1', port: 55432, database: 'nigdiz_local', user: 'nigdiz_local', password: settings.pgPassword });
await db.connect();
const location = (await db.query('SHOW data_directory')).rows[0].data_directory;
assert.equal(path.resolve(location).toLowerCase(), path.join(root, '.local/postgres').toLowerCase());
const base = 'http://localhost:5173/api';
async function api(endpoint, { method = 'GET', token, body, status = 200 } = {}) {
  const response = await fetch(base + endpoint, { method, headers: {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
  }, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  const result = await response.json();
  assert.equal(response.status, status, `${method} ${endpoint}: ${JSON.stringify(result)}`);
  return result;
}
let productId, userId, orderId, receipt;
try {
  const admin = await api('/clients/login', { method: 'POST', body: { email: 'admin@nigdiz.test', password: settings.adminPassword } });
  assert.equal(admin.user.role, 'admin');
  const client = await api('/clients/login', { method: 'POST', body: { email: 'cliente@nigdiz.test', password: settings.clientPassword } });
  assert.equal(client.user.role, 'cliente');
  await api('/clients/verify', { token: client.token });
  const registered = await api('/clients/register', { method: 'POST', status: 201, body: {
    name: 'Verificación local', email: `verificacion-${Date.now()}@nigdiz.test`, password: 'SoloPruebas-1234',
  } });
  userId = registered.user.id;
  const product = { name: 'Verificación local temporal', description: 'Se elimina al finalizar el chequeo.', price: 1234, stock: 5, category: 'collares', image: '', featured: false };
  await api('/products', { method: 'POST', token: registered.token, body: product, status: 403 });
  const created = await api('/products', { method: 'POST', token: admin.token, body: product, status: 201 });
  productId = created.id;
  await api(`/products/${productId}`, { method: 'PUT', token: admin.token, body: { ...product, stock: 6 } });
  assert.equal((await api(`/products/${productId}`)).stock, 6);
  const order = await api('/orders', { method: 'POST', token: registered.token, status: 201, body: {
    items: [{ id: productId, quantity: 2 }], metodo_pago: 'transferencia', shippingInfo: { address: 'Domicilio de prueba 123' },
  } });
  orderId = order.orderId;
  assert.equal((await api(`/products/${productId}`)).stock, 4);
  const orders = await api('/clients/orders', { token: registered.token });
  assert.equal(Number(orders.find(o => String(o.id) === String(orderId)).total), 2468);
  const form = new FormData();
  form.append('comprobante', new Blob(['%PDF-1.4\n% Comprobante local de prueba\n%%EOF'], { type: 'application/pdf' }), 'prueba.pdf');
  await api(`/orders/${orderId}/comprobante`, { method: 'POST', token: registered.token, body: form, status: 201 });
  receipt = (await db.query('SELECT comprobante_url FROM pedidos WHERE id=$1', [orderId])).rows[0].comprobante_url;
  await api(`/admin/orders/${orderId}/approval`, { method: 'PATCH', token: admin.token, body: { decision: 'approved' } });
  await api(`/orders/${orderId}/messages`, { method: 'POST', token: registered.token, body: { contenido: 'Consulta local de prueba' }, status: 201 });
  assert.equal((await api(`/orders/${orderId}/messages`, { token: admin.token })).length, 1);
  await api(`/orders/${orderId}/status`, { method: 'PATCH', token: admin.token, body: { estado: 'enviado' } });
  console.log('OK: proxy frontend, login admin/cliente, registro, permisos, producto, stock, pedido, comprobante, aprobación y mensajes.');
} finally {
  // Remove only the IDs created by this execution, after verifying the local cluster above.
  if (orderId) {
    receipt ||= (await db.query('SELECT comprobante_url FROM pedidos WHERE id=$1', [orderId])).rows[0]?.comprobante_url;
    await db.query('DELETE FROM mensajes WHERE pedido_id=$1', [orderId]);
    await db.query('DELETE FROM pedido_items WHERE pedido_id=$1', [orderId]);
    await db.query('DELETE FROM pedidos WHERE id=$1', [orderId]);
  }
  if (productId) await db.query('DELETE FROM productos WHERE id=$1', [productId]);
  if (userId) await db.query('DELETE FROM clientes WHERE id=$1', [userId]);
  if (receipt && path.basename(receipt) === receipt) fs.rmSync(path.join(root, 'server/uploads/comprobantes', receipt), { force: true });
  await db.end();
}
