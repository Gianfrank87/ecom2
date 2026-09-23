export const getProductImages = (product) => {
  const source = Array.isArray(product?.images) && product.images.length
    ? product.images
    : product?.image ? [product.image] : [];

  return [...new Set(source.map((image) => String(image || '').trim()).filter(Boolean))];
};
