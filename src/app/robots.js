export default function robots() {
  const baseUrl = 'https://oatbites.in';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/checkout/', '/dashboard/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
