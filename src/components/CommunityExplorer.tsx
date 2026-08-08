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
import CommunityMap, { CommunityPin } from './CommunityMap'

// Matches the exact "-view" tags a property can carry in Sanity
// (VIEW_LABELS in utils.ts: ocean-view, golf-course-view, lake-view) —
// not an invented vocabulary. Matched as a substring against each pin's
// `views` field (e.g. "Ocean & Golf Views" matches both "Ocean" and
// "Golf"). Only rendered as a chip if at least one pin actually has that
// view today, so the filter row never shows an option that would just
// return zero results.
const VIEW_FILTERS = ['Ocean', 'Golf', 'Lake']

export default function CommunityExplorer({
  pins,
  destinationSlug,
  calibrate,
}: {
  pins: CommunityPin[]
  destinationSlug: string
  calibrate: boolean
}) {
  const [active, setActive] = useState<CommunityPin | null>(null)
  const [filter, setFilter] = useState<string | null>(null)
  const mapSectionRef = useRef<HTMLDivElement>(null)

  const availableFilters = useMemo(
    () => VIEW_FILTERS.filter((f) => pins.some((p) => p.views.includes(f))),
    [pins]
  )
  const filteredPins = useMemo(
    () => (filter ? pins.filter((p) => p.views.includes(filter)) : pins),
    [pins, filter]
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
              a community without leaving the page.) */}
          {filteredPins.map((c) => (
            <Link
              key={c.slug}
              href={`/villas?destination=${destinationSlug}&community=${c.slug}`}
              className="comm-grid-card"
            >
              <p className="comm-grid-card-name">{c.name}</p>
              <div className="comm-tags">
                {[c.location, c.views, c.pool, c.bedrooms].filter(Boolean).map((t) => (
                  <span key={t} className="comm-tag">{t}</span>
                ))}
              </div>
              <p className="comm-grid-card-desc">{c.description}</p>
              <span className="legal-cta">
                View {c.count} {c.count === 1 ? 'villa' : 'villas'}
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
