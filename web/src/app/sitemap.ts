import type { MetadataRoute } from 'next';
import { presences } from '@/data/presences';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://rpcraft.cloud';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 1 },
    { url: `${baseUrl}/presences`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${baseUrl}/docs`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  ];

  const presencePages = presences.map(p => ({
    url: `${baseUrl}/presences/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...presencePages];
}
