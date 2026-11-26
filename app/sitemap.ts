import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://aeris-urban-air-intelligence.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
  ];
}
