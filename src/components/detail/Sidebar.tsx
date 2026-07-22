'use client'

import { useEffect, useRef, useState } from 'react'
import { formatPrice } from '@/lib/utils'

const WA_NUMBER = '523313619889'
const CONTACT_EMAIL = 'rentals@mexicanreserve.com'

type PanelOpen = 'dates' | 'guests' | null
type DateMode = 'calendar' | 'flexible'

// Same options/consts as the homepage search bar (SearchBar.tsx) and the
// Contact page (ContactForm.tsx) — this widget now mirrors those two
// exactly instead of its own simplified version, so guests get one
// consistent booking experience site-wide.
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
function fmtLong(ds: string) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function Sidebar({
  propertyTitle,
  minRate,
  minStayNights,
  showScarcity,
}: {
  propertyTitle: string
  minRate: number | null
  minStayNights: number
  showScarcity: boolean
}) {
  const [openPanel, setOpenPanel] = useState<PanelOpen>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Dates
  const [mode, setMode] = useState<DateMode>('calendar')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [flexibility, setFlexibility] = useState('exact')
  const [flexDuration, setFlexDuration] = useState<string | null>(null)
  const [flexMonths, setFlexMonths] = useState<Set<string>>(new Set())
  const [flexPage, setFlexPage] = useState(0)

  // Guests
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0 })

  // Cheap to recompute per render — avoids a state+effect just for "today".
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    // One-shot pre-fill from the homepage search widget (sessionStorage has
    // no change event to subscribe to, so this is a legitimate single read).
    const storedCi = sessionStorage.getItem('search-checkin')
    const storedCo = sessionStorage.getItem('search-checkout')
    if (storedCi && storedCo && storedCi >= today) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckIn(storedCi)
      setCheckOut(storedCo)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Close whichever panel is open on an outside click — same convention
  // used by the wishlist season picker (SavedClient.tsx).
  useEffect(() => {
    if (!openPanel) return
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpenPanel(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openPanel])

  const closeAll = () => setOpenPanel(null)
  const toggle = (p: Exclude<PanelOpen, null>) => setOpenPanel((cur) => (cur === p ? null : p))

  const clearDates = () => { setCheckIn(''); setCheckOut(''); setFlexibility('exact') }
  const clearFlex = () => { setFlexDuration(null); setFlexMonths(new Set()) }

  const toggleFlexMonth = (key: string) => {
    setFlexMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const dayClick = (ds: string) => {
    if (!checkIn || checkOut || ds < checkIn) {
      setCheckIn(ds); setCheckOut('')
    } else if (ds === checkIn) {
      setCheckIn(''); setCheckOut('')
    } else {
      setCheckOut(ds)
      setTimeout(closeAll, 300)
    }
  }

  const navMonth = (dir: 1 | -1) => {
    let m = viewMonth + dir, y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewMonth(m); setViewYear(y)
  }

  const step = (type: 'adults' | 'children' | 'infants', d: number) => {
    setGuests((g) => ({ ...g, [type]: Math.max(0, g[type] + d) }))
  }
  const clearGuests = () => setGuests({ adults: 0, children: 0, infants: 0 })

  const guestsLabel = () => {
    const parts: string[] = []
    if (guests.adults) parts.push(`${guests.adults} adult${guests.adults > 1 ? 's' : ''}`)
    if (guests.children) parts.push(`${guests.children} child${guests.children > 1 ? 'ren' : ''}`)
    if (guests.infants) parts.push(`${guests.infants} infant${guests.infants > 1 ? 's' : ''}`)
    return parts.join(', ')
  }

  const datesLabel = () => {
    if (mode === 'flexible') {
      const parts: string[] = []
      if (flexDuration) parts.push(flexDuration)
      if (flexMonths.size > 0) {
        parts.push([...flexMonths].sort().map((k) => {
          const [y, m] = k.split('-').map(Number)
          return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long' }) + ' ' + y
        }).join(', '))
      }
      return parts.join(' · ')
    }
    if (checkIn && checkOut) return `${fmtShort(checkIn)} – ${fmtShort(checkOut)}`
    if (checkIn) return `${fmtShort(checkIn)} → select check-out`
    return ''
  }

  const renderMonth = (y: number, m: number, showPrev: boolean, showNext: boolean) => {
    const todayD = new Date(); todayD.setHours(0, 0, 0, 0)
    const firstDay = new Date(y, m, 1)
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const startDow = firstDay.getDay()
    const monthLabel = firstDay.toLocaleString('en-US', { month: 'long' }) + ' ' + y
    const cells = []
    for (let i = 0; i < startDow; i++) cells.push(<div key={`e${i}`} className="dp-day dp-day-empty" />)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d); date.setHours(0, 0, 0, 0)
      const ds = fmt(y, m, d)
      const isPast = date < todayD
      const isToday = date.getTime() === todayD.getTime()
      const isStart = checkIn === ds
      const isEnd = checkOut === ds
      const inRange = !!(checkIn && checkOut && ds > checkIn && ds < checkOut)
      let cls = 'dp-day'
      if (isPast) cls += ' dp-day-past'
      if (isToday && !isStart && !isEnd) cls += ' dp-day-today'
      if (isStart) cls += ' dp-day-start'
      if (isEnd) cls += ' dp-day-end'
      if (inRange) cls += ' dp-day-in-range'
      cells.push(<div key={d} className={cls} onClick={!isPast ? () => dayClick(ds) : undefined}>{d}</div>)
    }
    return (
      <div>
        <div className="dp-month-header">
          {showPrev ? (
            <button className="dp-nav-btn" type="button" onClick={() => navMonth(-1)}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          ) : <div style={{ width: 28 }} />}
          <div className="dp-month-title">{monthLabel}</div>
          {showNext ? (
            <button className="dp-nav-btn" type="button" onClick={() => navMonth(1)}>
              <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18" /></svg>
            </button>
          ) : <div style={{ width: 28 }} />}
        </div>
        <div className="dp-day-names">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((n) => <div className="dp-day-name" key={n}>{n}</div>)}
        </div>
        <div className="dp-days-grid">{cells}</div>
      </div>
    )
  }

  const nextMonth = viewMonth === 11 ? { y: viewYear + 1, m: 0 } : { y: viewYear, m: viewMonth + 1 }

  const renderFlexMonths = () => {
    const todayRef = new Date()
    const start = flexPage * FLEX_PER_PAGE
    const tiles = []
    for (let i = start; i < Math.min(start + FLEX_PER_PAGE, FLEX_TOTAL_MONTHS); i++) {
      const d = new Date(todayRef.getFullYear(), todayRef.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      tiles.push(
        <button key={key} type="button" className={`dp-month-tile${flexMonths.has(key) ? ' dp-active' : ''}`} onClick={() => toggleFlexMonth(key)}>
          {d.toLocaleString('en-US', { month: 'short' })}<br />{d.getFullYear()}
        </button>
      )
    }
    return tiles
  }

  const nights = mode === 'calendar' && checkIn && checkOut && checkOut > checkIn
    ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0

  const buildMessage = () => {
    const dl = datesLabel()
    const gl = guestsLabel()
    const parts: string[] = [`Hi, I'm interested in ${propertyTitle}.`]
    if (dl) parts.push(`Dates: ${dl}.`)
    if (gl) parts.push(`Guests: ${gl}.`)
    if (!dl && !gl) parts.push('Could you please share availability and rates?')
    else parts.push('Can you confirm availability?')
    return parts.join(' ')
  }

  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMessage())}`

  const emailHref = (() => {
    const subject = `Availability Inquiry — ${propertyTitle}`
    let body = `Hi,\n\nI am interested in ${propertyTitle}.`
    if (mode === 'calendar' && checkIn && checkOut) body += `\n\nCheck-in: ${fmtLong(checkIn)}\nCheck-out: ${fmtLong(checkOut)}`
    else if (datesLabel()) body += `\n\nDates: ${datesLabel()}`
    if (guestsLabel()) body += `\nGuests: ${guestsLabel()}`
    body += '\n\nCould you please confirm availability and share the final rate?\n\nThank you'
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  })()

  return (
    <div className="sidebar-sticky">
      <div className="iq-card">
        <div className="iq-head">
          <div className="iq-from">Starting from</div>
          <div className="iq-price">
            <span className="iq-amount">{minRate ? formatPrice(minRate) : '—'}</span>
            <span className="iq-per">/ night</span>
          </div>
          {minStayNights > 0 && <div className="iq-min-stay">{minStayNights}-night minimum stay</div>}
        </div>
        <div className="iq-body" ref={wrapRef}>
          <div className="iq-field">
            <span className="iq-label">Travel dates</span>
            <button type="button" className={`iq-dd-trigger${openPanel === 'dates' ? ' is-open' : ''}`} onClick={() => toggle('dates')}>
              <span className={`iq-dd-val${datesLabel() ? '' : ' ph'}`}>{datesLabel() || 'Select dates'}</span>
              <svg className="iq-dd-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {openPanel === 'dates' && (
              <div className="iq-dd-panel iq-date-panel">
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
                        <button key={v} type="button" className={`dp-flex-pill${flexibility === v ? ' dp-active' : ''}`} onClick={() => setFlexibility(v)}>{l}</button>
                      ))}
                    </div>
                    <div className="dp-panel-footer">
                      <button className="dp-clear-btn" type="button" onClick={clearDates}>Clear dates</button>
                      <button className="dp-done-btn" type="button" onClick={closeAll}>Done</button>
                    </div>
                  </div>
                )}

                {mode === 'flexible' && (
                  <div className="dp-flex-body dp-active">
                    <p className="dp-flex-q">How long do you want to stay?</p>
                    <div className="dp-pills">
                      {DURATIONS.map((dur) => (
                        <button key={dur} type="button" className={`dp-pill${flexDuration === dur ? ' dp-active' : ''}`} onClick={() => setFlexDuration(flexDuration === dur ? null : dur)}>{dur}</button>
                      ))}
                    </div>
                    <p className="dp-flex-q">When do you want to come?</p>
                    <div className="dp-month-nav-row">
                      <button className={`dp-month-nav-btn${flexPage === 0 ? ' dp-hidden' : ''}`} type="button" onClick={() => setFlexPage((p) => Math.max(0, p - 1))}>
                        <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                      </button>
                      <div className="dp-month-tiles">{renderFlexMonths()}</div>
                      <button className={`dp-month-nav-btn${flexPage >= FLEX_MAX_PAGE ? ' dp-hidden' : ''}`} type="button" onClick={() => setFlexPage((p) => Math.min(FLEX_MAX_PAGE, p + 1))}>
                        <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                      </button>
                    </div>
                    <div className="dp-panel-footer">
                      <button className="dp-clear-btn" type="button" onClick={clearFlex}>Clear</button>
                      <button className="dp-done-btn" type="button" onClick={closeAll}>Done</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {nights > 0 && (
            <div className="iq-nights-est" style={{ display: 'block' }}>
              {nights} night{nights !== 1 ? 's' : ''}
              {minRate ? ` · est. ${formatPrice(nights * minRate)}` : ''}
            </div>
          )}

          <div className="iq-field">
            <span className="iq-label">Guests</span>
            <button type="button" className={`iq-dd-trigger${openPanel === 'guests' ? ' is-open' : ''}`} onClick={() => toggle('guests')}>
              <span className={`iq-dd-val${guestsLabel() ? '' : ' ph'}`}>{guestsLabel() || 'Select guests'}</span>
              <svg className="iq-dd-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            {openPanel === 'guests' && (
              <div className="iq-dd-panel iq-guest-panel">
                {([['adults', 'Adults', 'Ages 13+'], ['children', 'Children', 'Ages 2–13'], ['infants', 'Infants', 'Ages 0–1']] as const).map(([key, label, age]) => (
                  <div className="g-row" key={key}>
                    <div className="g-info">
                      <div className="g-type">{label}</div>
                      <div className="g-age">{age}</div>
                    </div>
                    <div className="g-counter">
                      <button className="ctr-btn" type="button" disabled={guests[key] === 0} onClick={() => step(key, -1)}>&#8722;</button>
                      <span className="ctr-val">{guests[key]}</span>
                      <button className="ctr-btn" type="button" onClick={() => step(key, 1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="g-done-row">
                  <button className="g-clear-btn" type="button" onClick={clearGuests}>Clear</button>
                  <button className="g-done-btn" type="button" onClick={closeAll}>Done</button>
                </div>
              </div>
            )}
          </div>

          <div className="iq-divider" />
          {showScarcity && (
            <div className="scarcity-signal" style={{ display: 'flex' }}>
              <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p>Rates vary significantly by season — book early to lock in the best price.</p>
            </div>
          )}
          <a href={waHref} className="iq-wa" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.659 1.438 5.168L2 22l4.985-1.402A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 11.999 2z"/></svg>
            Check availability
          </a>
          <a href={emailHref} className="iq-email">
            <svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>
            Send an email instead
          </a>
          <p className="iq-disclaimer">Availability confirmed within 24 hours. No payment until you&rsquo;re ready to book.</p>
        </div>
      </div>
    </div>
  )
}
