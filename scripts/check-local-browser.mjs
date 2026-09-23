// Requires the local environment to be running. Uses real local API responses.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : 'playwright');
const settings = JSON.parse(fs.readFileSync('.local/settings.json', 'utf8'));
const browser = await chromium.launch({ channel: 'msedge', headless: true });
try {
  for (const role of ['admin', 'cliente']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:5173/login', { waitUntil: 'domcontentloaded' });
    await page.getByPlaceholder('tu@email.com o usuario').fill(`${role}@nigdiz.test`);
    await page.locator('input[type=password]').fill(role === 'admin' ? settings.adminPassword : settings.clientPassword);
    const login = page.waitForResponse(response => response.url() === 'http://localhost:5173/api/clients/login');
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    assert.equal((await login).status(), 200);
    await page.waitForURL('http://localhost:5173/');
    if (role === 'admin') {
      await page.goto('http://localhost:5173/admin', { waitUntil: 'domcontentloaded' });
      await page.getByText('Listado de Productos', { exact: false }).waitFor();
    } else {
      await page.goto('http://localhost:5173/mis-pedidos', { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Mis Pedidos', exact: true }).waitFor();
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Mis Pedidos', exact: true }).waitFor();
      assert.equal(new URL(page.url()).pathname, '/mis-pedidos');
      await page.goto('http://localhost:5173/catalog', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: 'Agregar', exact: true }).first().click();
      await page.getByRole('button', { name: 'Abrir carrito', exact: true }).click();
      await page.getByRole('dialog', { name: 'Carrito de compras' }).waitFor();
    }
    assert.deepEqual(errors, []);
    await context.close();
    console.log(`OK navegador local: ${role}`);
  }
} finally { await browser.close(); }
