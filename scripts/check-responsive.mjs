// Run with: node scripts/check-responsive.mjs [path/to/playwright/index.mjs]
// API requests are intercepted: this check never modifies real orders or stock.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : 'playwright');
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const artifacts = fs.mkdtempSync(path.join(os.tmpdir(), 'nigdiz-responsive-'));
const products = JSON.parse(fs.readFileSync('client/src/data/products.json', 'utf8')).map(p => ({ ...p, featured: true }));
const order = { id: 1, fecha: '2026-09-20T12:00:00Z', total: 125000, estado: 'esperando_aprobacion', metodo_pago: 'transferencia', cliente_nombre: 'Cliente de prueba', cliente_email: 'cliente@example.com', items: [{ id: 1, producto_nombre: products[0].name, cantidad: 2, precio_unitario: 45000 }], mensajes_count: 1 };
const errors = [];
async function visitOrders(page) {
  // Navigate within the app after session restoration, as an authenticated buyer does.
  await page.goto('http://127.0.0.1:5173/catalog', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Menú de usuario: Cliente de prueba' }).waitFor();
  await page.evaluate(() => { history.pushState({}, '', '/mis-pedidos'); dispatchEvent(new PopStateEvent('popstate')); });
}
async function check(page, label) {
  await page.waitForTimeout(350);
  const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  if (overflow.scroll > overflow.width + 1) {
    console.log('OVERFLOW', label, await page.locator('main *').evaluateAll(nodes => nodes.filter(n => { const r = n.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(n).position !== 'fixed'; }).slice(0, 12).map(n => ({ tag: n.tagName, cls: n.className, text: n.textContent.slice(0, 60) }))));
    errors.push(label);
  }
}
try {
  for (const width of (process.argv[3]?.split(',').map(Number) || [320, 375, 390, 430, 768, 1024, 1440])) {
    const context = await browser.newContext({ viewport: { width, height: 844 } });
    await context.addInitScript(({ products }) => {
      localStorage.setItem('huellitas_client_token', 'responsive-fixture');
      localStorage.setItem('huellitas_cart', JSON.stringify([{ ...products[0], quantity: 2 }]));
    }, { products });
    await context.route('**/api/**', route => {
      const url = new URL(route.request().url());
      const endpoint = url.pathname.split('/api/')[1];
      let data = [];
      if (endpoint === 'products') data = products;
      else if (endpoint === 'offers' || endpoint === 'offers/active') data = [{ id: 1, nombre: 'Pack de prueba para mascotas', products: products.slice(0, 2), producto_ids: products.slice(0, 2).map(p => p.id), tipo_descuento: 'porcentaje', descuento_o_precio_paquete: 10, activa: true, prioridad: 1 }];
      else if (endpoint.startsWith('products/')) data = products[0];
      else if (endpoint === 'clients/verify') data = { valid: true, user: { id: 1, name: 'Cliente de prueba', email: 'cliente@example.com', role: 'admin' } };
      else if (endpoint === 'orders' || endpoint === 'clients/orders') data = [order];
      else if (endpoint === 'config/banco') data = { alias: 'NIGDIZ.TRANSFERENCIAS.PRUEBA', cbu: '1234567890123456789012', titular: 'NigDiz' };
      else if (endpoint === 'categories') data = [{ id: 1, nombre: 'collares' }];
      return route.fulfill({ json: data });
    });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(`${width}: ${e.message}`));
    if (process.argv.includes('--guide-only')) {
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
      const guide = page.locator('#como-comprar-section');
      const track = page.locator('#purchase-steps');
      await guide.scrollIntoViewIfNeeded();
      if (width < 768) {
        assert(await guide.getByRole('button', { name: 'Paso anterior' }).isDisabled());
        for (let step = 2; step <= 9; step++) {
          await guide.getByRole('button', { name: 'Paso siguiente' }).click();
          await page.waitForFunction(step => document.querySelector('#como-comprar-section [aria-live]').textContent === `Paso ${step} de 9`, step);
          await page.waitForTimeout(350);
        }
        assert(await guide.getByRole('button', { name: 'Paso siguiente' }).isDisabled());
        await track.evaluate(node => node.scrollTo({ left: 0, behavior: 'instant' }));
        await page.waitForFunction(() => document.querySelector('#como-comprar-section [aria-live]').textContent === 'Paso 1 de 9');
        await track.focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('#como-comprar-section [aria-live]').textContent === 'Paso 2 de 9');
      } else {
        assert.equal(await track.evaluate(node => getComputedStyle(node).display), 'grid');
        assert.equal(await track.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length), width >= 1024 ? 3 : 2);
        assert.equal(await guide.getByRole('button', { name: 'Paso siguiente' }).count(), 0);
      }
      await check(page, `${width} purchase guide`);
      await guide.screenshot({ path: path.join(artifacts, `guide-${width}.png`) });
      await context.close();
      console.log(`Checked guide ${width}px`);
      continue;
    }
    for (const url of ['/', '/catalog', '/product/1', '/cart', '/login', '/registro', '/mis-pedidos', '/admin', '/admin?tab=offers', '/admin?tab=sales', '/admin?tab=messages']) {
      if (url === '/mis-pedidos') await visitOrders(page);
      else await page.goto('http://127.0.0.1:5173' + url, { waitUntil: 'domcontentloaded' });
      await check(page, `${width} ${url}`);
      if (width === 320 || width === 1440) await page.screenshot({ path: path.join(artifacts, `page-${width}-${url.replace(/[^a-z0-9]/gi, '_')}.png`) });
    }
    await page.goto('http://127.0.0.1:5173/catalog');
    await page.getByRole('button', { name: 'Agregar', exact: true }).first().click();
    await page.getByRole('button', { name: 'Abrir carrito', exact: true }).click();
    await page.waitForTimeout(400);
    const drawer = page.getByRole('dialog', { name: 'Carrito de compras' });
    assert(await drawer.isVisible());
    const bounds = await drawer.boundingBox();
    assert(bounds.x >= -1 && bounds.x + bounds.width <= width + 1);
    await drawer.getByRole('button', { name: 'Aumentar cantidad' }).first().click();
    await page.screenshot({ path: path.join(artifacts, `cart-${width}.png`) });
    await page.getByRole('button', { name: 'Cerrar carrito' }).click();
    await page.getByRole('button', { name: 'Buscar', exact: true }).click();
    await page.getByRole('textbox', { name: 'Buscador de productos', exact: true }).fill('alimento');
    await check(page, `${width} search`);
    if (width < 768) {
      await page.getByRole('button', { name: 'Abrir menú', exact: true }).click();
      await check(page, `${width} menu`);
      assert(await page.locator('#mobile-navigation').isVisible());
    }
    await page.getByRole('button', { name: 'Menú de usuario: Cliente de prueba' }).click();
    await check(page, `${width} profile menu`);
    await page.goto('http://127.0.0.1:5173/cart', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Proceder al Pago', exact: true }).click();
    await check(page, `${width} checkout form`);
    await visitOrders(page);
    await page.getByRole('button', { name: /chat/i }).first().click();
    await check(page, `${width} order chat`);
    if (width === 320) {
      await page.setViewportSize({ width: 667, height: 375 });
      await check(page, 'landscape chat');
      const send = await page.getByRole('button', { name: 'Enviar mensaje' }).boundingBox();
      assert(send.y >= 0 && send.y + send.height <= 375);
      await page.setViewportSize({ width, height: 844 });
    }
    await page.goto('http://127.0.0.1:5173/');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(artifacts, `home-${width}.png`), fullPage: true });
    await context.close();
    console.log(`Checked ${width}px`);
  }
} finally { await browser.close(); }
console.log('Screenshots:', artifacts);
assert.deepEqual(errors, [], 'Responsive checks failed');
