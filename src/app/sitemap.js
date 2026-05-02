import { getAllProducts } from '@/lib/db';

export default async function sitemap() {
  const baseUrl = 'https://oatbitesbysej.vercel.app';
  
  // Base routes
  const routes = ['', '/products', '/login', '/register'].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic product routes
  try {
    const products = await getAllProducts();
    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    
    return [...routes, ...productRoutes];
  } catch (error) {
    console.error('Error generating sitemap for products:', error);
    return routes;
  }
}
