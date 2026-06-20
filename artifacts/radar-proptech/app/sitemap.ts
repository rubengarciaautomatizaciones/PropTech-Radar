import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://kavox.tech',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://kavox.tech/legal/terminos',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://kavox.tech/legal/privacidad',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    }
  ]
}