'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Activity,
  DEST_LABELS,
  LOCATION_LABEL_BY_SLUG,
  EXPERIENCE_CATEGORIES,
} from '@/lib/utils'
import ExperienceCard from '@/components/ExperienceCard'

// Reverse of LOCATION_LABEL_BY_SLUG — turns the raw schema value stored on
// each experience's `destinations` array back into its display label, for
// the "Available in ..." line shown on a card when no single destination
// filter is active (so a visitor browsing "All Destinations" still knows
// where a given experience applies).
const DEST_LABEL_BY_LOCATION_VALUE: Record<string, string> = Object.fromEntries(
  Object.entries(LOCATION_LABEL_BY_SLUG).map(([slug, value]) => [value, DEST_LABELS[slug]])
)

function destinationSlugsFromParams(searchParams: URLSearchParams): string {
  const raw = searchParams.get('destination') || ''
  return raw in DEST_LABELS ? raw : 'all'
}

export default function ExperiencesClient({ experiences }: { experiences: Activity[] }) {
  const searchParams = useSearchParams()

  // Same "sync state to a changed prop during render" pattern used on the
  // villas listing page — a visitor can land on /experiences?destination=X
  // from one destination page, then click through to another destination's
  // teaser and back, all without this route ever unmounting.
  const [destFilter, setDestFilter] = useState(() => destinationSlugsFromParams(searchParams))
  const [catFilter, setCatFilter] = useState('all')
  const searchKey = searchParams.toString()
  const [syncedKey, setSyncedKey] = useState(searchKey)
  if (searchKey !== syncedKey) {
    setSyncedKey(searchKey)
    setDestFilter(destinationSlugsFromParams(searchParams))
  }

  const filtered = experiences.filter((e) => {
    const destOk = destFilter === 'all' || (e.destinations || []).includes(LOCATION_LABEL_BY_SLUG[destFilter])
    const catOk = catFilter === 'all' || e.category === catFilter
    return destOk && catOk
  })

  const clearFilters = () => {
    setDestFilter('all')
    setCatFilter('all')
  }

  return (
    <div className="exp-catalog">
      <div className="exp-filters">
        <div className="exp-filter-group">
          <span className="exp-filter-label">Destination</span>
          <div className="exp-chip-row">
            <button
              className={`exp-chip${destFilter === 'all' ? ' is-active' : ''}`}
              onClick={() => setDestFilter('all')}
            >
              All Destinations
            </button>
            {Object.entries(DEST_LABELS).map(([slug, label]) => (
              <button
                key={slug}
                className={`exp-chip${destFilter === slug ? ' is-active' : ''}`}
                onClick={() => setDestFilter(slug)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="exp-filter-group">
          <span className="exp-filter-label">Category</span>
          <div className="exp-chip-row">
            <button
              className={`exp-chip${catFilter === 'all' ? ' is-active' : ''}`}
              onClick={() => setCatFilter('all')}
            >
              All Categories
            </button>
            {EXPERIENCE_CATEGORIES.map(([value, label]) => (
              <button
                key={value}
                className={`exp-chip${catFilter === value ? ' is-active' : ''}`}
                onClick={() => setCatFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="exp-results-count">
        <strong>{filtered.length}</strong> experience{filtered.length === 1 ? '' : 's'}
      </p>

      {filtered.length > 0 ? (
        <div className="exp-card-grid">
          {filtered.map((e) => (
            <ExperienceCard
              key={e._id}
              experience={e}
              activeDestination={destFilter === 'all' ? undefined : LOCATION_LABEL_BY_SLUG[destFilter]}
              destinationLabels={
                destFilter === 'all'
                  ? (e.destinations || []).map((d) => DEST_LABEL_BY_LOCATION_VALUE[d]).filter(Boolean)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="exp-empty">
          <p>No experiences match these filters yet.</p>
          <button className="exp-clear-btn" onClick={clearFilters}>Clear filters</button>
        </div>
      )}
    </div>
  )
}
