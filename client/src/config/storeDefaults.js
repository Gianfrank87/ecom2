export const DEFAULT_STORE_CONFIG = {
  name: 'NigDiz',
  whatsapp: '+54 9 3446 373972',
  phone: '03446 373972',
  contactEmail: 'sehola.negocio@gmail.com',
  instagramUrl: 'https://www.instagram.com/sehola.negocio/',
  address: 'Rawson 622 · Gualeguaychú, Entre Ríos',
  businessHours: '',
  footerText: 'Artículos de seguridad para mascotas. Diseñados para protegerlos en cada paseo.',
};

export const mergeStoreConfig = (config = {}) => Object.fromEntries(
  Object.entries(DEFAULT_STORE_CONFIG).map(([key, fallback]) => [key, config[key] || fallback]),
);
