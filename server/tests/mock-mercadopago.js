// Test-process preload only: no real payment requests or test routes in the API.
if (process.env.NIGDIZ_INTEGRATION_TEST !== 'local-mariadb') throw Error('Mock exclusivo de las pruebas locales.');

globalThis.fetch = async (input, options = {}) => {
  const url = new URL(String(input));
  if (url.hostname !== 'api.mercadopago.com') throw Error('Red externa bloqueada en las pruebas.');
  if (url.pathname.replace(/\/$/, '') === '/checkout/preferences') {
    const body = JSON.parse(options.body);
    if (body.items.some(item => item.title === 'FAIL_MP')) {
      return Response.json({ message: 'Simulated preference failure', error: 'bad_request', status: 400 }, { status: 400 });
    }
    return Response.json({ id: `test-${body.external_reference}`, init_point: 'https://example.test/pay' });
  }
  const id = url.pathname.split('/').at(-1);
  const [orderId, status] = id.split('_');
  return Response.json({
    id, external_reference: orderId, status,
    status_detail: 'test', order: { id: 'test-order' },
    date_approved: status === 'approved' ? '2026-10-14T20:00:00-03:00' : null,
  });
};
