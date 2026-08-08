import type { Metadata } from 'next'
import Link from 'next/link'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_BY_DESTINATION_QUERY } from '@/lib/queries'
import { Property, LOC_TYPE_LABELS } from '@/lib/utils'
import { PUNTA_MITA_COMMUNITIES } from '@/data/puntaMitaCommunities'
import { PUNTA_MITA_BEACH_CLUBS } from '@/data/puntaMitaBeachClubs'
import { CommunityPin } from '@/components/CommunityMap'
import CommunityExplorer from '@/components/CommunityExplorer'

export const revalidate = 60

// The 4 feature pills come straight from each community's real published
// properties — the same `viewsAndPool` and `bedrooms` fields already set
// on every listing in Sanity — rather than any outside research. A
// community with no listings yet never reaches these (see the `pins`
// filter below), so there's never a pill built from nothing.

// Location: which of the 4 physical-position tags (see LOC_TYPE_LABELS in
// utils.ts) any property in this community has, in priority order.
function aggregateLocation(props: Property[]): string {
  const all = new Set(props.flatMap((p) => p.viewsAndPool || []))
  const order: (keyof typeof LOC_TYPE_LABELS)[] = ['beachfront', 'oceanfront', 'golf-course', 'hillside']
  for (const key of order) if (all.has(key)) return LOC_TYPE_LABELS[key]
  return ''
}

// Views: which of the 3 "-view" tags any property in this community has —
// distinct from location above (a home can be inland but still tagged
// golf-course-view, for example).
function aggregateViews(props: Property[]): string {
  const all = new Set(props.flatMap((p) => p.viewsAndPool || []))
  const parts: string[] = []
  if (all.has('ocean-view')) parts.push('Ocean')
  if (all.has('golf-course-view')) parts.push('Golf')
  if (all.has('lake-view')) parts.push('Lake')
  if (parts.length === 0) return ''
  return `${parts.join(' & ')} ${parts.length > 1 ? 'Views' : 'View'}`
}

// Pool: private-pool / communal-pool tags, checked across every property
// in the community — if some have one and some the other, both show.
function aggregatePool(props: Property[]): string {
  const hasPrivate = props.some((p) => p.viewsAndPool?.includes('private-pool'))
  const hasCommunal = props.some((p) => p.viewsAndPool?.includes('communal-pool'))
  if (hasPrivate && hasCommunal) return 'Private & Communal Pools'
  if (hasPrivate) return 'Private Pool'
  if (hasCommunal) return 'Communal Pool'
  return ''
}

// Bedrooms: real min-to-max range across the community's actual listings,
// not a researched estimate.
function aggregateBedrooms(props: Property[]): string {
  const counts = props.map((p) => p.bedrooms).filter((n): n is number => typeof n === 'number')
  if (counts.length === 0) return ''
  const min = Math.min(...counts)
  const max = Math.max(...counts)
  return min === max ? `${min} Bedroom${min === 1 ? '' : 's'}` : `${min}–${max} Bedrooms`
}

const TITLE = 'Explore the Communities — Punta Mita'
const DESCRIPTION = 'Punta Mita is made up of distinct gated communities, each with its own character. Explore the peninsula and find the one that fits how you travel.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, images: ['https://www.mexicanreserve.com/og-image-1.jpg'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

async function getProperties(): Promise<Property[]> {
  return client.fetch(PROPERTIES_BY_DESTINATION_QUERY, { locationLabel: 'punta-mita' })
}

export default async function CommunitiesPage({
  searchParams,
}: {
  // ?calibrate=1 switches the map into the drag-to-correct setup mode —
  // see the comment on CommunityMap's `calibrate` prop. Not linked
  // anywhere on the site; it's a URL Francisco visits directly while
  // fixing pin positions, then removes once done.
  searchParams: Promise<{ calibrate?: string }>
}) {
  const { calibrate } = await searchParams
  const properties = await getProperties()

  // Only a community with at least one published property today actually
  // gets a pin/card — the data file above lists every community we have
  // rough position data for, but inventory changes over time and this
  // keeps the page honest about what's actually bookable right now.
  const pins: CommunityPin[] = PUNTA_MITA_COMMUNITIES
    .map((c): CommunityPin | null => {
      const matches = properties.filter((p) => p.communityPuntaMita === c.slug)
      if (matches.length === 0) return null
      const withPhoto = matches.find((p) => p.heroImage?.asset?._ref)
      return {
        slug: c.slug,
        name: c.name,
        lat: c.lat,
        lng: c.lng,
        description: c.description,
        location: aggregateLocation(matches),
        views: aggregateViews(matches),
        pool: aggregatePool(matches),
        bedrooms: aggregateBedrooms(matches),
        count: matches.length,
        photoUrl: withPhoto?.heroImage?.asset?._ref
          ? urlFor(withPhoto.heroImage!).width(280).height(200).quality(85).url()
          : undefined,
      }
    })
    .filter((p): p is CommunityPin => p !== null)

  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Punta Mita — Inside the Gates</p>
        <h1 className="pg-title">Explore the Communities</h1>
        <p className="pg-sub">A 1,500-acre peninsula made up of distinct gated communities — each with its own character, its own view, its own pace.</p>
      </section>

      <div className="dest-wrap dest-wrap--redesigned">
        <CommunityExplorer
          pins={pins}
          destinationSlug="punta-mita"
          calibrate={calibrate === '1'}
          beachClubs={calibrate === '1' ? PUNTA_MITA_BEACH_CLUBS : undefined}
        />

        <div className="bottom-cta">
          <div className="bottom-cta-inner">
            <div className="bottom-cta-text">
              <h3>Not sure which community is right for you?</h3>
              <p>Tell us how you like to travel and we&rsquo;ll point you to the right one.</p>
            </div>
            <div className="bottom-cta-btns">
              <Link href="/villas?destination=punta-mita" className="bottom-cta-btn bcb-primary">
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                Browse all Punta Mita villas
              </Link>
              <Link href="/contact" className="bottom-cta-btn bcb-secondary">
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Contact our team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
