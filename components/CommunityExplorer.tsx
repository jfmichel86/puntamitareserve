'use client'

// Wraps the interactive map and the "Every Community" grid. The two work
// independently: the map (hover/click a pin) is a quick visual preview,
// while every card in the "Every Community" grid is a direct link to that
// community's actual listing results — clicking a community should show
// its villas, not just preview it. This component also owns the
// view-type filter chips (Ocean/Golf/Lake), which narrow both the grid
// and the map's pins at once. Everything about *which* communities exist
// and what their facts are still comes from the server page
// (src/data/puntaMitaCommunities.ts + the live Sanity aggregation there)
// — this component only manages on-page interaction state.
import { useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import CommunityMap, { CommunityPin, BeachClubPin, propertyTypeLabel } from './CommunityMap'

// Matches the exact "-view" tags a property can carry in Sanity
// (VIEW_LABELS in utils.ts: ocean-view, golf-course-view, lake-view) —
// not an invented vocabulary. Matched as a substring against each pin's
// `views` field (e.g. "Ocean & Golf Views" matches both "Ocean" and
// "Golf"). Only rendered as a chip if at least one pin actually has that
// view today, so the filter row never shows an option that would just
// return zero results.
const VIEW_FILTERS = ['Ocean', 'Golf', 'Lake']

// A comparison table wider than 4 columns stops being scannable at a
// glance — this is the same ceiling for the same reason the wishlist
// compare table doesn't enforce a cap (it expects a curated wishlist to
// begin with), except here anyone could in theory tap all 22 cards.
const MAX_COMPARE = 4

export default function CommunityExplorer({
  pins,
  destinationSlug,
  calibrate,
  beachClubs,
}: {
  pins: CommunityPin[]
  destinationSlug: string
  calibrate: boolean
  // Only rendered/used in calibrate mode — see CommunityMap's beachClubs prop.
  beachClubs?: BeachClubPin[]
}) {
  const [active, setActive] = useState<CommunityPin | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
  const mapSectionRef = useRef<HTMLDivElement>(null)
  const compareSectionRef = useRef<HTMLDivElement>(null)

  const availableFilters = useMemo(
    () => VIEW_FILTERS.filter((f) => pins.some((p) => p.views.includes(f))),
    [pins]
  )
  const filteredPins = useMemo(
    () => (filter ? pins.filter((p) => p.views.includes(filter)) : pins),
    [pins, filter]
  )

  // Which communities are queued up for the compare table — plain page
  // state, not localStorage, since (unlike the wishlist heart) this
  // selection only ever matters on this one page and shouldn't survive
  // a visit somewhere else and back.
  const [compareSlugs, setCompareSlugs] = useState<string[]>([])
  const atCompareCap = compareSlugs.length >= MAX_COMPARE
  function toggleCompare(slug: string) {
    setCompareSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length >= MAX_COMPARE ? prev : [...prev, slug]
    )
  }
  // Keeps the table's column order matching the order communities were
  // selected in, rather than jumping around whenever `pins` re-sorts.
  const comparePins = useMemo(
    () => compareSlugs.map((slug) => pins.find((p) => p.slug === slug)).filter((p): p is CommunityPin => !!p),
    [compareSlugs, pins]
  )

  return (
    <>
      {pins.length > 0 && (
        <div className="detail-section reveal" ref={mapSectionRef}>
          <span className="sec-label">01</span>
          <h2 className="sec-title">Find Your Corner of the Peninsula</h2>
          <p className="dest-section-intro">Hover or tap a pin to see what makes each community different.</p>
          <CommunityMap
            pins={filteredPins}
            destinationSlug={destinationSlug}
            calibrate={calibrate}
            active={active}
            onActiveChange={setActive}
            beachClubs={beachClubs}
          />
        </div>
      )}

      <div className="detail-section reveal">
        <span className="sec-label">{pins.length > 0 ? '02' : '01'}</span>
        <h2 className="sec-title">Every Community</h2>

        {availableFilters.length > 0 && (
          <div className="comm-filter-row">
            <button
              type="button"
              className={`comm-filter-chip${filter === null ? ' is-active' : ''}`}
              onClick={() => setFilter(null)}
            >
              All Views
            </button>
            {availableFilters.map((f) => (
              <button
                key={f}
                type="button"
                className={`comm-filter-chip${filter === f ? ' is-active' : ''}`}
                onClick={() => setFilter(filter === f ? null : f)}
              >
                {f} View
              </button>
            ))}
          </div>
        )}

        <div className="comm-grid">
          {/* The whole card is one link straight to that community's
              listing results — clicking a community should show its
              villas, not open its card on the map above. (The map above
              is still its own thing: hover/click a pin there to preview
              a community without leaving the page.) The Compare pill is
              the one clickable thing inside that ISN'T that link —
              preventDefault + stopPropagation keep it from also
              navigating when tapped. */}
          {filteredPins.map((c) => {
            const isComparing = compareSlugs.includes(c.slug)
            return (
              <Link
                key={c.slug}
                href={`/villas?destination=${destinationSlug}&community=${c.slug}`}
                className="comm-grid-card"
              >
                <div className="comm-grid-card-photo">
                  {/* Reuses comparePhotoUrl (already fetched at 900x600,
                      the same 3:2 crop the sitewide PropertyCard uses)
                      rather than fetching a third size of the same
                      photo — see page.tsx for where that's pulled from
                      Sanity. */}
                  {c.comparePhotoUrl ? (
                    <Image
                      src={c.comparePhotoUrl}
                      alt={c.name}
                      fill
                      sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 25vw"
                      className="comm-grid-card-img"
                    />
                  ) : (
                    <div className="comm-grid-card-photo-placeholder" />
                  )}
                  <button
                    type="button"
                    className={`comm-compare-btn${isComparing ? ' is-active' : ''}`}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(c.slug) }}
                    disabled={!isComparing && atCompareCap}
                    aria-pressed={isComparing}
                  >
                    {isComparing ? '✓ Comparing' : '+ Compare'}
                  </button>
                </div>
                <div className="comm-grid-card-body">
                  <p className="comm-grid-card-name">{c.name}</p>
                  <div className="comm-tags">
                    {[c.location, c.views, c.pool, c.bedrooms].filter(Boolean).map((t) => (
                      <span key={t} className="comm-tag">{t}</span>
                    ))}
                  </div>
                  <p className="comm-grid-card-desc">{c.description}</p>
                  <span className="legal-cta">
                    View {c.count} {propertyTypeLabel(c.propertyTypeWord, c.count)}
                    <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Compare table — only appears once 2+ communities are queued up.
          Sits right after the grid so it reads as "here's what you
          picked," not a separate destination. */}
      {comparePins.length >= 2 && (
        // Plain .detail-section, not "reveal" — the sitewide fade-in-on-
        // scroll effect (ScrollReveal.tsx) only scans the page once when
        // it first loads, so a section that only appears later (after
        // tapping Compare) would get stuck permanently invisible at the
        // "before it fades in" opacity:0 state — that's exactly the bug
        // Francisco hit. This section should just appear the instant
        // it's added to the page instead.
        <div className="detail-section" ref={compareSectionRef} id="comm-compare">
          <span className="sec-label">{pins.length > 0 ? '03' : '02'}</span>
          <h2 className="sec-title">Compare Communities</h2>
          <p className="dest-section-intro">A side-by-side look at the facts that actually help you choose.</p>
          <div className="comm-cmp-scroll">
            <table className="comm-cmp-table">
              <thead>
                <tr>
                  <th className="comm-cmp-lbl"></th>
                  {comparePins.map((c) => (
                    <th className="comm-cmp-hd" key={c.slug}>
                      <div className="comm-cmp-thumb-wrap">
                        <span
                          className={`comm-cmp-thumb${c.comparePhotoUrl ? '' : ' comm-cmp-thumb-empty'}`}
                          style={c.comparePhotoUrl ? { backgroundImage: `url('${c.comparePhotoUrl}')` } : undefined}
                        />
                        <button
                          type="button"
                          className="comm-cmp-remove-btn"
                          onClick={() => toggleCompare(c.slug)}
                          aria-label={`Remove ${c.name} from comparison`}
                        >
                          <svg viewBox="0 0 24 24"><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></svg>
                        </button>
                      </div>
                      <p className="comm-cmp-name">{c.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="comm-cmp-lbl">Views</td>
                  {comparePins.map((c) => <td className="comm-cmp-val" key={c.slug}>{c.views || '—'}</td>)}
                </tr>
                <tr>
                  <td className="comm-cmp-lbl">Location</td>
                  {comparePins.map((c) => <td className="comm-cmp-val" key={c.slug}>{c.location || '—'}</td>)}
                </tr>
                <tr>
                  <td className="comm-cmp-lbl">Pool</td>
                  {comparePins.map((c) => <td className="comm-cmp-val" key={c.slug}>{c.pool || '—'}</td>)}
                </tr>
                <tr>
                  <td className="comm-cmp-lbl">Beach access</td>
                  {comparePins.map((c) => <td className="comm-cmp-val" key={c.slug}>{c.beachAccess || '—'}</td>)}
                </tr>
                <tr>
                  <td className="comm-cmp-lbl">Sun</td>
                  {comparePins.map((c) => <td className="comm-cmp-val" key={c.slug}>{c.sunOrientation || '—'}</td>)}
                </tr>
                <tr>
                  <td className="comm-cmp-lbl">Price range</td>
                  {comparePins.map((c) => <td className="comm-cmp-val" key={c.slug}>{c.priceRange || '—'}</td>)}
                </tr>
                <tr>
                  <td className="comm-cmp-lbl">Closest beach club</td>
                  {comparePins.map((c) => <td className="comm-cmp-val" key={c.slug}>{c.beachClubDistance || '—'}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating trigger — appears once there's something worth jumping
          to, same bottom-center pill treatment as the villas listing
          page's "All Filters" button so it reads as a consistent site
          pattern rather than a one-off control. */}
      {comparePins.length >= 2 && (
        <a href="#comm-compare" className="comm-compare-bar">
          Compare {comparePins.length} {comparePins.length === 1 ? 'Community' : 'Communities'}
          <span className="comm-compare-bar-badge">{comparePins.length}</span>
        </a>
      )}
    </>
  )
}
