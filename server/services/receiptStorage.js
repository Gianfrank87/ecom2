const STORAGE_REFERENCE_PREFIX = 'supabase:';

const getConfig = () => ({
  url: String(process.env.SUPABASE_URL || '').replace(/\/$/, ''),
  key: String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''),
  bucket: String(process.env.SUPABASE_RECEIPTS_BUCKET || 'comprobantes').trim(),
});

const encodeObjectPath = (value) => String(value)
  .split('/')
  .map((segment) => encodeURIComponent(segment))
  .join('/');

const storageRequest = async (objectPath, options = {}, authenticated = false) => {
  const { url, key, bucket } = getConfig();
  if (!url || !key || !bucket) {
    throw new Error('Supabase Storage no está configurado en el servidor.');
  }

  const route = authenticated ? 'object/authenticated' : 'object';
  const response = await fetch(
    `${url}/storage/v1/${route}/${encodeURIComponent(bucket)}/${encodeObjectPath(objectPath)}`,
    {
      ...options,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        ...options.headers,
      },
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Supabase Storage respondió ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`);
  }

  return response;
};

export const isReceiptStorageConfigured = () => {
  const { url, key, bucket } = getConfig();
  return Boolean(url && key && bucket);
};

export const isSupabaseReceiptReference = (value) => String(value || '').startsWith(STORAGE_REFERENCE_PREFIX);

export const receiptReferenceToPath = (value) => {
  if (!isSupabaseReceiptReference(value)) return '';
  return String(value).slice(STORAGE_REFERENCE_PREFIX.length);
};

export const uploadReceipt = async ({ objectPath, buffer, contentType }) => {
  await storageRequest(objectPath, {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'x-upsert': 'false',
    },
    body: buffer,
  });
  return `${STORAGE_REFERENCE_PREFIX}${objectPath}`;
};

export const downloadReceipt = async (reference) => {
  const objectPath = receiptReferenceToPath(reference);
  if (!objectPath) throw new Error('Referencia de comprobante inválida.');
  const response = await storageRequest(objectPath, { method: 'GET' }, true);
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get('content-type') || 'application/octet-stream',
  };
};

export const deleteReceipt = async (reference) => {
  const objectPath = receiptReferenceToPath(reference);
  if (!objectPath) return;
  await storageRequest(objectPath, { method: 'DELETE' });
};
