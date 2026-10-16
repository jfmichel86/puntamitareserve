import { Suspense } from 'react'
import type { Metadata } from 'next'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_QUERY } from '@/lib/queries'
import { Property, startingRate } from '@/lib/utils'
import SavedClient from './SavedClient'

// Revalidate every 60 seconds, same as the villas listing page
export const revalidate = 60

async function getProperties(): Promise<Property[]> {
  return client.fetch(PROPERTIES_QUERY)
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ props?: string }>
}): Promise<Metadata> {
  const title = 'Your Wishlist'
  const description = 'Compare your saved Punta Mita villas side by side — rates, amenities, and details in one place.'

  // The "Share wishlist" button (SavedClient.tsx) puts the saved slugs right
  // in the URL as ?props=slug-a,slug-b,slug-c — that's what turns this from
  // "impossible to personalize" into "easy": a visitor's own /saved page
  // (no ?props) is genuinely private, stored only in their browser, so there
  // really is no server-visible photo to pick for that case. But a *shared*
  // link already names its properties right there in the URL, so the
  // preview can reflect exactly what's being sent instead of a generic
  // featured villa — which looked wrong when someone shared a modest condo
  // and the link still showed a huge, unaffordable-looking estate photo.
  const sp = await searchParams
  const slugs = sp.props ? sp.props.split(',').map((s) => s.trim()).filter(Boolean) : []

  const properties = await getProperties()

  // Per Francisco: prefer the priciest property in the shared list (the one
  // most likely to represent the group's "ceiling"), falling back to just
  // any property in that list if pricing data is ever missing, and finally
  // to the sitewide featured villa when this isn't a shared link at all.
  let heroProp: Property | undefined
  if (slugs.length > 0) {
    const matched = properties.filter((p) => slugs.includes(p.slug))
    heroProp = matched.reduce<Property | undefined>((best, p) => {
      if (!best) return p
      return (startingRate(p) ?? 0) > (startingRate(best) ?? 0) ? p : best
    }, undefined)
  }
  if (!heroProp) heroProp = properties[0]

  const ogImage = heroProp?.heroImage?.asset?._ref
    ? urlFor(heroProp.heroImage).width(1200).height(630).quality(85).url()
    : 'https://www.mexicanreserve.com/og-image-1.jpg'

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function SavedPage() {
  const properties: Property[] = await getProperties()

  return (
    <Suspense fallback={null}>
      <SavedClient properties={properties} />
    </Suspense>
  )
}
