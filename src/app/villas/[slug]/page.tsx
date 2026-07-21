import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTY_BY_SLUG_QUERY, PROPERTY_SLUGS_QUERY } from '@/lib/queries'
import { Property, startingRate, allSeasonRates, formatPrice, communityLabel, VIEW_LABELS } from '@/lib/utils'
import {
  MEMBERSHIP_LABELS, BED_LABELS, LOC_LABEL, VIEW_H2_MAP,
  AMENITY_CATS, AMENITY_LABELS, STAFF_NAMES, STAFF_SERVICE_LABELS,
} from '@/lib/propertyDetailData'
import { renderPortableText } from '@/lib/portableText'
import Gallery from '@/components/detail/Gallery'
import AnchorNav from '@/components/detail/AnchorNav'
import Sidebar from '@/components/detail/Sidebar'
import MobileCtaBar from '@/components/detail/MobileCtaBar'
import PolicyAccordion from '@/components/detail/PolicyAccordion'
import DescriptionExpand from '@/components/detail/DescriptionExpand'
import SimilarProperties from '@/components/detail/SimilarProperties'

export const revalidate = 60

type Params = { slug: string }

async function getProperty(slug: string): Promise<Property | null> {
  return client.fetch(PROPERTY_BY_SLUG_QUERY, { slug })
}

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(PROPERTY_SLUGS_QUERY)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const prop = await getProperty(slug)
  if (!prop) return {}

  const typeLabel = prop.propertyType === 'condo' ? 'Condo' : 'Villa'
  const locStr = LOC_LABEL[prop.locationLabel] || 'Punta Mita, Nayarit'
  const title = `${prop.title} — ${prop.bedrooms} BR ${typeLabel} in Punta Mita | Mexican Reserve`
  const description = prop.shortDescription || `${prop.bedrooms}-bedroom luxury ${typeLabel.toLowerCase()} in ${locStr} with private staff and exclusive amenities.`
  // 1200x630 is the standard social-share card ratio (Facebook/WhatsApp/
  // Twitter); without an explicit height this was requesting the photo's
  // native ratio instead, which platforms then crop unpredictably.
  const ogImage = prop.heroImage?.asset?._ref ? urlFor(prop.heroImage).width(1200).height(630).quality(85).url() : undefined

  return {
    title,
    description,
    alternates: { canonical: `https://www.mexicanreserve.com/villas/${slug}` },
    openGraph: { title, description, images: ogImage ? [ogImage] : undefined },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function PropertyDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const prop = await getProperty(slug)
  if (!prop) notFound()

  const typeLabel = prop.propertyType === 'condo' ? 'Condo' : 'Villa'
  const minRate = startingRate(prop)
  const totalCarts = (prop.golfCart6Seater || 0) + (prop.golfCart4Seater || 0)
  const cartParts: string[] = []
  if (prop.golfCart6Seater) cartParts.push(`${prop.golfCart6Seater} six-seater`)
  if (prop.golfCart4Seater) cartParts.push(`${prop.golfCart4Seater} four-seater`)
  const cartLabel = cartParts.length ? `${cartParts.join(' + ')} golf cart${totalCarts !== 1 ? 's' : ''}` : ''
  const commLabel = communityLabel(prop)
  const locStr = LOC_LABEL[prop.locationLabel] || 'Punta Mita, Nayarit'
  const views = prop.viewsAndPool || []
  const POOL_VALUES = ['private-pool', 'communal-pool']
  const viewsDisplay = views.filter((v) => !POOL_VALUES.includes(v)).map((v) => VIEW_LABELS[v]).filter(Boolean).join(' · ')

  // Gallery: hero first, then gallery items in exact Photo Manager order —
  // this is the ONE true order, used for the lightbox, thumbnail strip, and
  // "1 / N" counter. The mosaic (hero + up to 3 photos flagged isMosaic) is
  // just a teaser preview shown above the gallery — it must never reorder
  // the actual gallery, so it's kept as a separate list. Gallery.tsx maps
  // each mosaic tile back to its real position in photoList when clicked,
  // so the lightbox always opens on the correct photo without the gallery
  // itself ever appearing reshuffled.
  const galleryItems = ((prop.gallery || []) as { asset?: { _ref: string }; hotspot?: { x: number; y: number }; roomTag?: string; isMosaic?: boolean }[])
    .filter((g) => g?.asset?._ref)
  const photoList = [
    ...(prop.heroImage?.asset?._ref ? [{ ph: prop.heroImage, tag: '' }] : []),
    ...galleryItems.map((g) => ({ ph: { asset: g.asset, hotspot: g.hotspot }, tag: g.roomTag || '' })),
  ]
  const mosaicPicks = galleryItems.filter((g) => g.isMosaic === true || g.roomTag === 'mosaic').slice(0, 3)
  const mosaicOrder = [
    ...(prop.heroImage?.asset?._ref ? [{ ph: prop.heroImage, tag: '' }] : []),
    ...mosaicPicks.map((g) => ({ ph: { asset: g.asset, hotspot: g.hotspot }, tag: g.roomTag || '' })),
  ]
  const mosaicPhotos = mosaicOrder.length >= 2 ? mosaicOrder : photoList.slice(0, 4)
  const hasExceptionalValue = (prop.collection || []).includes('exceptional-value')

  // Facts grid: golf carts, membership, check-in/out, up to 3 staff tiles
  const staff = prop.staffServices || []
  const findFirstRole = (roles: string[]) => roles.map((r) => staff.find((s) => s.role === r)).find(Boolean) || null
  const housekeeper = findFirstRole(['housekeeper'])
  const chefOrCook = findFirstRole(['chef', 'cook'])
  const staff3 = findFirstRole(['bartender', 'waiter', 'concierge'])
  const staffTile = (s: { role: string; services: string[] } | null) => {
    if (!s) return <div className="fact-card"><span className="fact-label">Staff</span><span className="fact-value">—</span></div>
    const name = STAFF_NAMES[s.role] || s.role
    const svcs = (s.services || []).map((sv) => STAFF_SERVICE_LABELS[sv] || sv).filter(Boolean).join(' · ')
    return (
      <div className="fact-card">
        <span className="fact-label">Staff</span>
        <span className="fact-value">{name}</span>
        {svcs && <span className="fact-sub">{svcs}</span>}
      </div>
    )
  }

  // Description H2
  const descViewKey = Object.keys(VIEW_H2_MAP).find((v) => views.includes(v))
  const descH2 = descViewKey ? `${VIEW_H2_MAP[descViewKey]} ${typeLabel}` : (commLabel ? `${commLabel} ${typeLabel}` : `Luxury ${typeLabel}`)

  // Rates / min stay / scarcity
  const seasons = prop.seasons || []
  const validStays = seasons.map((s) => s.minimumStay).filter((n) => n > 0)
  const minStayNights = validStays.length ? Math.min(...validStays) : 0
  // allSeasonRates correctly includes bedroom-tiered rates, not just a flat
  // nightlyRate — without it, a tiered season would contribute 0 here and
  // falsely trigger (or skew) the rate-variance check below.
  const rates = allSeasonRates(prop)
  const showScarcity = rates.length > 1 && Math.max(...rates) > Math.min(...rates) * 1.3

  // Location pills
  const airportMin = prop.locationLabel === 'puerto-vallarta' ? '20 min' : '45 min'
  const locationPills: { text: string }[] = [{ text: `${airportMin} from PVR Airport` }]
  if (views.includes('beachfront')) locationPills.push({ text: 'Direct beach access' })
  else if (views.includes('oceanfront')) locationPills.push({ text: 'Oceanfront community' })
  else if (views.includes('golf-course-view')) locationPills.push({ text: 'On the golf course' })
  if (commLabel) locationPills.push({ text: commLabel })
  const mapQuery = encodeURIComponent((commLabel ? commLabel + ', ' : '') + locStr)
  const mapSrc = `https://maps.google.com/maps?q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=&output=embed`

  // Title with italic on all but the first word: "Villa <em>Cielo Azul</em>"
  const titleParts = prop.title.split(' ')
  const titleFirst = titleParts[0]
  const titleRest = titleParts.slice(1).join(' ')

  const houseRulesVis = prop.policies && (
    <div className="house-rules-vis">
      <HouseRule pets ban={prop.policies.noPets !== false} label={prop.policies.noPets !== false ? 'No pets allowed' : 'Pets welcome'} />
      <HouseRule smoking ban={prop.policies.noSmoking !== false} label={prop.policies.noSmoking !== false ? 'No smoking' : 'Smoking permitted outdoors'} />
      <HouseRule ban={prop.policies.noEvents !== false} label={prop.policies.noEvents !== false ? 'No parties or events' : 'Small gatherings allowed'} />
    </div>
  )

  return (
    <div className="nav-always-dark-page">
      <AnchorNav />

      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="bc-sep">/</span>
        <Link href="/villas">Villas</Link>
        <span className="bc-sep">/</span>
        <span className="bc-current">{prop.title}</span>
      </div>

      <Gallery photos={photoList} mosaicPhotos={mosaicPhotos} isExceptionalValue={hasExceptionalValue} />

      <div className="detail-wrap">
        <div className="detail-left">
          <div className="prop-header">
            <div className="prop-community-row">
              {commLabel && (
                <span className="prop-comm-name">
                  <svg viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {commLabel}
                </span>
              )}
              {viewsDisplay && (
                <>
                  {commLabel && <span className="prop-comm-sep">·</span>}
                  <span className="prop-comm-views">
                    <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {viewsDisplay}
                  </span>
                </>
              )}
            </div>
            <h1 className="prop-title">{titleFirst} {titleRest && <em>{titleRest}</em>}</h1>
            {prop.tagline && <p className="pd-tagline">{prop.tagline}</p>}
            <div className="specs-strip">
              <div className="spec-item">
                <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                {prop.bedrooms} bedroom{prop.bedrooms !== 1 ? 's' : ''}
              </div>
              {prop.bathrooms ? (
                <div className="spec-item">
                  <svg viewBox="0 0 24 24"><path d="M2 12h20v5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5z"/><path d="M6 12V7a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v5"/><line x1="7" y1="19" x2="7" y2="22"/><line x1="17" y1="19" x2="17" y2="22"/></svg>
                  {prop.bathrooms} bathroom{prop.bathrooms !== 1 ? 's' : ''}
                </div>
              ) : null}
              <div className="spec-item">
                <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Up to {prop.maxAdults || 0}{prop.childOnlyBeds ? ` + ${prop.childOnlyBeds}` : ''} guests
              </div>
              <div className="spec-rating">
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Verified property
              </div>
            </div>
          </div>

          {prop.shortDescription && <p className="short-desc reveal" id="overview">{prop.shortDescription}</p>}

          <div className="detail-section reveal">
            <span className="sec-label">At a glance</span>
            <div className="facts-grid">
              <div className="fact-card">
                <span className="fact-label">Golf carts</span>
                <span className="fact-value">{totalCarts > 0 ? cartLabel : '—'}</span>
                {totalCarts > 0 && <span className="fact-sub">For use throughout the community</span>}
              </div>
              <div className="fact-card">
                <span className="fact-label">Membership</span>
                <span className="fact-value">{prop.memberships ? (MEMBERSHIP_LABELS[prop.memberships] || prop.memberships) : '—'}</span>
                {prop.memberships && <span className="fact-sub">Beach club · Pool · Restaurant · Golf</span>}
              </div>
              <div className="fact-card">
                <span className="fact-label">Check-in / out</span>
                <span className="fact-value">3 pm / 11 am</span>
                <span className="fact-sub">Early / late on request</span>
              </div>
              {staffTile(housekeeper)}
              {staffTile(chefOrCook)}
              {staffTile(staff3)}
            </div>
          </div>

          {prop.fullDescription?.length ? (
            <div className="detail-section reveal">
              <span className="sec-label">About this {typeLabel.toLowerCase()}</span>
              <h2 className="sec-title">{descH2}</h2>
              <DescriptionExpand>{renderPortableText(prop.fullDescription)}</DescriptionExpand>
            </div>
          ) : null}

          {prop.bedConfiguration?.length ? (
            <div className="detail-section reveal" id="rooms">
              <span className="sec-label">Sleeping arrangements</span>
              <h2 className="sec-title">Bedroom configuration</h2>
              <div className="bedroom-grid">
                {(prop.bedConfiguration as { name: string; beds?: { bedType: string; count: number }[] }[]).map((room, i) => (
                  <div className="bedroom-card" key={i}>
                    <div className="bedroom-num">{i + 1}</div>
                    <div className="bedroom-info">
                      <div className="bedroom-name">{room.name}</div>
                      {room.beds?.length ? (
                        <div className="bedroom-beds">
                          {room.beds.map((b, bi) => (
                            <span key={bi}>
                              {bi > 0 && <span className="bed-sep">·</span>}
                              <span className="bed-item">{b.count} {BED_LABELS[b.bedType] || b.bedType}</span>
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {prop.amenities?.length ? (
            <div className="detail-section reveal" id="amenities">
              <span className="sec-label">What this place offers</span>
              <h2 className="sec-title">Amenities</h2>
              <div>
                {AMENITY_CATS.map((cat) => {
                  const amenSet = new Set(prop.amenities)
                  const items = cat.keys.filter((k) => amenSet.has(k))
                  if (!items.length) return null
                  return (
                    <div className="amenity-category" key={cat.label}>
                      <div className="amenity-cat-title">{cat.icon}{cat.label}</div>
                      <div className="amenity-list">
                        {items.map((k) => (
                          <div className="am-item" key={k}>
                            <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                            {AMENITY_LABELS[k] || k}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {prop.staffServices?.length ? (
            <div className="detail-section reveal" id="staff">
              <span className="sec-label">Your household team</span>
              <h2 className="sec-title">Staff &amp; Services</h2>
              <div className="services-grid">
                {prop.staffServices.map((s, i) => {
                  const name = STAFF_NAMES[s.role] || s.role
                  const services = (s.services || []).map((sv) => STAFF_SERVICE_LABELS[sv] || sv).filter(Boolean)
                  return (
                    <div className="service-card" key={i}>
                      <div className="service-name">{name}</div>
                      {services.length ? <div className="service-desc">{services.join(', ')}.</div> : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {seasons.length ? (
            <div className="detail-section reveal" id="rates">
              <span className="sec-label">Pricing</span>
              <h2 className="sec-title">Rates</h2>
              <table className="rates-table">
                <thead>
                  <tr><th>Season</th><th>Rate / night (USD)</th><th>Min. stay</th></tr>
                </thead>
                <tbody>
                  {seasons.map((s, i) => (
                    <tr key={i}>
                      <td>{s.seasonName || '—'}</td>
                      <td>
                        {s.bedroomRates && s.bedroomRates.length > 0 ? (
                          <div className="rate-tiers">
                            {s.bedroomRates.map((br, j) => (
                              <div className="rate-tier" key={j}>{br.bedrooms} BR — {formatPrice(br.nightlyRate)}</div>
                            ))}
                          </div>
                        ) : (
                          formatPrice(s.nightlyRate)
                        )}
                      </td>
                      <td>{s.minimumStay ? `${s.minimumStay} nights` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <ul className="rates-note">
                <li>Taxes: 16% VAT + 5% tourism tax may apply</li>
                <li>Service fee may apply</li>
                <li>Rates are quoted per night and in USD</li>
                <li>Rates do not include the cost of Food and Beverage</li>
                <li>Rates do not include Staff Gratuities, recommended at 10% to 15% of the reservation pre-tax total</li>
                <li>Rates are subject to change without notice</li>
              </ul>
            </div>
          ) : null}

          <div className="detail-section reveal">
            <span className="sec-label">Before you book</span>
            <h2 className="sec-title">Rules &amp; Policies</h2>
            <PolicyAccordion
              houseRulesVis={houseRulesVis}
              rulesContent={
                <ul>
                  <li>Staff working hours: 8 am to 4 pm</li>
                  <li>Security deposit equivalent to one night is required (Refunded after departure inspection)</li>
                </ul>
              }
            />
          </div>

          <div className="detail-section reveal" id="location">
            <span className="sec-label">Where you&rsquo;ll be</span>
            <h2 className="sec-title">Destination</h2>
            <div className="location-map">
              <iframe title="Property location" src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="location-pills">
              {locationPills.map((p, i) => (
                <span className="location-pill" key={i}>
                  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {p.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="detail-right">
          <Sidebar propertyTitle={prop.title} minRate={minRate} minStayNights={minStayNights} showScarcity={showScarcity} />
        </div>
      </div>

      <div className="bottom-cta">
        <div className="bottom-cta-inner">
          <div className="bottom-cta-text">
            <h3>Ready to experience <em>Punta Mita</em>?</h3>
            <p>Reach out and we&rsquo;ll confirm availability, answer your questions, and arrange every detail — from arrival to checkout.</p>
          </div>
          <div className="bottom-cta-btns">
            <a href="https://wa.me/523313619889" className="bottom-cta-btn bcb-primary">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.659 1.438 5.168L2 22l4.985-1.402A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2z"/></svg>
              Check Availability
            </a>
            <Link href="/villas" className="bottom-cta-btn bcb-secondary">
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              Browse all villas
            </Link>
          </div>
        </div>
      </div>

      <SimilarProperties property={prop} />

      <MobileCtaBar minRate={minRate} />
    </div>
  )
}

function HouseRule({ pets, smoking, ban, label }: { pets?: boolean; smoking?: boolean; ban: boolean; label: string }) {
  const icon = pets ? (
    <svg className="hr-icon" viewBox="0 0 24 24"><path d="M7.5 16c0-2.8 2-4.5 4.5-4.5s4.5 1.7 4.5 4.5c0 2-1.8 3.5-4.5 3.5S7.5 18 7.5 16z"/><circle cx="10.5" cy="5" r="1.8"/><circle cx="16.5" cy="5" r="1.8"/><circle cx="5.5" cy="10" r="1.8"/><circle cx="18" cy="10" r="1.5"/></svg>
  ) : smoking ? (
    <svg className="hr-icon" viewBox="0 0 24 24"><rect x="2" y="12" width="14" height="4" rx="1.5"/><line x1="16" y1="14" x2="19" y2="14"/><path d="M20 10c0 2.5 2 2.5 2 5"/><path d="M18 10c0 2.5 2 2.5 2 5"/></svg>
  ) : (
    <svg className="hr-icon" viewBox="0 0 24 24"><path d="M5.5 11.5 2 22l10-3.5"/><path d="M14.5 2 19 6.5l-9.5 9.5a1.1 1.1 0 0 1-1.5 0l-2-2a1.1 1.1 0 0 1 0-1.5L14.5 2z"/><circle cx="20" cy="5" r="1"/><line x1="22" y1="9" x2="20" y2="9"/><line x1="20" y1="3" x2="20" y2="1"/></svg>
  )
  return (
    <div className="hr-item">
      <div className="hr-icon-circle">
        {icon}
        {ban && <svg className="hr-ban" viewBox="0 0 60 60"><line x1="14" y1="46" x2="46" y2="14"/></svg>}
      </div>
      <span className="hr-label">{label}</span>
    </div>
  )
}
