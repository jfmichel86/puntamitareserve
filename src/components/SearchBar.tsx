'use client'

import { useState } from 'react'

type Field = 'dates' | 'guests' | 'rate' | null
type DateMode = 'calendar' | 'flexible'

const PRICE_OPTS: [string, string][] = [
  ['0-1000', 'Up to $1,000 USD'],
  ['1001-2500', '$1,001 – $2,500 USD'],
  ['2501-5000', '$2,501 – $5,000 USD'],
  ['5001-8000', '$5,001 – $8,000 USD'],
  ['8001+', '$8,001+ USD'],
]

const FLEX_OPTS: [string, string][] = [
  ['exact', 'Exact dates'],
  ['1', '±1 day'],
  ['2', '±2 days'],
  ['3', '±3 days'],
  ['7', '±7 days'],
]

const DURATIONS = ['3 nights', '1 week', '2 weeks', '1 month']
const FLEX_TOTAL_MONTHS = 12
const FLEX_PER_PAGE = 6
const FLEX_MAX_PAGE = Math.ceil(FLEX_TOTAL_MONTHS / FLEX_PER_PAGE) - 1

function fmt(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function fmtShort(ds: string) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function SearchBar() {
  // Mobile only: the full 3-field bar is presented as a single compact
  // trigger pill over the hero photo, and only expands into a full-screen
  // panel once tapped — desktop always shows the full inline bar and never
  // touches this state (see .search-mobile-trigger / .search-bar--open in
  // globals.css, gated entirely behind the @media (max-width:720px) block).
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => { setMobileOpen(false); setOpen(null) }

  const [open, setOpen] = useState<Field>(null)
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0 })
  const [price, setPrice] = useState<string>('')
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  const [mode, setMode] = useState<DateMode>('calendar')
  const [flexibility, setFlexibility] = useState<string>('exact')
  const [flexDuration, setFlexDuration] = useState<string | null>(null)
  const [flexMonths, setFlexMonths] = useState<Set<string>>(new Set())
  const [flexPage, setFlexPage] = useState(0)

  const toggle = (f: Field) => setOpen((cur) => (cur === f ? null : f))

  const toggleFlexMonth = (key: string) => {
    setFlexMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const clearDates = () => {
    setCheckIn(null); setCheckOut(null)
    setFlexDuration(null); setFlexMonths(new Set()); setFlexPage(0)
  }

  const guestsLabel = () => {
    const parts: string[] = []
    if (guests.adults) parts.push(`${guests.adults} adult${guests.adults > 1 ? 's' : ''}`)
    if (guests.children) parts.push(`${guests.children} child${guests.children > 1 ? 'ren' : ''}`)
    if (guests.infants) parts.push(`${guests.infants} infant${guests.infants > 1 ? 's' : ''}`)
    return parts.join('  ')
  }

  const step = (type: 'adults' | 'children' | 'infants', d: number) => {
    setGuests((g) => ({ ...g, [type]: Math.max(0, g[type] + d) }))
  }

  const dayClick = (ds: string) => {
    if (!checkIn || checkOut || ds < checkIn) {
      setCheckIn(ds); setCheckOut(null)
    } else if (ds === checkIn) {
      setCheckIn(null); setCheckOut(null)
    } else {
      setCheckOut(ds)
    }
  }

  const navMonth = (dir: 1 | -1) => {
    let m = viewMonth + dir, y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewMonth(m); setViewYear(y)
  }

  const renderMonth = (y: number, m: number, showPrev: boolean, showNext: boolean) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const firstDay = new Date(y, m, 1)
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const startDow = firstDay.getDay()
    const monthLabel = firstDay.toLocaleString('en-US', { month: 'long' }) + ' ' + y
    const cells: React.ReactNode[] = []
    for (let i = 0; i < startDow; i++) cells.push(<div key={`e${i}`} className="dp-day dp-day-empty" />)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d); date.setHours(0, 0, 0, 0)
      const ds = fmt(y, m, d)
      const isPast = date < today
      const isToday = date.getTime() === today.getTime()
      const isStart = checkIn === ds
      const isEnd = checkOut === ds
      const inRange = !!(checkIn && checkOut && ds > checkIn && ds < checkOut)
      let cls = 'dp-day'
      if (isPast) cls += ' dp-day-past'
      if (isToday && !isStart && !isEnd) cls += ' dp-day-today'
      if (isStart) cls += ' dp-day-start'
      if (isEnd) cls += ' dp-day-end'
      if (inRange) cls += ' dp-day-in-range'
      cells.push(
        <div key={d} className={cls} onClick={!isPast ? () => dayClick(ds) : undefined}>{d}</div>
      )
    }
    return (
      <div>
        <div className="dp-month-header">
          {showPrev ? (
            <button className="dp-nav-btn" type="button" onClick={() => navMonth(-1)}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          ) : <div style={{ width: 28 }} />}
          <div className="dp-month-title">{monthLabel}</div>
          {showNext ? (
            <button className="dp-nav-btn" type="button" onClick={() => navMonth(1)}>
              <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18"/></svg>
            </button>
          ) : <div style={{ width: 28 }} />}
        </div>
        <div className="dp-day-names">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map((n) => <div className="dp-day-name" key={n}>{n}</div>)}
        </div>
        <div className="dp-days-grid">{cells}</div>
      </div>
    )
  }

  const nextMonth = viewMonth === 11 ? { y: viewYear + 1, m: 0 } : { y: viewYear, m: viewMonth + 1 }

  const renderFlexMonths = () => {
    const today = new Date()
    const start = flexPage * FLEX_PER_PAGE
    const tiles: React.ReactNode[] = []
    for (let i = start; i < Math.min(start + FLEX_PER_PAGE, FLEX_TOTAL_MONTHS); i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const month = d.toLocaleString('en-US', { month: 'long' })
      const year = d.getFullYear()
      tiles.push(
        <button
          key={key}
          type="button"
          className={`dp-month-tile${flexMonths.has(key) ? ' dp-active' : ''}`}
          onClick={() => toggleFlexMonth(key)}
        >
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <span>{month}</span>
            <span style={{ fontSize: 10, opacity: 0.6 }}>{year}</span>
          </span>
        </button>
      )
    }
    return tiles
  }

  const datesLabel = mode === 'calendar'
    ? (checkIn && checkOut ? `${fmtShort(checkIn)} – ${fmtShort(checkOut)}` : '')
    : (flexDuration && flexMonths.size > 0
        ? `${flexDuration} · ${[...flexMonths].sort().map((k) => {
            const [y, m] = k.split('-').map(Number)
            return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'short' })
          }).join(', ')}`
        : '')

  const priceLabel = price ? PRICE_OPTS.find(([v]) => v === price)?.[1] : ''

  // Everything a guest actually picks in this bar should carry through to
  // the results — price and guest counts both map directly to filters that
  // already exist on the villas listing page. (Dates don't yet: there's no
  // per-property availability calendar in Sanity to filter against, so a
  // date range here can't honestly narrow the results — it's left for a
  // future step once real availability data exists.)
  const searchHref = () => {
    const params = new URLSearchParams()
    if (price) params.set('price', price)
    if (guests.adults) params.set('adults', String(guests.adults))
    if (guests.children) params.set('children', String(guests.children))
    if (guests.infants) params.set('infants', String(guests.infants))
    const qs = params.toString()
    return `/villas${qs ? `?${qs}` : ''}`
  }

  return (
    <>
      {/* Mobile-only compact trigger — replaces the full bar over the hero
          photo on phones; expands .search-bar into a full-screen panel.
          Hidden entirely on desktop via CSS. */}
      <button
        type="button"
        className="search-mobile-trigger"
        onClick={() => setMobileOpen(true)}
      >
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Reserve Your Escape
      </button>

      <div
        className={`search-bar${mobileOpen ? ' search-bar--open' : ''}`}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(null) }}
      >
        <button
          type="button"
          className="search-mobile-close"
          onClick={closeMobile}
          aria-label="Close search"
        >
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        {/* Dates */}
      <div className={`sf${open === 'dates' ? ' is-open' : ''}`} id="sf-dates">
        <button className="sf-trigger" type="button" onClick={() => toggle('dates')}>
          <div className="sf-inner">
            {!datesLabel && <span className="sf-label">Check in &nbsp;→&nbsp; Check out</span>}
            <span className="sf-val">{datesLabel}</span>
          </div>
          <svg className="sf-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>
      {open === 'dates' && (
          <div className="sf-panel dates-panel">
            <div className="dp-tabs">
              <div className="dp-toggle-group">
                <button className={`dp-tab${mode === 'calendar' ? ' dp-active' : ''}`} type="button" onClick={() => setMode('calendar')}>Calendar</button>
                <button className={`dp-tab${mode === 'flexible' ? ' dp-active' : ''}`} type="button" onClick={() => setMode('flexible')}>Flexible</button>
              </div>
            </div>

            {mode === 'calendar' && (
              <div className="dp-cal-body dp-active">
                <div className="dp-months-row">
                  {renderMonth(viewYear, viewMonth, true, false)}
                  {renderMonth(nextMonth.y, nextMonth.m, false, true)}
                </div>
                <div className="dp-flex-row">
                  {FLEX_OPTS.map(([v, l]) => (
                    <button
                      key={v}
                      type="button"
                      className={`dp-flex-pill${flexibility === v ? ' dp-active' : ''}`}
                      onClick={() => setFlexibility(v)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="dp-panel-footer">
                  <button className="dp-clear-btn" type="button" onClick={clearDates}>Clear dates</button>
                  <button className="dp-done-btn" type="button" onClick={() => setOpen(null)}>Done</button>
                </div>
              </div>
            )}

            {mode === 'flexible' && (
              <div className="dp-flex-body dp-active">
                <p className="dp-flex-q">How long do you want to stay?</p>
                <div className="dp-pills">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      className={`dp-pill${flexDuration === dur ? ' dp-active' : ''}`}
                      onClick={() => setFlexDuration(dur)}
                    >
                      {dur}
                    </button>
                  ))}
                </div>
                <p className="dp-flex-q">When do you want to come?</p>
                <div className="dp-month-nav-row">
                  <button
                    className={`dp-month-nav-btn${flexPage === 0 ? ' dp-hidden' : ''}`}
                    type="button"
                    onClick={() => setFlexPage((p) => Math.max(0, p - 1))}
                  >
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <div className="dp-month-tiles">{renderFlexMonths()}</div>
                  <button
                    className={`dp-month-nav-btn${flexPage >= FLEX_MAX_PAGE ? ' dp-hidden' : ''}`}
                    type="button"
                    onClick={() => setFlexPage((p) => Math.min(FLEX_MAX_PAGE, p + 1))}
                  >
                    <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
                <div className="dp-panel-footer">
                  <button className="dp-clear-btn" type="button" onClick={clearDates}>Clear</button>
                  <button className="dp-done-btn" type="button" onClick={() => setOpen(null)}>Done</button>
                </div>
              </div>
            )}
          </div>
        )}

      {/* Guests */}
      <div className={`sf${open === 'guests' ? ' is-open' : ''}`} id="sf-guests">
        <button className="sf-trigger" type="button" onClick={() => toggle('guests')}>
          <div className="sf-inner">
            {!guestsLabel() && <span className="sf-label">Guests</span>}
            <span className="sf-val">{guestsLabel()}</span>
          </div>
          <svg className="sf-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {open === 'guests' && (
          <div className="sf-panel guests-panel">
            {([['adults', 'Adults', 'Ages 13+'], ['children', 'Children', 'Ages 2–13'], ['infants', 'Infants', 'Ages 0–1']] as const).map(([key, label, age]) => (
              <div className="g-row" key={key}>
                <div className="g-info">
                  <div className="g-type">{label}</div>
                  <div className="g-age">{age}</div>
                </div>
                <div className="g-counter">
                  <button className="ctr-btn" disabled={guests[key] === 0} onClick={() => step(key, -1)}>−</button>
                  <span className="ctr-val">{guests[key]}</span>
                  <button className="ctr-btn" onClick={() => step(key, 1)}>+</button>
                </div>
              </div>
            ))}
            <div className="g-done-row">
              <button className="g-done-btn" type="button" onClick={() => setOpen(null)}>Done</button>
            </div>
          </div>
        )}
      </div>

      {/* Nightly Rate */}
      <div className={`sf${open === 'rate' ? ' is-open' : ''}`} id="sf-rate">
        <button className="sf-trigger" type="button" onClick={() => toggle('rate')}>
          <div className="sf-inner">
            {!priceLabel && <span className="sf-label">Nightly Rate</span>}
            <span className="sf-val">{priceLabel}</span>
          </div>
          <svg className="sf-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {open === 'rate' && (
          <div className="sf-panel rate-panel">
            <div className="rate-opts">
              {PRICE_OPTS.map(([v, l]) => (
                <div key={v} className="sf-opt" onClick={() => { setPrice(v === price ? '' : v); setOpen(null) }}>
                  {l}<span className={`sel-dot${price === v ? '' : ''}`} style={{ opacity: price === v ? 1 : 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <a
        className="search-btn"
        href={searchHref()}
        onClick={closeMobile}
      >
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Search
      </a>
      </div>
    </>
  )
}
