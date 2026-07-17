'use client'

import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'

const WA_NUMBER = '523313619889'
const CONTACT_EMAIL = 'rentals@mexicanreserve.com'

const GUEST_OPTIONS = ['1–2 guests', '3–4 guests', '5–6 guests', '7–8 guests', '9–10 guests', '11–12 guests']

function fmtDateLabel(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('')
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

  const nights = checkIn && checkOut && checkOut > checkIn
    ? Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000)
    : 0

  const hasDates = !!(checkIn && checkOut)
  const ciLabel = checkIn ? fmtDateLabel(checkIn) : ''
  const coLabel = checkOut ? fmtDateLabel(checkOut) : ''

  const buildMessage = () => {
    const parts: string[] = [`Hi, I'm interested in ${propertyTitle}.`]
    if (hasDates) parts.push(`Check-in: ${ciLabel}, Check-out: ${coLabel}.`)
    if (guests) parts.push(`Guests: ${guests}.`)
    if (!hasDates && !guests) parts.push('Could you please share availability and rates?')
    else parts.push('Can you confirm availability?')
    return parts.join(' ')
  }

  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(buildMessage())}`

  const emailHref = (() => {
    const subject = `Availability Inquiry — ${propertyTitle}`
    let body = `Hi,\n\nI am interested in ${propertyTitle}.`
    if (hasDates) body += `\n\nCheck-in: ${ciLabel}\nCheck-out: ${coLabel}`
    if (guests) body += `\nGuests: ${guests}`
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
        <div className="iq-body">
          <div className="iq-dates">
            <div className="iq-date">
              <span className="iq-date-lbl">Check-in</span>
              <span className={`iq-date-val${checkIn ? '' : ' ph'}`}>{checkIn ? ciLabel : 'Add date'}</span>
              <input
                type="date"
                aria-label="Check-in date"
                min={today}
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(e.target.value)
                  if (checkOut && checkOut <= e.target.value) setCheckOut('')
                }}
              />
            </div>
            <div className="iq-date">
              <span className="iq-date-lbl">Check-out</span>
              <span className={`iq-date-val${checkOut ? '' : ' ph'}`}>{checkOut ? coLabel : 'Add date'}</span>
              <input
                type="date"
                aria-label="Check-out date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>
          {nights > 0 && (
            <div className="iq-nights-est" style={{ display: 'block' }}>
              {nights} night{nights !== 1 ? 's' : ''}
              {minRate ? ` · est. ${formatPrice(nights * minRate)}` : ''}
            </div>
          )}
          <div className="iq-field">
            <label className="iq-label" htmlFor="guestsSel">Guests</label>
            <select id="guestsSel" className="iq-select" value={guests} onChange={(e) => setGuests(e.target.value)}>
              <option value="">Select guests</option>
              {GUEST_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="iq-divider" />
          {showScarcity && (
            <div className="scarcity-signal" style={{ display: 'flex' }}>
              <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <p>This property books quickly — especially during peak season.</p>
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
