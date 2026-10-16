const storefrontOrigins = [
  'https://nigdiz.com.ar',
  'https://www.nigdiz.com.ar',
];

export const parseOriginList = (value = '') => String(value)
  .split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// A redirect needs one URL; additional CORS origins belong in CORS_ORIGINS.
export const getFrontendUrl = (value = process.env.CLIENT_URL || process.env.FRONTEND_URL) =>
  parseOriginList(value)[0] || (process.env.NODE_ENV === 'production'
    ? storefrontOrigins[0]
    : 'http://localhost:5173');

export const getAllowedOrigins = () => new Set([
  ...storefrontOrigins,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...parseOriginList(process.env.CLIENT_URL),
  ...parseOriginList(process.env.FRONTEND_URL),
  ...parseOriginList(process.env.CORS_ORIGIN),
  ...parseOriginList(process.env.CORS_ORIGINS),
]);
