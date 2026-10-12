const legacyPrefix = ['hue', 'llitas'].join('');
const LEGACY_STORAGE_KEYS = {
  adminToken: `${legacyPrefix}_admin_token`,
  clientToken: `${legacyPrefix}_client_token`,
  cart: `${legacyPrefix}_cart`,
};

export const STORAGE_KEYS = {
  adminToken: 'nigdiz_admin_token',
  clientToken: 'nigdiz_client_token',
  cart: 'nigdiz_cart',
};

export const readStoredValue = (key) => {
  const currentKey = STORAGE_KEYS[key];
  const legacyKey = LEGACY_STORAGE_KEYS[key];
  const currentValue = localStorage.getItem(currentKey);
  if (currentValue !== null || !legacyKey) return currentValue;

  const legacyValue = localStorage.getItem(legacyKey);
  if (legacyValue !== null) {
    localStorage.setItem(currentKey, legacyValue);
    localStorage.removeItem(legacyKey);
  }
  return legacyValue;
};

export const writeStoredValue = (key, value) => {
  localStorage.setItem(STORAGE_KEYS[key], value);
  if (LEGACY_STORAGE_KEYS[key]) localStorage.removeItem(LEGACY_STORAGE_KEYS[key]);
};

export const removeStoredValue = (key) => {
  localStorage.removeItem(STORAGE_KEYS[key]);
  if (LEGACY_STORAGE_KEYS[key]) localStorage.removeItem(LEGACY_STORAGE_KEYS[key]);
};
