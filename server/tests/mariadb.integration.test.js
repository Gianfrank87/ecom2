import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { once } from 'node:events';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('API contra MariaDB local: contratos, transacciones y reservas', { timeout: 120_000 }, async t => {
  const settings = JSON.parse(fs.readFileSync(path.join(root, '.local/mariadb-settings.json'), 'utf8'));
  // Never accept DATABASE_URL / DB_* from the environment for these tests.
  const db = await mysql.createConnection({ host: '127.0.0.1', port: 55433, user: 'root', password: settings.dbPassword, timezone: 'Z', multipleStatements: true });
  const [[identity]] = await db.query('SELECT @@datadir AS location, VERSION() AS version');
  assert.equal(path.resolve(identity.location).toLowerCase(), path.join(root, '.local/mariadb').toLowerCase());
  const database = `nigdiz_test_${process.pid}_${crypto.randomBytes(4).toString('hex')}`;
  let backend, log = '';
  const receipts = new Set();
  try {
    await db.query(`CREATE DATABASE \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await db.changeUser({ database });
    await db.query("SET time_zone = '+00:00'");
    await db.query(fs.readFileSync(path.join(root, 'Base de datos/nigdiz_mysql.sql'), 'utf8'));
    await db.query("INSERT INTO categorias (nombre) VALUES ('collares'), ('correas'), ('alimentos'), ('juguetes'), ('consejos')");
    const probe = net.createServer();
    probe.listen(0, '127.0.0.1');
    await once(probe, 'listening');
    const port = probe.address().port;
    await new Promise(resolve => probe.close(resolve));
    // Exercise the same CommonJS require -> async ESM import used by Passenger.
    backend = spawn(process.execPath, ['--import', './server/tests/mock-mercadopago.js', '-e', "require('./server/passenger.cjs')"], {
      cwd: root, windowsHide: true,
      env: {
        ...process.env, NODE_ENV: 'production', PORT: String(port),
        DB_HOST: '127.0.0.1', DB_PORT: '55433', DB_USER: 'root', DB_PASSWORD: settings.dbPassword, DB_NAME: database,
        JWT_SECRET: settings.jwtSecret, MP_ACCESS_TOKEN: 'TEST-local-only', MP_WEBHOOK_SECRET: 'local-test-webhook-secret',
        SMTP_PASS: '', RECEIPTS_STORAGE: 'local', LOG_LEVEL: 'error',
        NIGDIZ_INTEGRATION_TEST: 'local-mariadb',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    backend.stdout.on('data', data => { log += data; });
    backend.stderr.on('data', data => { log += data; });
    const base = `http://127.0.0.1:${port}/api`;
    const request = async (endpoint, { method = 'GET', token, body, status = 200, headers = {} } = {}) => {
      const response = await fetch(base + endpoint, {
        method, headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...headers,
        },
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
      });
      const text = await response.text();
      assert.equal(response.status, status, `${method} ${endpoint}: ${text}\n${log}`);
      return response.headers.get('content-type')?.includes('application/json') ? JSON.parse(text) : text;
    };
    let ready = false;
    for (let attempt = 0; attempt < 80; attempt++) {
      try { if ((await fetch(base + '/products')).ok) { ready = true; break; } } catch { /* Startup. */ }
      if (backend.exitCode !== null) break;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    assert.ok(ready, `API no inicio: ${log}`);
    let admin, client, outsider;
    await t.test('registro, login, JWT y permisos', async () => {
      const register = name => request('/clients/register', { method: 'POST', status: 201, body: { name, email: `${name}@nigdiz.test`, password: 'Test-only-1234' } });
      admin = await register('admin');
      client = await register('cliente');
      outsider = await register('otro');
      assert.equal(typeof client.user.id, 'string');
      await db.execute("UPDATE clientes SET rol = 'admin' WHERE id = ?", [admin.user.id]);
      admin = await request('/clients/login', { method: 'POST', body: { email: 'admin@nigdiz.test', password: 'Test-only-1234' } });
      assert.equal(admin.user.role, 'admin');
      await request('/clients/verify', { token: client.token });
      await request('/orders', { status: 401 });
      await request('/orders', { token: client.token, status: 403 });
    });
    const productBody = (name = 'Collar prueba', stock = 5) => ({ name, description: 'Prueba MariaDB', price: 100, stock, category: 'collares', image: 'https://example.test/collar.jpg', featured: true });
    const createProduct = async (name, stock) => (await request('/products', { method: 'POST', token: admin.token, status: 201, body: productBody(name, stock) })).id;
    const stock = async id => (await request(`/products/${id}`)).stock;
    const order = (items, method = 'efectivo', status = 201) => request('/orders', { method: 'POST', token: client.token, status, body: {
      items, metodo_pago: method, total: 1,
      shippingInfo: { name: 'Prueba', email: 'cliente@nigdiz.test', phone: '3446000000', address: 'Prueba 123', destinationId: 1 },
    } });
    const webhook = (orderId, status = 'approved', expected = 200) => {
      const id = `${orderId}_${status}`, timestamp = Math.floor(Date.now() / 1000), requestId = crypto.randomUUID();
      const signature = crypto.createHmac('sha256', 'local-test-webhook-secret').update(`id:${id};request-id:${requestId};ts:${timestamp};`).digest('hex');
      return request('/webhooks/mercadopago', { method: 'POST', status: expected, body: { type: 'payment', data: { id } }, headers: { 'x-request-id': requestId, 'x-signature': `ts=${timestamp},v1=${signature}` } });
    };
    let productId, secondId, offerId;
    await t.test('productos, ofertas JSON y configuraciones', async () => {
      productId = await createProduct('Collar prueba', 8);
      secondId = await createProduct('Segundo collar', 8);
      const product = await request(`/products/${productId}`);
      assert.equal(product.featured, true);
      assert.deepEqual(product.images, ['https://example.test/collar.jpg']);
      await request(`/products/${productId}`, { method: 'PUT', token: admin.token, body: productBody('Collar actualizado', 8) });
      await request('/products/reorder', { method: 'PATCH', token: admin.token, body: { ids: [secondId, productId] } });
      offerId = (await request('/offers', { method: 'POST', token: admin.token, status: 201, body: { nombre: 'Pack', producto_ids: [productId, secondId], descuento_o_precio_paquete: 150, activa: true } })).id;
      const offers = await request('/offers/active');
      assert.deepEqual(offers[0].producto_ids, [productId, secondId]);
      assert.equal(offers[0].products.length, 2);
      const store = await request('/config/store');
      await request('/admin/config/store', { method: 'PUT', token: admin.token, body: { ...store, name: 'NigDiz prueba' } });
      assert.equal((await request('/config/store')).name, 'NigDiz prueba');
      await request('/admin/config/banco', { method: 'PUT', token: admin.token, body: { alias: 'nigdiz.prueba', titular: 'Prueba', cbu: '' } });
      const content = await request('/content/home-hero');
      await request('/admin/content/home-hero', { method: 'PUT', token: admin.token, body: { ...content, title: 'Prueba MariaDB' } });
      assert.equal((await request('/content/home-hero')).title, 'Prueba MariaDB');
    });
    await t.test('transferencia, comprobante privado en produccion, estados y auditoria JSON', async () => {
      const created = await order([{ id: productId, quantity: 1, price: 1 }], 'transferencia');
      assert.equal(created.total, 100);
      const id = created.orderId;
      const form = new FormData();
      form.append('comprobante', new Blob(['%PDF-1.4\n% local test\n%%EOF'], { type: 'application/pdf' }), 'prueba.pdf');
      await request(`/orders/${id}/comprobante`, { method: 'POST', token: client.token, body: form, status: 201 });
      const [[row]] = await db.execute('SELECT comprobante_url FROM pedidos WHERE id = ?', [id]);
      receipts.add(row.comprobante_url);
      assert.ok((await request(`/orders/${id}/comprobante`, { token: admin.token })).startsWith('%PDF'));
      await request(`/orders/${id}/comprobante`, { token: outsider.token, status: 403 });
      await request(`/admin/orders/${id}/approval`, { method: 'PATCH', token: admin.token, body: { decision: 'rejected', reason: 'Comprobante de prueba rechazado' } });
      await request(`/admin/orders/${id}/approval`, { method: 'PATCH', token: admin.token, body: { decision: 'approved' } });
      await request(`/orders/${id}/status`, { method: 'PATCH', token: admin.token, body: { estado: 'enviado' } });
      const audit = await request(`/orders/${id}/audit`, { token: admin.token });
      assert.equal(audit.length, 3);
      assert.equal(typeof audit[0].detalles, 'object');
      const history = await request('/clients/orders', { token: client.token });
      assert.ok(history.some(row => String(row.id) === id));
      await request('/orders', { token: admin.token });
      await request(`/orders/${id}/messages`, { method: 'POST', token: client.token, body: { contenido: 'Consulta' }, status: 201 });
      const closed = await request(`/orders/${id}/messages/close`, { method: 'PATCH', token: admin.token, body: {} });
      assert.equal(closed.message.cerrado, true);
      await request(`/orders/${id}/messages/reopen`, { method: 'PATCH', token: client.token, body: {} });
      assert.equal((await request(`/orders/${id}/messages`, { token: client.token }))[0].hilo_id, 2);
      await request('/messages', { token: admin.token });
    });
    await t.test('compra de pack conserva precio y ventas por oferta', async () => {
      const created = await order([{ isOffer: true, offerId, quantity: 1 }]);
      assert.equal(created.total, 150);
      assert.equal(Number((await request('/offers', { token: admin.token }))[0].vendidos), 1);
    });
    await t.test('dos compras concurrentes de la ultima unidad', async () => {
      const id = await createProduct('Ultima unidad', 1);
      const responses = await Promise.all(Array.from({ length: 2 }, () => fetch(base + '/orders', {
        method: 'POST', headers: { Authorization: `Bearer ${client.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [{ id, quantity: 1 }], metodo_pago: 'efectivo', shippingInfo: { name: 'Prueba', email: 'cliente@nigdiz.test', phone: '3446000000', address: 'Prueba 123', destinationId: 1 } }),
      })));
      assert.deepEqual(responses.map(response => response.status).sort(), [201, 409]);
      assert.equal(await stock(id), 0);
    });
    await t.test('rollback del stock si falla otro item', async () => {
      const first = await createProduct('Disponible', 2), second = await createProduct('Sin stock', 0);
      await order([{ id: first, quantity: 1 }, { id: second, quantity: 1 }], 'efectivo', 409);
      assert.equal(await stock(first), 2);
    });
    await t.test('reserva MP, aprobacion repetida y fecha con zona horaria', async () => {
      const id = await createProduct('Reserva', 2);
      const created = await order([{ id, quantity: 1 }], 'mercadopago');
      assert.equal(created.init_point, 'https://example.test/pay');
      assert.equal(await stock(id), 1);
      const [[reserved]] = await db.execute('SELECT stock_reservado_mp, TIMESTAMPDIFF(MINUTE, CURRENT_TIMESTAMP, reserva_stock_expira_at) AS minutes FROM pedidos WHERE id = ?', [created.orderId]);
      assert.equal(reserved.stock_reservado_mp, 1);
      assert.ok(reserved.minutes >= 29 && reserved.minutes <= 30);
      await Promise.all([webhook(created.orderId), webhook(created.orderId)]);
      assert.equal(await stock(id), 1);
      const [[approved]] = await db.execute('SELECT estado, stock_reservado_mp, mp_approved_at FROM pedidos WHERE id = ?', [created.orderId]);
      assert.equal(approved.estado, 'aprobado');
      assert.equal(approved.stock_reservado_mp, 0);
      assert.equal(approved.mp_approved_at.toISOString(), '2026-10-14T23:00:00.000Z');
    });
    await t.test('rechazo/cancelacion concurrente libera la reserva una sola vez', async () => {
      for (const status of ['rejected', 'cancelled']) {
        const id = await createProduct(`Pago ${status}`, 2);
        const created = await order([{ id, quantity: 1 }], 'mercadopago');
        await Promise.all([webhook(created.orderId, status), webhook(created.orderId, status)]);
        assert.equal(await stock(id), 2);
        const [[row]] = await db.execute('SELECT estado FROM pedidos WHERE id = ?', [created.orderId]);
        assert.equal(row.estado, 'pago_rechazado');
      }
    });
    await t.test('vencimiento concurrente y aprobacion tardia con/sin stock', async () => {
      const id = await createProduct('Reserva vencida', 1);
      const expired = await order([{ id, quantity: 1 }], 'mercadopago');
      await db.execute('UPDATE pedidos SET reserva_stock_expira_at = DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MINUTE) WHERE id = ?', [expired.orderId]);
      await Promise.all([order([{ id: productId, quantity: 1 }]), order([{ id: secondId, quantity: 1 }])]);
      assert.equal(await stock(id), 1);
      const [[row]] = await db.execute('SELECT estado FROM pedidos WHERE id = ?', [expired.orderId]);
      assert.equal(row.estado, 'pago_vencido');
      await webhook(expired.orderId);
      assert.equal(await stock(id), 0);
      const unavailable = await createProduct('Sin stock tardio', 1);
      const late = await order([{ id: unavailable, quantity: 1 }], 'mercadopago');
      await db.execute('UPDATE pedidos SET reserva_stock_expira_at = DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 1 MINUTE) WHERE id = ?', [late.orderId]);
      await order([{ id: unavailable, quantity: 1 }]);
      await webhook(late.orderId);
      await webhook(late.orderId);
      assert.equal(await stock(unavailable), 0);
      const [[noStock]] = await db.execute('SELECT estado FROM pedidos WHERE id = ?', [late.orderId]);
      assert.equal(noStock.estado, 'pago_aprobado_sin_stock');
    });
    await t.test('fallo al crear preferencia devuelve stock', async () => {
      const id = await createProduct('FAIL_MP', 1);
      await order([{ id, quantity: 1 }], 'mercadopago', 400);
      assert.equal(await stock(id), 1);
    });
    await t.test('pack agotado se desactiva y vuelve al liberar su reserva', async () => {
      const first = await createProduct('Pack A', 1), second = await createProduct('Pack B', 1);
      const pack = (await request('/offers', { method: 'POST', token: admin.token, status: 201, body: { nombre: 'Pack reserva', producto_ids: [first, second], descuento_o_precio_paquete: 150, activa: true } })).id;
      const created = await order([{ isOffer: true, offerId: pack, quantity: 1 }], 'mercadopago');
      assert.ok(!(await request('/offers/active')).some(offer => offer.id === pack));
      await webhook(created.orderId, 'rejected');
      assert.equal(await stock(first), 1);
      assert.equal(await stock(second), 1);
      assert.ok((await request('/offers/active')).some(offer => offer.id === pack));
    });
    await t.test('ajustes de stock concurrentes y claves foraneas', async () => {
      const id = await createProduct('Ajuste stock', 2);
      await Promise.all(Array.from({ length: 3 }, () => request(`/products/${id}/stock`, { method: 'PATCH', token: admin.token, body: { delta: 1 } })));
      assert.equal(await stock(id), 5);
      await assert.rejects(db.execute('INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, 1, 100)', [99999999, id]), error => error.code === 'ER_NO_REFERENCED_ROW_2');
    });
    await t.test('verificacion de esquema y bootstrap con dry-run y confirmacion de destino', async () => {
      const run = (script, ...args) => spawnSync(process.execPath, [`server/${script}`, ...args], {
        cwd: root, encoding: 'utf8', windowsHide: true,
        env: { ...process.env, DB_HOST: '127.0.0.1', DB_PORT: '55433', DB_USER: 'root', DB_PASSWORD: settings.dbPassword, DB_NAME: database },
      });
      assert.equal(run('check-db.js').status, 0);
      await db.execute("DELETE FROM categorias WHERE nombre = 'consejos'");
      const dryRun = run('bootstrap-mariadb.js');
      assert.equal(dryRun.status, 0);
      assert.match(dryRun.stdout, /Dry-run/);
      const [[absent]] = await db.execute("SELECT COUNT(*) AS total FROM categorias WHERE nombre = 'consejos'");
      assert.equal(absent.total, 0);
      assert.equal(run('bootstrap-mariadb.js', '--apply', '--database=otra_base').status, 1);
      assert.equal(run('bootstrap-mariadb.js', '--apply', `--database=${database}`).status, 0);
      const [[present]] = await db.execute("SELECT COUNT(*) AS total FROM categorias WHERE nombre = 'consejos'");
      assert.equal(present.total, 1);
      await db.execute('RENAME TABLE configuraciones TO configuraciones_prueba');
      const incomplete = run('check-db.js');
      assert.equal(incomplete.status, 1);
      assert.match(incomplete.stderr, /Falta la tabla configuraciones/);
    });
    console.log(`Verificado contra ${identity.version}; Mercado Pago simulado, MariaDB real.`);
  } finally {
    if (backend && backend.exitCode === null) {
      backend.kill();
      await once(backend, 'exit');
    }
    // Only the uniquely named database created above, after verifying @@datadir.
    assert.match(database, /^nigdiz_test_\d+_[a-f0-9]{8}$/);
    await db.query(`DROP DATABASE IF EXISTS \`${database}\``);
    await db.end();
    for (const name of receipts) {
      assert.equal(path.basename(name), name);
      fs.unlinkSync(path.join(root, 'server/uploads/comprobantes', name));
    }
  }
});
