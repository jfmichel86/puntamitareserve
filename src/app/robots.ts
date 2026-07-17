import type { MetadataRoute } from 'next'

const BASE_URL = 'https://www.mexicanreserve.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /saved is a personal wishlist page (already marked noindex on the
      // page itself) — kept out of crawling too, since it has no content
      // worth indexing and is different for every visitor.
      disallow: ['/saved'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
