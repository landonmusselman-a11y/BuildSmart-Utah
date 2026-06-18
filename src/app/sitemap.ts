import { MetadataRoute } from 'next';
import { mockBuilders } from '@/data/mock';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://newconstructionutah.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${base}/builders`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/communities`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/incentives`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/get-started`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
  ];

  const builderRoutes: MetadataRoute.Sitemap = mockBuilders.map(builder => ({
    url: `${base}/builders/${builder.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const communityRoutes: MetadataRoute.Sitemap = mockBuilders.flatMap(builder =>
    builder.communities.map(community => ({
      url: `${base}/communities/${community.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    }))
  );

  return [...staticRoutes, ...builderRoutes, ...communityRoutes];
}
