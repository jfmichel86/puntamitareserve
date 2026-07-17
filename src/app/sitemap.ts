import type { MetadataRoute } from 'next'
import { client } from '@/lib/sanity'
import { PROPERTY_SLUGS_QUERY } from '@/lib/queries'

const BASE_URL = 'https://www.mexicanreserve.com'

// Static, hand-maintained pages. /saved is intentionally excluded — it's a
// personal wishlist page, already marked noindex, and has nothing to offer
// a search engine. Individual villa and destination pages are appended below
// from live data so new properties show up automatically without a manual edit.
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '',                          priority: 1.0, changeFrequency: 'daily'   },
  { path: '/villas',                   priority: 0.9, changeFrequency: 'daily'   },
  { path: '/destinations',             priority: 0.8, changeFrequency: 'weekly'  },
  { path: '/destinations/punta-mita',      priority: 0.8, changeFrequency: 'weekly' },
  { path: '/destinations/punta-de-mita',   priority: 0.8, changeFrequency: 'weekly' },
  { path: '/destinations/puerto-vallarta', priority: 0.7, changeFrequency: 'weekly' },
  { path: '/about',                    priority: 0.6, changeFrequency: 'monthly' },
  { path: '/contact',                  priority: 0.6, changeFrequency: 'monthly' },
  { path: '/faq',                      priority: 0.5, changeFrequency: 'monthly' },
  { path: '/cancellation-policy',      priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/privacy-policy',           priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/terms-and-conditions',     priority: 0.3, changeFrequency: 'yearly'  },
  { path: '/welcome-offer-terms',      priority: 0.3, changeFrequency: 'yearly'  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  let slugs: string[] = []
  try {
    slugs = await client.fetch(PROPERTY_SLUGS_QUERY)
  } catch {
    // If Sanity is unreachable at build time, ship the sitemap with just the
    // static routes rather than failing the whole build.
    slugs = []
  }

  const villaEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/villas/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticEntries, ...villaEntries]
}
