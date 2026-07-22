'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PropertyCard from '@/components/PropertyCard'
import {
  Property, startingRate, totalGuests, hasPool,
  destinationOf, communityLabel, DEST_LABELS, COLL_NAMES, LOC_TYPE_LABELS, VIEW_LABELS,
} from '@/lib/utils'

const PAGE_SIZE = 9

interface FilterState {
  destination: string
  guests: { adults: number; children: number; infants: number }
  beds: number
  // Optional upper bound paired with `beds` — 0 means no cap. Only ever set
  // via URL (the "Intimate Properties" destination-page tile links with
  // both beds=2&bedsMax=4); picking a Bedrooms option manually always
  // clears it, since the dropdown itself has no UI for entering a max.
  bedsMax: number
  price: string
  pool: boolean
  // 4+ staff roles (housekeeper, chef, butler, concierge, etc.) — mirrors
  // the "Fully Staffed" tile on the redesigned destination pages.
  staff: boolean
  type: string
  locationType: string
  views: string[]
  collection: string
  community: string
  featured: boolean
  sort: string
}

const DEFAULT_FILTERS: FilterState = {
  destination: '',
  guests: { adults: 0, children: 0, infants: 0 },
  beds: 0,
  bedsMax: 0,
  price: '',
  pool: false,
  staff: false,
  type: '',
  locationType: '',
  views: [],
  collection: '',
  community: '',
  featured: false,
  sort: 'popular',
}

// Matches the threshold used by the destination page's "Fully Staffed" tile.
const FULLY_STAFFED_MIN = 4

const PRICE_RANGES: Record<string, [number, number]> = {
  '0-1000':    [0, 1000],
  '1001-2500': [1001, 2500],
  '2501-5000': [2501, 5000],
  '5001-8000': [5001, 8000],
  '8001+':     [8001, Infinity],
}

// Location-type drawer chip slug -> the actual viewsAndPool value it checks for.
// Only "golf-course" differs from its own slug (stored as "golf-course-view").
const LOC_TYPE_VIEW_MAP: Record<string, string> = {
  oceanfront: 'oceanfront',
  beachfront: 'beachfront',
  'golf-course': 'golf-course-view',
  hillside: 'hillside',
}

// A "hide when zero" formatter — the original site leaves the count badge
// blank rather than showing "0" next to a filter option.
const cnt = (n: number) => (n > 0 ? n : '')

type CountOverrides = Partial<{
  destination: string
  community: string
  beds: number
  bedsMax: number
  price: string
  type: string
  collection: string
  pool: boolean
  staff: boolean
  locationType: string
  views: string[]
  featured: boolean
}>

// Reads the filter-relevant fields straight off a URLSearchParams object —
// shared by the initial mount AND by the resync-on-navigation logic below,
// so both stay in lockstep with whatever the URL actually says.
function filtersFromParams(searchParams: URLSearchParams): FilterState {
  return {
    ...DEFAULT_FILTERS,
    destination: searchParams.get('destination') || '',
    collection: searchParams.get('collection') || '',
    price: searchParams.get('price') || '',
    beds: Number(searchParams.get('beds')) || 0,
    bedsMax: Number(searchParams.get('bedsMax')) || 0,
    pool: searchParams.get('pool') === '1',
    staff: searchParams.get('staff') === '1',
    featured: searchParams.get('featured') === '1',
    views: searchParams.getAll('view'),
    guests: {
      adults: Number(searchParams.get('adults')) || 0,
      children: Number(searchParams.get('children')) || 0,
      infants: Number(searchParams.get('infants')) || 0,
    },
  }
}

export default function VillasClient({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams()

  // Pick up filters passed via URL (from homepage collection cards / search bar
  // / header Properties dropdown), computed once up front — the URL is known
  // at render time, so no effect needed for the initial mount.
  const [filters, setFilters] = useState<FilterState>(() => filtersFromParams(searchParams))

  // This page doesn't unmount when you click another Properties link while
  // already on /villas — it's the same route, just a new query string — so
  // without this, the useState initializer above only ever ran once and the
  // filters would silently keep showing whatever was selected first. Adjusting
  // state during render (React's recommended pattern for "sync state to a
  // changed prop") re-reads the filters every time the URL search params
  // actually change, without disturbing in-page filter clicks, which never
  // touch the URL at all.
  const searchKey = searchParams.toString()
  const [syncedKey, setSyncedKey] = useState(searchKey)
  if (searchKey !== syncedKey) {
    setSyncedKey(searchKey)
    setFilters(filtersFromParams(searchParams))
  }

  const [openPanel, setOpenPanel] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [flVisible, setFlVisible] = useState(false)
  const [communityOpen, setCommunityOpen] = useState(false)
  const filterBarRef = useRef<HTMLDivElement>(null)

  // Floating "All Filters" button: shown once the filter bar scrolls out of view.
  useEffect(() => {
    const el = filterBarRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => setFlVisible(!entry.isIntersecting), {
      threshold: 0, rootMargin: '0px 0px 0px 0px',
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // .filter-bar's sticky top was a hardcoded 92px in CSS, matching the main
  // nav's usual height — but that height isn't actually constant (it grows
  // when the wishlist count is showing, wraps on some widths), so on any
  // screen where the real nav differed from 92px, this bar stuck either too
  // low (a gap of page content showing above it, under the nav) or partly
  // hidden under the nav. Same fix as AnchorNav.tsx: measure the real nav
  // height and keep this bar pinned to it exactly, on every screen.
  useEffect(() => {
    const navEl = document.querySelector('.nav') as HTMLElement | null
    const barEl = filterBarRef.current
    if (!navEl || !barEl) return
    const sync = () => { barEl.style.top = `${navEl.getBoundingClientRect().height}px` }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(navEl)
    return () => ro.disconnect()
  }, [])

  const toggle = (key: string) => setOpenPanel((p) => (p === key ? null : key))
  const closeAll = () => setOpenPanel(null)

  // Displayed/active-state guest count includes infants; the actual capacity
  // match does not, since infants don't count toward a property's guest capacity.
  const totalGuestCount = filters.guests.adults + filters.guests.children + filters.guests.infants
  const guestCapacityCount = filters.guests.adults + filters.guests.children

  // Core match test — takes the live filters, with optional per-category overrides.
  // Reused both for the actual result list and for the "faceted" counts shown next
  // to each filter option (how many properties WOULD match if that option were picked,
  // holding every other active filter constant) — mirrors the original site's countFor().
  const matchList = (overrides: CountOverrides) => {
    const destVal     = overrides.destination   !== undefined ? overrides.destination   : filters.destination
    const commVal     = overrides.community     !== undefined ? overrides.community     : filters.community
    const bedsVal     = overrides.beds          !== undefined ? overrides.beds          : filters.beds
    const bedsMaxVal  = overrides.bedsMax       !== undefined ? overrides.bedsMax       : filters.bedsMax
    const priceVal    = overrides.price         !== undefined ? overrides.price         : filters.price
    const typeVal     = overrides.type          !== undefined ? overrides.type          : filters.type
    const collVal     = overrides.collection    !== undefined ? overrides.collection    : filters.collection
    const poolVal     = overrides.pool          !== undefined ? overrides.pool          : filters.pool
    const staffVal    = overrides.staff         !== undefined ? overrides.staff         : filters.staff
    const locTypeVal  = overrides.locationType  !== undefined ? overrides.locationType  : filters.locationType
    const effViews    = overrides.views         !== undefined ? overrides.views         : filters.views
    const featuredVal = overrides.featured      !== undefined ? overrides.featured      : filters.featured
    const ltEffective = locTypeVal ? LOC_TYPE_VIEW_MAP[locTypeVal] : ''
    const range = priceVal ? PRICE_RANGES[priceVal] : null

    return properties.filter((p) => {
      const g = totalGuests(p)
      const r = startingRate(p) ?? 0
      return (
        (!destVal || destinationOf(p) === destVal) &&
        (!commVal || p.communityPuntaMita === commVal || p.communityPuntaDeMita === commVal) &&
        (guestCapacityCount === 0 || g >= guestCapacityCount) &&
        (bedsVal === 0 || p.bedrooms >= bedsVal) &&
        (bedsMaxVal === 0 || p.bedrooms <= bedsMaxVal) &&
        (!range || (r >= range[0] && r <= range[1])) &&
        (!typeVal || p.propertyType === typeVal) &&
        (effViews.length === 0 || effViews.some((v) => (p.viewsAndPool || []).includes(v))) &&
        (!collVal || (p.collection || []).includes(collVal)) &&
        (!poolVal || hasPool(p)) &&
        (!staffVal || (p.staffServices?.length || 0) >= FULLY_STAFFED_MIN) &&
        (!featuredVal || !!p.featured) &&
        (!ltEffective || (p.viewsAndPool || []).includes(ltEffective))
      )
    })
  }

  const countFor = (overrides: CountOverrides) => matchList(overrides).length

  const filtered = useMemo(() => {
    const list = matchList({})
    return list.sort((a, b) => {
      if (filters.sort === 'price-asc')  return (startingRate(a) ?? 0) - (startingRate(b) ?? 0)
      if (filters.sort === 'price-desc') return (startingRate(b) ?? 0) - (startingRate(a) ?? 0)
      if (filters.sort === 'beds-desc')  return b.bedrooms - a.bedrooms
      return 0
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, filters, guestCapacityCount])

  const visible = filtered.slice(0, visibleCount)

  // Communities grouped by destination, built from whatever properties actually exist
  const communitiesByDest = useMemo(() => {
    const map: Record<string, Set<string>> = { 'punta-mita': new Set(), 'punta-de-mita': new Set() }
    properties.forEach((p) => {
      if (p.communityPuntaMita) map['punta-mita'].add(p.communityPuntaMita)
      if (p.communityPuntaDeMita) map['punta-de-mita'].add(p.communityPuntaDeMita)
    })
    return map
  }, [properties])

  const guestStep = (type: 'adults' | 'children' | 'infants', dir: 1 | -1) => {
    setFilters((f) => ({
      ...f,
      guests: { ...f.guests, [type]: Math.max(0, f.guests[type] + dir) },
    }))
  }

  const toggleView = (v: string) => {
    setFilters((f) => ({
      ...f,
      views: f.views.includes(v) ? f.views.filter((x) => x !== v) : [...f.views, v],
    }))
  }

  const clearAll = () => { setFilters(DEFAULT_FILTERS); closeAll(); setVisibleCount(PAGE_SIZE) }

  const hasActiveFilters =
    filters.destination || totalGuestCount > 0 || filters.beds || filters.price || filters.pool || filters.staff ||
    filters.type || filters.locationType || filters.views.length > 0 || filters.collection || filters.community ||
    filters.featured

  const activeChips: { label: string; clear: () => void }[] = []
  if (filters.destination) activeChips.push({ label: DEST_LABELS[filters.destination], clear: () => setFilters((f) => ({ ...f, destination: '' })) })
  if (totalGuestCount > 0) activeChips.push({ label: `${totalGuestCount} guests`, clear: () => setFilters((f) => ({ ...f, guests: DEFAULT_FILTERS.guests })) })
  if (filters.beds) activeChips.push({
    label: filters.bedsMax ? `${filters.beds}-${filters.bedsMax} bedrooms` : `${filters.beds}+ bedrooms`,
    clear: () => setFilters((f) => ({ ...f, beds: 0, bedsMax: 0 })),
  })
  if (filters.price) activeChips.push({ label: 'Price range', clear: () => setFilters((f) => ({ ...f, price: '' })) })
  if (filters.pool) activeChips.push({ label: 'Private pool', clear: () => setFilters((f) => ({ ...f, pool: false })) })
  if (filters.staff) activeChips.push({ label: 'Fully staffed', clear: () => setFilters((f) => ({ ...f, staff: false })) })
  if (filters.featured) activeChips.push({ label: 'Favorites', clear: () => setFilters((f) => ({ ...f, featured: false })) })
  const typeLabel = filters.type === 'villa' ? 'Villa' : filters.type === 'condo' ? 'Condo' : 'Estate'
  if (filters.type) activeChips.push({ label: typeLabel, clear: () => setFilters((f) => ({ ...f, type: '' })) })
  if (filters.locationType) activeChips.push({ label: LOC_TYPE_LABELS[filters.locationType], clear: () => setFilters((f) => ({ ...f, locationType: '' })) })
  filters.views.forEach((v) => activeChips.push({ label: VIEW_LABELS[v] || v, clear: () => toggleView(v) }))
  if (filters.collection) activeChips.push({ label: COLL_NAMES[filters.collection], clear: () => setFilters((f) => ({ ...f, collection: '' })) })
  if (filters.community) activeChips.push({ label: communityLabelFromSlug(filters.community), clear: () => setFilters((f) => ({ ...f, community: '' })) })

  // Count of active filters that live only in the "More Filters" drawer
  // (mirrors the original site's mf-badge / fl-badge count formula).
  const drawerFilterCount =
    (filters.community ? 1 : 0) + (filters.type ? 1 : 0) + filters.views.length +
    (filters.collection ? 1 : 0) + (filters.locationType ? 1 : 0)

  function communityLabelFromSlug(slug: string) {
    const found = properties.find((p) => p.communityPuntaMita === slug || p.communityPuntaDeMita === slug)
    return found ? communityLabel(found) : slug
  }

  return (
    <>
      {/* FILTER BAR */}
      <div className="filter-bar" ref={filterBarRef} onClick={(e) => { if (e.target === e.currentTarget) closeAll() }}>
        <div className="fb-inner">

          {/* Destination */}
          <div className={`ff ff-destination${filters.destination ? ' is-active' : ''}${openPanel === 'destination' ? ' is-open' : ''}`}>
            <button className="ff-trigger" onClick={() => toggle('destination')}>
              <span className="ff-val">{filters.destination ? DEST_LABELS[filters.destination] : 'Destination'}</span>
              <span className="ff-dot" />
              <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="ff-panel">
              <div className={`ff-opt${!filters.destination ? ' is-sel' : ''}`} onClick={() => { setFilters((f) => ({ ...f, destination: '' })); closeAll() }}>
                All destinations <span className="opt-count">{cnt(countFor({ destination: '' }))}</span>
              </div>
              <div className={`ff-opt${filters.destination === 'punta-mita' ? ' is-sel' : ''}`} onClick={() => { setFilters((f) => ({ ...f, destination: 'punta-mita' })); closeAll() }}>
                Punta Mita <span className="opt-count">{cnt(countFor({ destination: 'punta-mita' }))}</span>
              </div>
              <div className={`ff-opt${filters.destination === 'punta-de-mita' ? ' is-sel' : ''}`} onClick={() => { setFilters((f) => ({ ...f, destination: 'punta-de-mita' })); closeAll() }}>
                Punta de Mita <span className="opt-count">{cnt(countFor({ destination: 'punta-de-mita' }))}</span>
              </div>
              <div className="ff-opt ff-opt-soon">Puerto Vallarta <span className="ff-soon-label">Coming soon</span></div>
            </div>
          </div>

          <div className="fb-sep" />

          {/* Guests stepper */}
          <div className={`ff ff-guests${totalGuestCount ? ' is-active' : ''}${openPanel === 'guests' ? ' is-open' : ''}`}>
            <button className="ff-trigger" onClick={() => toggle('guests')}>
              <span className="ff-val">{totalGuestCount ? `${totalGuestCount} guests` : 'Guests'}</span>
              <span className="ff-dot" />
              <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="ff-panel">
              {([['adults', 'Adults', 'Ages 13+'], ['children', 'Children', 'Ages 2–13'], ['infants', 'Infants', 'Ages 0–1']] as const).map(([key, label, age]) => (
                <div className="g-row" key={key}>
                  <div className="g-info">
                    <div className="g-type">{label}</div>
                    <div className="g-age">{age}</div>
                  </div>
                  <div className="g-counter">
                    <button className="ctr-btn" disabled={filters.guests[key] === 0} onClick={() => guestStep(key, -1)}>−</button>
                    <span className="ctr-val">{filters.guests[key]}</span>
                    <button className="ctr-btn" onClick={() => guestStep(key, 1)}>+</button>
                  </div>
                </div>
              ))}
              <div className="g-done-row">
                <button className="g-clear-btn" onClick={() => setFilters((f) => ({ ...f, guests: DEFAULT_FILTERS.guests }))}>Clear</button>
                <button className="g-done-btn" onClick={closeAll}>Done</button>
              </div>
            </div>
          </div>

          <div className="fb-sep" />

          {/* Bedrooms */}
          <div className={`ff ff-beds${filters.beds ? ' is-active' : ''}${openPanel === 'beds' ? ' is-open' : ''}`}>
            <button className="ff-trigger" onClick={() => toggle('beds')}>
              <span className="ff-val">
                {filters.beds
                  ? (filters.bedsMax ? `${filters.beds}-${filters.bedsMax} bedrooms` : `${filters.beds}+ bedrooms`)
                  : 'Bedrooms'}
              </span>
              <span className="ff-dot" />
              <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="ff-panel">
              {[0, 1, 2, 3, 4, 5, 6].map((v) => (
                <div
                  key={v}
                  className={`ff-opt${filters.beds === v && !filters.bedsMax ? ' is-sel' : ''}`}
                  onClick={() => { setFilters((f) => ({ ...f, beds: v, bedsMax: 0 })); closeAll() }}
                >
                  {v === 0 ? 'Any bedrooms' : `${v}+ bedrooms`}
                </div>
              ))}
            </div>
          </div>

          <div className="fb-sep" />

          {/* Nightly rate */}
          <div className={`ff ff-price${filters.price ? ' is-active' : ''}${openPanel === 'price' ? ' is-open' : ''}`}>
            <button className="ff-trigger" onClick={() => toggle('price')}>
              <span className="ff-val">
                {{ '': 'Nightly Rate', '0-1000': 'Up to $1,000', '1001-2500': '$1,001 – $2,500', '2501-5000': '$2,501 – $5,000', '5001-8000': '$5,001 – $8,000', '8001+': '$8,001+' }[filters.price]}
              </span>
              <span className="ff-dot" />
              <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="ff-panel">
              {[
                ['', 'Any price'],
                ['0-1000', 'Up to $1,000 / night'],
                ['1001-2500', '$1,001 – $2,500 / night'],
                ['2501-5000', '$2,501 – $5,000 / night'],
                ['5001-8000', '$5,001 – $8,000 / night'],
                ['8001+', '$8,001+ / night'],
              ].map(([v, l]) => (
                <div key={v} className={`ff-opt${filters.price === v ? ' is-sel' : ''}`} onClick={() => { setFilters((f) => ({ ...f, price: v })); closeAll() }}>{l}</div>
              ))}
            </div>
          </div>

          <div className="fb-sep" />

          {/* Pool chip */}
          <button className={`ff-chip${filters.pool ? ' is-active' : ''}`} onClick={() => setFilters((f) => ({ ...f, pool: !f.pool }))}>
            <svg viewBox="0 0 24 24"><path d="M4 12c1.5-2 3-3 5-1s3.5 3 5 1 3-3 5-1M4 18c1.5-2 3-3 5-1s3.5 3 5 1 3-3 5-1M12 4v4M9 5l3-1 3 1"/></svg>
            Pool
          </button>

          {/* Staffed chip — 4+ staff roles, same threshold as the
              destination page's "Fully Staffed" tile */}
          <button className={`ff-chip${filters.staff ? ' is-active' : ''}`} onClick={() => setFilters((f) => ({ ...f, staff: !f.staff }))}>
            <svg viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="8" r="2.5"/><path d="M3 20v-1a6 6 0 0112 0v1M14 20v-1a4.5 4.5 0 016.5-4"/></svg>
            Staffed
          </button>

          <div className="fb-sep" />

          {/* Guests' Favorites (featured) chip — permanently gold-tinted (unlike
              Pool's plain grey) since these are the highest-commission
              properties and deserve to read as a curated pick, not a generic
              amenity checkbox. */}
          <button className={`ff-chip ff-chip-favorite${filters.featured ? ' is-active' : ''}`} onClick={() => setFilters((f) => ({ ...f, featured: !f.featured }))}>
            <svg viewBox="0 0 24 24" strokeLinejoin="round"><polygon points="12 3 14.8 8.7 21 9.6 16.5 13.9 17.6 20 12 17 6.4 20 7.5 13.9 3 9.6 9.2 8.7"/></svg>
            Favorites
          </button>

          {/* More Filters */}
          <button className={`mf-btn${drawerFilterCount > 0 ? ' is-active' : ''}`} onClick={() => setDrawerOpen(true)}>
            <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
            All Filters
            {drawerFilterCount > 0 && <span className="mf-badge">{drawerFilterCount}</span>}
          </button>

          <div className="fb-sep" />

          {/* Sort */}
          <div className={`ff ff-sort${openPanel === 'sort' ? ' is-open' : ''}`}>
            <button className="ff-trigger" onClick={() => toggle('sort')}>
              <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="14" y2="12"/><line x1="3" y1="18" x2="8" y2="18"/></svg>
              <span className="ff-val">
                {{ popular: 'Popular', 'price-asc': 'Price ↑', 'price-desc': 'Price ↓', 'beds-desc': 'Bedrooms' }[filters.sort]}
              </span>
              <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div className="ff-panel">
              {[['popular', 'Most popular'], ['price-asc', 'Price: Low to high'], ['price-desc', 'Price: High to low'], ['beds-desc', 'Most bedrooms']].map(([v, l]) => (
                <div key={v} className={`ff-opt${filters.sort === v ? ' is-sel' : ''}`} onClick={() => { setFilters((f) => ({ ...f, sort: v })); closeAll() }}>{l}</div>
              ))}
            </div>
          </div>

          {hasActiveFilters && (
            <button className="fb-clear visible" onClick={clearAll}>
              <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* MORE FILTERS DRAWER */}
      <div className={`mf-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`mf-drawer${drawerOpen ? ' open' : ''}`}>
        <div className="mf-header">
          <span className="mf-title">Filters</span>
          <button className="mf-close" onClick={() => setDrawerOpen(false)} aria-label="Close filters">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="mf-body">
          <div className="mf-section">
            <div className="mf-section-title">Property Type</div>
            <div className="mf-type-chips">
              {[['', 'All'], ['villa', 'Villa'], ['condo', 'Condo'], ['estate', 'Estate']].map(([v, l]) => (
                <button key={v} className={`mf-type-chip${filters.type === v ? ' is-sel' : ''}`} onClick={() => setFilters((f) => ({ ...f, type: v }))}>
                  {l} <span className="opt-count">{cnt(countFor({ type: v }))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mf-section">
            <div className="mf-section-title">Location</div>
            <div className="mf-coll-chips">
              {[['', 'All'], ['oceanfront', 'Oceanfront'], ['beachfront', 'Beachfront'], ['golf-course', 'Golf Course'], ['hillside', 'Hillside']].map(([v, l]) => (
                <button key={v} className={`mf-coll-chip${filters.locationType === v ? ' is-sel' : ''}`} onClick={() => setFilters((f) => ({ ...f, locationType: v }))}>
                  {l} <span className="opt-count">{cnt(countFor({ locationType: v }))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mf-section">
            <div className="mf-section-title">Views</div>
            {[['ocean-view', 'Ocean View'], ['golf-course-view', 'Golf Course View']].map(([v, l]) => (
              <label className="mf-check" key={v}>
                <input type="checkbox" checked={filters.views.includes(v)} onChange={() => toggleView(v)} />
                <span>{l}</span>{' '}
                <span className="opt-count">
                  {cnt(countFor({ views: Array.from(new Set([...filters.views, v])) }))}
                </span>
              </label>
            ))}
          </div>

          <div className="mf-section">
            <div className="mf-section-title">Collections</div>
            <div className="mf-coll-chips">
              {[['', 'All'], ...Object.entries(COLL_NAMES)].map(([v, l]) => (
                <button key={v} className={`mf-coll-chip${filters.collection === v ? ' is-sel' : ''}`} onClick={() => setFilters((f) => ({ ...f, collection: v }))}>
                  {l} <span className="opt-count">{cnt(countFor({ collection: v }))}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mf-section">
            <div className="mf-section-title">Community</div>
            <div className={`mf-community-select${communityOpen ? ' is-open' : ''}`}>
              <button
                type="button"
                className="mf-comm-current"
                onClick={() => setCommunityOpen((o) => !o)}
                aria-expanded={communityOpen}
              >
                <span>{filters.community ? communityLabelFromSlug(filters.community) : 'Any community'}</span>
                <span className="mf-comm-current-right">
                  <span className="opt-count">{cnt(countFor({ community: filters.community }))}</span>
                  <svg className="mf-comm-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </span>
              </button>
              {communityOpen && (
                <div className="mf-community-list">
                  <div
                    className={`mf-comm-opt${!filters.community ? ' is-sel' : ''}`}
                    onClick={() => { setFilters((f) => ({ ...f, community: '' })); setCommunityOpen(false) }}
                  >
                    Any community <span className="opt-count">{cnt(countFor({ community: '' }))}</span>
                  </div>
                  {(['punta-mita', 'punta-de-mita'] as const).map((destKey) => {
                    const comms = Array.from(communitiesByDest[destKey]).sort((a, b) =>
                      communityLabelFromSlug(a).localeCompare(communityLabelFromSlug(b))
                    )
                    if (comms.length === 0) return null
                    // Original hides the non-matching destination group once a destination filter is active.
                    if (filters.destination && filters.destination !== destKey) return null
                    return (
                      <div className="mf-comm-group" key={destKey}>
                        <div className="mf-comm-group-hd">{DEST_LABELS[destKey]}</div>
                        {comms.map((c) => (
                          <div
                            key={c}
                            className={`mf-comm-opt${filters.community === c ? ' is-sel' : ''}`}
                            onClick={() => {
                              setFilters((f) => ({ ...f, community: f.community === c ? '' : c }))
                              setCommunityOpen(false)
                            }}
                          >
                            {communityLabelFromSlug(c)}{' '}
                            <span className="opt-count">
                              {cnt(countFor({ community: c }))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mf-footer">
          <button className="mf-clear-btn" onClick={() => setFilters((f) => ({ ...f, type: '', locationType: '', views: [], collection: '', community: '' }))}>Clear</button>
          <button className="mf-apply-btn" onClick={() => setDrawerOpen(false)}>Show results</button>
        </div>
      </div>

      {/* RESULTS BAR */}
      <div className="results-bar">
        <span className="results-count">
          Showing <strong>{filtered.length}</strong> properties
        </span>
        {activeChips.length > 0 && (
          <div className="active-chips">
            {activeChips.map((chip, i) => (
              <button key={i} className="active-chip" onClick={chip.clear}>
                {chip.label}
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GRID */}
      <section className="properties-section">
        {filtered.length === 0 ? (
          <div className="no-results visible">
            <div className="no-results-icon">🔍</div>
            <p className="no-results-title">No properties match your filters</p>
            <p className="no-results-sub">Try adjusting your search, or let us help you find the perfect villa.</p>
            <div className="no-results-actions">
              <button className="nr-btn-clear" onClick={clearAll}>Clear all filters</button>
              <a className="nr-btn-wa" href="https://wa.me/523313619889?text=Hi%2C%20I%27m%20looking%20for%20a%20rental%20in%20Punta%20Mita%20and%20need%20some%20help" target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat with us
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="prop-grid">
              {visible.map((p) => <PropertyCard key={p._id} property={p} activeCollection={filters.collection || undefined} />)}
            </div>
            {visibleCount < filtered.length && (
              <div className="load-more-wrap" style={{ display: 'block' }}>
                <button className="load-more-btn" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                  Show more properties
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* HELP CTA */}
      <section className="help-cta">
        <div className="help-cta-text">
          <h2>Can&rsquo;t find exactly what you&rsquo;re looking for?</h2>
          <p>We manage more properties than are listed here, and we know every home personally. Tell us what you need and we&rsquo;ll match you with the right rental.</p>
        </div>
        <div className="help-cta-btns">
          <a className="help-btn help-btn-primary" href="https://wa.me/523313619889?text=Hi%2C%20I%27m%20looking%20for%20a%20rental%20in%20Punta%20Mita%20and%20need%20some%20help" target="_blank" rel="noopener">WhatsApp us</a>
          <a className="help-btn help-btn-secondary" href="mailto:rentals@mexicanreserve.com">Email us</a>
        </div>
      </section>

      {/* FLOATING FILTERS BUTTON */}
      <button className={`fl-filters-btn${flVisible ? ' visible' : ''}`} onClick={() => setDrawerOpen(true)}>
        <svg viewBox="0 0 24 24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
        All Filters
        {drawerFilterCount > 0 && <span className="fl-badge">{drawerFilterCount}</span>}
      </button>
    </>
  )
}
