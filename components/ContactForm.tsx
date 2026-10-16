'use client'

import { useState } from 'react'
import Link from 'next/link'

const CONTACT_EMAIL = 'rentals@mexicanreserve.com'

type DdGroup = 'beds' | 'budget' | null
type PanelOpen = 'date' | 'guests' | DdGroup

type DateMode = 'calendar' | 'flexible'

const BEDS_OPTS = ['2 bedrooms', '3 bedrooms', '4 bedrooms', '5 bedrooms', '6+ bedrooms']

const BUDGET_OPTS: [string, string][] = [
  ['Under $1,000 / night', 'Up to $1,000 / night'],
  ['$1,001 – $2,500 / night', '$1,001 – $2,500 / night'],
  ['$2,501 – $5,000 / night', '$2,501 – $5,000 / night'],
  ['$5,001 – $8,000 / night', '$5,001 – $8,000 / night'],
  ['$8,001+ / night', '$8,001+ / night'],
  ['Flexible budget', 'Flexible'],
]

const PRIORITY_OPTS = ['Oceanfront / beach access', 'Ocean view', 'Private pool', 'Chef service', 'Wheelchair accessible']

const FLEX_OPTS: [string, string][] = [
  ['exact', 'Exact dates'],
  ['1', '±1 day'],
  ['2', '±2 days'],
  ['3', '±3 days'],
  ['7', '±7 days'],
]

const DURATIONS = ['3 nights', '1 week', '2 weeks', '1 month']
const FLEX_TOTAL_MONTHS = 18
const FLEX_PER_PAGE = 6
const FLEX_MAX_PAGE = Math.ceil(FLEX_TOTAL_MONTHS / FLEX_PER_PAGE) - 1

function fmt(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}
function fmtShort(ds: string) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtLong(ds: string) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function ContactForm() {
  // About you
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  // Panel state — only one open at a time
  const [openPanel, setOpenPanel] = useState<PanelOpen>(null)

  // Dates
  const [mode, setMode] = useState<DateMode>('calendar')
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const [flexibility, setFlexibility] = useState('exact')
  const [flexDuration, setFlexDuration] = useState<string | null>(null)
  const [flexMonths, setFlexMonths] = useState<Set<string>>(new Set())
  const [flexPage, setFlexPage] = useState(0)
  const [calErr, setCalErr] = useState(false)
  const [flexErr, setFlexErr] = useState(false)

  // Guests
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0 })
  const [guestErr, setGuestErr] = useState(false)

  // Property
  const [beds, setBeds] = useState('')
  const [budget, setBudget] = useState('')
  const [bedsErr, setBedsErr] = useState(false)
  const [budgetErr, setBudgetErr] = useState(false)
  const [priorities, setPriorities] = useState<Set<string>>(new Set())

  // Message
  const [message, setMessage] = useState('')

  const [submitErr, setSubmitErr] = useState(false)

  const closeAll = () => setOpenPanel(null)
  const toggle = (p: Exclude<PanelOpen, null>) => setOpenPanel((cur) => (cur === p ? null : p))

  const togglePriority = (val: string) => {
    setPriorities((prev) => {
      const next = new Set(prev)
      if (next.has(val)) next.delete(val)
      else next.add(val)
      return next
    })
  }

  const toggleFlexMonth = (key: string) => {
    setFlexMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
    setFlexErr(false)
  }

  const clearCal = () => {
    setCheckIn(null); setCheckOut(null); setFlexibility('exact')
  }
  const clearFlex = () => {
    setFlexDuration(null); setFlexMonths(new Set())
  }

  const dayClick = (ds: string) => {
    if (!checkIn || checkOut || ds < checkIn) {
      setCheckIn(ds); setCheckOut(null)
    } else if (ds === checkIn) {
      setCheckIn(null); setCheckOut(null)
    } else {
      setCheckOut(ds)
      setTimeout(closeAll, 300)
    }
    setCalErr(false)
  }

  const navMonth = (dir: 1 | -1) => {
    let m = viewMonth + dir, y = viewYear
    if (m < 0) { m = 11; y -= 1 }
    if (m > 11) { m = 0; y += 1 }
    setViewMonth(m); setViewYear(y)
  }

  const step = (type: 'adults' | 'children' | 'infants', d: number) => {
    setGuests((g) => ({ ...g, [type]: Math.max(0, g[type] + d) }))
    setGuestErr(false)
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
    if (checkIn && checkOut) {
      const fl = flexibility !== 'exact' ? ` (±${flexibility} day${flexibility !== '1' ? 's' : ''})` : ''
      return `${fmtShort(checkIn)} – ${fmtShort(checkOut)}${fl}`
    }
    if (checkIn) return `${fmtShort(checkIn)} → select check-out`
    return ''
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
    const today = new Date()
    const start = flexPage * FLEX_PER_PAGE
    const tiles: React.ReactNode[] = []
    for (let i = start; i < Math.min(start + FLEX_PER_PAGE, FLEX_TOTAL_MONTHS); i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      tiles.push(
        <button key={key} type="button" className={`dp-month-tile${flexMonths.has(key) ? ' dp-active' : ''}`} onClick={() => toggleFlexMonth(key)}>
          {d.toLocaleString('en-US', { month: 'short' })}<br />{d.getFullYear()}
        </button>
      )
    }
    return tiles
  }

  const ddPick = (group: 'beds' | 'budget', val: string) => {
    if (group === 'beds') { setBeds(val); setBedsErr(false) }
    else { setBudget(val); setBudgetErr(false) }
    closeAll()
  }

  const handleSubmit = () => {
    let valid = true

    if (mode === 'flexible') {
      setCalErr(false)
      if (!flexDuration || flexMonths.size === 0) {
        setFlexErr(true); setOpenPanel('date'); valid = false
      } else setFlexErr(false)
    } else {
      setFlexErr(false)
      if (!checkIn || !checkOut) {
        setCalErr(true); setOpenPanel('date'); valid = false
      } else setCalErr(false)
    }
    if (guests.adults + guests.children + guests.infants === 0) {
      setGuestErr(true); valid = false
    } else setGuestErr(false)
    if (!beds) { setBedsErr(true); valid = false } else setBedsErr(false)
    if (!budget) { setBudgetErr(true); valid = false } else setBudgetErr(false)
    if (!name.trim() || !email.trim()) valid = false

    if (!valid) { setSubmitErr(true); return }
    setSubmitErr(false)

    let dateStr: string
    if (mode === 'flexible') {
      const mL = [...flexMonths].sort().map((k) => {
        const [y, m] = k.split('-').map(Number)
        return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long' }) + ' ' + y
      })
      dateStr = `${flexDuration} in ${mL.join(', ')}`
    } else {
      dateStr = `${fmtLong(checkIn!)} – ${fmtLong(checkOut!)}`
      if (flexibility !== 'exact') dateStr += ` (±${flexibility}${flexibility === '1' ? ' day' : ' days'} flexibility)`
    }

    const gP: string[] = []
    if (guests.adults) gP.push(`${guests.adults} ${guests.adults === 1 ? 'adult' : 'adults'}`)
    if (guests.children) gP.push(`${guests.children} ${guests.children === 1 ? 'child' : 'children'}`)
    if (guests.infants) gP.push(`${guests.infants} ${guests.infants === 1 ? 'infant' : 'infants'}`)

    const prefs = [...priorities]
    const subj = `Property Inquiry — ${name.trim()}`
    const body = 'Hi,\n\nI\'d like to inquire about a property rental in Punta Mita.\n\n'
      + `— CONTACT —\nName:   ${name.trim()}\nEmail:  ${email.trim()}\n${phone.trim() ? `Phone:  ${phone.trim()}\n` : ''}`
      + `\n— TRIP DETAILS —\nDates:   ${dateStr}\nGuests:  ${gP.join(', ')}\n`
      + `\n— PROPERTY PREFERENCES —\nBedrooms: ${beds}\nBudget:   ${budget}\n`
      + (prefs.length ? `Priorities: ${prefs.join(', ')}\n` : '')
      + (message.trim() ? `\n— NOTES —\n${message.trim()}\n` : '')
      + '\nThank you!'

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="ct-form-card" onClick={(e) => { if (e.target === e.currentTarget) closeAll() }}>
      <h2 className="ct-form-title">Tell us about your trip</h2>
      <p className="ct-trust-line">Personal response &nbsp;·&nbsp; Within 24 hours &nbsp;·&nbsp; No commitment</p>

      {/* 01 — About you */}
      <div className="ct-sec-hd first">
        <span className="ct-sec-n">01</span>
        <h3 className="ct-sec-t">About you</h3>
      </div>
      <div className="ct-row ct-row-3">
        <div className="ct-field">
          <label htmlFor="f-name">Name</label>
          <input className="ct-input" type="text" id="f-name" placeholder="Jane Smith" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="ct-field">
          <label htmlFor="f-email">Email</label>
          <input className="ct-input" type="email" id="f-email" placeholder="jane@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="ct-field">
          <label htmlFor="f-phone">WhatsApp / Phone <span className="opt">(optional)</span></label>
          <input className="ct-input" type="tel" id="f-phone" placeholder="+1 555 000 0000" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      {/* 02 — Your stay */}
      <div className="ct-sec-hd">
        <span className="ct-sec-n">02</span>
        <h3 className="ct-sec-t">Your stay</h3>
      </div>
      <div className="ct-row ct-row-2">
        <div className="ct-field">
          <label>Travel dates</label>
          <button className={`ct-dd-trigger${openPanel === 'date' ? ' is-open' : ''}`} type="button" onClick={() => toggle('date')}>
            <span className={`ct-dd-val${datesLabel() ? '' : ' ph'}`}>{datesLabel() || 'Select dates'}</span>
            <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openPanel === 'date' && (
            <div className="ct-dd-panel ct-date-panel">
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
                    <button className="dp-clear-btn" type="button" onClick={clearCal}>Clear dates</button>
                    <button className="dp-done-btn" type="button" onClick={closeAll}>Done</button>
                  </div>
                  {calErr && <p className="ct-field-err">Please select check-in and check-out dates.</p>}
                </div>
              )}

              {mode === 'flexible' && (
                <div className="dp-flex-body dp-active">
                  <p className="dp-flex-q">How long do you want to stay?</p>
                  <div className="dp-pills">
                    {DURATIONS.map((dur) => (
                      <button key={dur} type="button" className={`dp-pill${flexDuration === dur ? ' dp-active' : ''}`} onClick={() => { setFlexDuration(flexDuration === dur ? null : dur); setFlexErr(false) }}>{dur}</button>
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
                    <button className="dp-done-btn" type="button" onClick={() => { if (!flexDuration || flexMonths.size === 0) { setFlexErr(true); return } closeAll() }}>Done</button>
                  </div>
                  {flexErr && <p className="ct-field-err">Please select a duration and at least one month.</p>}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ct-field">
          <label>Guests</label>
          <button className={`ct-dd-trigger${openPanel === 'guests' ? ' is-open' : ''}`} type="button" onClick={() => toggle('guests')}>
            <span className={`ct-dd-val${guestsLabel() ? '' : ' ph'}`}>{guestsLabel() || 'Add guests'}</span>
            <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openPanel === 'guests' && (
            <div className="ct-guest-panel">
              {([['adults', 'Adults', 'Ages 13+'], ['children', 'Children', 'Ages 2–12'], ['infants', 'Infants', 'Under 2']] as const).map(([key, label, age]) => (
                <div className="g-row" key={key}>
                  <div className="g-info"><div className="g-type">{label}</div><div className="g-age">{age}</div></div>
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
          {guestErr && <p className="ct-field-err">Please add at least one guest.</p>}
        </div>
      </div>

      {/* 03 — The property */}
      <div className="ct-sec-hd">
        <span className="ct-sec-n">03</span>
        <h3 className="ct-sec-t">The property</h3>
      </div>
      <div className="ct-row ct-row-2" style={{ alignItems: 'start' }}>
        <div className="ct-field">
          <label>Bedrooms</label>
          <button className={`ct-dd-trigger${openPanel === 'beds' ? ' is-open' : ''}`} type="button" onClick={() => toggle('beds')}>
            <span className={`ct-dd-val${beds ? '' : ' ph'}`}>{beds || 'Select…'}</span>
            <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openPanel === 'beds' && (
            <div className="ct-dd-panel">
              {BEDS_OPTS.map((opt) => (
                <div key={opt} className={`ct-dd-opt${beds === opt ? ' is-sel' : ''}`} onClick={() => ddPick('beds', opt)}>{opt}</div>
              ))}
            </div>
          )}
          {bedsErr && <p className="ct-field-err">Required.</p>}
        </div>
        <div className="ct-field">
          <label>Budget / night</label>
          <button className={`ct-dd-trigger${openPanel === 'budget' ? ' is-open' : ''}`} type="button" onClick={() => toggle('budget')}>
            <span className={`ct-dd-val${budget ? '' : ' ph'}`}>{budget ? BUDGET_OPTS.find(([v]) => v === budget)?.[1] : 'Select…'}</span>
            <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openPanel === 'budget' && (
            <div className="ct-dd-panel">
              {BUDGET_OPTS.map(([val, label]) => (
                <div key={val} className={`ct-dd-opt${budget === val ? ' is-sel' : ''}`} onClick={() => ddPick('budget', val)}>{label}</div>
              ))}
            </div>
          )}
          {budgetErr && <p className="ct-field-err">Required.</p>}
        </div>
      </div>
      <div className="ct-field" style={{ marginTop: 14 }}>
        <label>Priorities <span className="opt">(select all that apply)</span></label>
        <div className="ct-pills" style={{ marginTop: 8 }}>
          {PRIORITY_OPTS.map((val) => (
            <span key={val} className={`ct-pill${priorities.has(val) ? ' active' : ''}`} onClick={() => togglePriority(val)}>{val}</span>
          ))}
        </div>
      </div>

      {/* 04 — Anything else? */}
      <div className="ct-sec-hd">
        <span className="ct-sec-n">04</span>
        <h3 className="ct-sec-t">Anything else?</h3>
      </div>
      <div className="ct-field">
        <label htmlFor="f-message">Optional note <span className="opt">(special occasions, dietary needs, activities…)</span></label>
        <textarea className="ct-input" id="f-message" placeholder="Tell us anything that would help us find the perfect property for you." value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>

      <div className="ct-submit-row">
        <button className="ct-submit-btn" type="button" onClick={handleSubmit}>
          <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          Send inquiry
        </button>
        {submitErr && <p id="ct-err">Please fill in all required fields before sending.</p>}
        <div className="ct-submit-footer">
          <p className="ct-submit-note">Opens your email client with your details pre-filled. We reply within 24 hours.</p>
          <p className="ct-privacy-note">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Your information is never shared with third parties.
          </p>
          <p className="ct-legal-note">By sending this inquiry you agree to our <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms-and-conditions">Terms and Conditions</Link>.</p>
        </div>
      </div>
    </div>
  )
}
