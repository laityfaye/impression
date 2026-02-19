import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://imp.innosft.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/verification',
    '/finitions',
    '/livraison',
    '/recapitulatif',
    '/suivi',
  ];

  return routes.map((path) => ({
    url: `${BASE_URL}${path || '/'}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : ('monthly' as const),
    priority: path === '' ? 1 : 0.8,
  }));
}
