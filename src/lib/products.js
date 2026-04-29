// This file is for server-side usage only (API routes, server components)
// Client components should fetch from /api/admin/products instead

import productsData from '../data/products.json';

export const products = productsData;

export function getProductById(id) {
  return productsData.find(p => p.id === id);
}

export function getProducts() {
  return productsData;
}
