/**
 * Shipping Service / Simulator (Simulación de Envíos)
 * Origen de todos los envíos: Gualeguaychú, Entre Ríos.
 * Diseñado con una interfaz limpia y desacoplada para facilitar
 * el reemplazo posterior por la API real de Andreani.
 */

export const LOCALITIES = [
  // Entre Ríos - Origen y cercanas
  { id: 1, localidad: 'Gualeguaychú', provincia: 'Entre Ríos', cp: '2820', zona: 'local', precio: 0 },
  { id: 2, localidad: 'Pueblo General Belgrano', provincia: 'Entre Ríos', cp: '2821', zona: 'er_cercano', precio: 4500 },

  { id: 3, localidad: 'Larroque', provincia: 'Entre Ríos', cp: '2854', zona: 'er_cercano', precio: 5500 },
  { id: 4, localidad: 'Aldea San Antonio', provincia: 'Entre Ríos', cp: '2855', zona: 'er_cercano', precio: 5500 },
  { id: 5, localidad: 'Concepción del Uruguay', provincia: 'Entre Ríos', cp: '3260', zona: 'er_cercano', precio: 6500 },
  { id: 6, localidad: 'Urdinarrain', provincia: 'Entre Ríos', cp: '2826', zona: 'er_cercano', precio: 5800 },
  { id: 7, localidad: 'Gualeguay', provincia: 'Entre Ríos', cp: '2840', zona: 'er_regional', precio: 7200 },
  { id: 8, localidad: 'Concordia', provincia: 'Entre Ríos', cp: '3200', zona: 'er_regional', precio: 7500 },
  { id: 9, localidad: 'Paraná', provincia: 'Entre Ríos', cp: '3100', zona: 'er_regional', precio: 7500 },
  { id: 10, localidad: 'Colón', provincia: 'Entre Ríos', cp: '3280', zona: 'er_regional', precio: 7200 },
  { id: 11, localidad: 'Victoria', provincia: 'Entre Ríos', cp: '3153', zona: 'er_regional', precio: 7500 },
  { id: 12, localidad: 'Chajarí', provincia: 'Entre Ríos', cp: '3220', zona: 'er_regional', precio: 7800 },
  { id: 13, localidad: 'Villaguay', provincia: 'Entre Ríos', cp: '3240', zona: 'er_regional', precio: 7500 },
  { id: 14, localidad: 'La Paz', provincia: 'Entre Ríos', cp: '3190', zona: 'er_regional', precio: 7800 },
  { id: 15, localidad: 'Diamante', provincia: 'Entre Ríos', cp: '3105', zona: 'er_regional', precio: 7500 },
  { id: 16, localidad: 'Crespo', provincia: 'Entre Ríos', cp: '3164', zona: 'er_regional', precio: 7500 },
  { id: 17, localidad: 'Basavilbaso', provincia: 'Entre Ríos', cp: '3270', zona: 'er_regional', precio: 6800 },
  { id: 18, localidad: 'Federación', provincia: 'Entre Ríos', cp: '3206', zona: 'er_regional', precio: 7500 },
  { id: 19, localidad: 'San José', provincia: 'Entre Ríos', cp: '3283', zona: 'er_regional', precio: 7000 },
  { id: 20, localidad: 'Nogoyá', provincia: 'Entre Ríos', cp: '3150', zona: 'er_regional', precio: 7200 },

  // Buenos Aires & CABA
  { id: 21, localidad: 'Ciudad Autónoma de Buenos Aires (CABA)', provincia: 'Buenos Aires', cp: '1000', zona: 'gba_caba', precio: 8000 },
  { id: 22, localidad: 'San Isidro', provincia: 'Buenos Aires', cp: '1642', zona: 'gba_caba', precio: 8200 },
  { id: 23, localidad: 'Avellaneda', provincia: 'Buenos Aires', cp: '1870', zona: 'gba_caba', precio: 8000 },
  { id: 24, localidad: 'La Plata', provincia: 'Buenos Aires', cp: '1900', zona: 'gba_caba', precio: 8500 },
  { id: 25, localidad: 'Mar del Plata', provincia: 'Buenos Aires', cp: '7600', zona: 'pba_interior', precio: 9500 },
  { id: 26, localidad: 'Bahía Blanca', provincia: 'Buenos Aires', cp: '8000', zona: 'pba_interior', precio: 10500 },
  { id: 27, localidad: 'Campana', provincia: 'Buenos Aires', cp: '2804', zona: 'gba_caba', precio: 7800 },
  { id: 28, localidad: 'Zárate', provincia: 'Buenos Aires', cp: '2800', zona: 'gba_caba', precio: 7800 },

  // Santa Fe
  { id: 29, localidad: 'Rosario', provincia: 'Santa Fe', cp: '2000', zona: 'santa_fe', precio: 8000 },
  { id: 30, localidad: 'Santa Fe', provincia: 'Santa Fe', cp: '3000', zona: 'santa_fe', precio: 8200 },
  { id: 31, localidad: 'Venado Tuerto', provincia: 'Santa Fe', cp: '2600', zona: 'santa_fe', precio: 8800 },
  { id: 32, localidad: 'Rafaela', provincia: 'Santa Fe', cp: '2300', zona: 'santa_fe', precio: 8800 },

  // Córdoba
  { id: 33, localidad: 'Córdoba', provincia: 'Córdoba', cp: '5000', zona: 'centro', precio: 9800 },
  { id: 34, localidad: 'Villa Carlos Paz', provincia: 'Córdoba', cp: '5152', zona: 'centro', precio: 10200 },
  { id: 35, localidad: 'Río Cuarto', provincia: 'Córdoba', cp: '5800', zona: 'centro', precio: 10200 },

  // Otras Provincias
  { id: 36, localidad: 'Corrientes', provincia: 'Corrientes', cp: '3400', zona: 'litoral', precio: 9500 },
  { id: 37, localidad: 'Posadas', provincia: 'Misiones', cp: '3300', zona: 'litoral', precio: 10500 },
  { id: 38, localidad: 'Mendoza', provincia: 'Mendoza', cp: '5500', zona: 'cuyo_noa', precio: 12000 },
  { id: 39, localidad: 'San Miguel de Tucumán', provincia: 'Tucumán', cp: '4000', zona: 'cuyo_noa', precio: 12500 },
  { id: 40, localidad: 'Salta', provincia: 'Salta', cp: '4400', zona: 'cuyo_noa', precio: 12800 },
  { id: 41, localidad: 'Neuquén', provincia: 'Neuquén', cp: '8300', zona: 'patagonia', precio: 13800 },
  { id: 42, localidad: 'San Carlos de Bariloche', provincia: 'Río Negro', cp: '8400', zona: 'patagonia', precio: 14500 },
  { id: 43, localidad: 'Ushuaia', provincia: 'Tierra del Fuego', cp: '9410', zona: 'patagonia', precio: 16500 },
];

/**
 * Normaliza cadenas quitando diacríticos (acentos) y convirtiendo a minúsculas.
 */
const normalizeText = (text) => {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

/**
 * Busca localidades que coincidan con la consulta.
 */
export const searchLocalities = (query) => {
  const q = normalizeText(query).trim();
  if (!q || q.length < 2) return [];

  return LOCALITIES.filter((loc) => {
    const locName = normalizeText(loc.localidad);
    const provName = normalizeText(loc.provincia);
    const cp = normalizeText(loc.cp);
    return locName.includes(q) || provName.includes(q) || cp.includes(q);
  }).map(({ id, localidad, provincia, cp }) => ({ id, localidad, provincia, cp }));
};

/**
 * Calcula la cotización del envío hacia el destinationId indicado.
 */
export const calculateShippingQuote = (destinationId) => {
  const numId = Number(destinationId);
  const found = LOCALITIES.find((loc) => loc.id === numId);

  if (!found) {
    throw Object.assign(new Error('La localidad de destino seleccionada no es válida.'), { status: 400 });
  }

  return {
    destination: {
      id: found.id,
      localidad: found.localidad,
      provincia: found.provincia,
      cp: found.cp,
    },
    origin: {
      localidad: 'Gualeguaychú',
      provincia: 'Entre Ríos',
      cp: '2820',
    },
    price: found.precio,
    isFree: found.precio === 0,
    formattedPrice: found.precio === 0 ? '¡Gratis!' : new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(found.precio),

  };
};
