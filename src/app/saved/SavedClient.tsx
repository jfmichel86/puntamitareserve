'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import PropertyCard from '@/components/PropertyCard'
import { Property, startingRate, formatPrice } from '@/lib/utils'

const CONTACT_EMAIL = 'rentals@mexicanreserve.com'

const VIEW_KEYS_C: Record<string, string> = {
  'ocean-view': 'Ocean View',
  'golf-course-view': 'Golf Course View',
  'lake-view': 'Lake View',
}
const LOC_KEYS_C: Record<string, string> = {
  'beachfront': 'Beachfront',
  'oceanfront': 'Oceanfront',
  'golf-course': 'Golf Course',
  'hillside': 'Hillside',
}
const MEMB_LABELS: Record<string, string> = { 'golf-membership': 'Golf', 'sport-membership': 'Sport' }

const FLEX_OPTS: [string, string][] = [
  ['exact', 'Exact dates'], ['1', '±1 day'], ['2', '±2 days'], ['3', '±3 days'], ['7', '±7 days'],
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
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function fmtLong(ds: string) {
  const [y, m, d] = ds.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function getSavedSlugs(): string[] {
  if (typeof window === 'undefined') return []
  return Object.keys(localStorage)
    .filter((k) => k.startsWith('saved-') && localStorage.getItem(k) === '1')
    .map((k) => k.replace('saved-', ''))
}

function yes() { return <span className="is-yes">&#10003;</span> }
function no() { return <span className="is-no">&mdash;</span> }

function staffMeals(p: Property) {
  const FOOD_ROLES = ['chef', 'sous-chef', 'cook']
  let svc: string[] = []
  ;(p.staffServices || []).forEach((s) => { if (FOOD_ROLES.includes(s.role)) svc = svc.concat(s.services || []) })
  const hasB = svc.includes('breakfast'), hasL = svc.includes('lunch'), hasD = svc.includes('dinner')
  if (!hasB && !hasL && !hasD) return no()
  const meals: string[] = []
  if (hasB) meals.push('Breakfast')
  if (hasL) meals.push('Lunch')
  if (hasD) meals.push('Dinner')
  return meals.join(', ')
}

export default function SavedClient({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams()
  const propParam = searchParams.get('props')
  const isShared = !!propParam
  const sharedSlugs = useMemo(
    () => (propParam ? propParam.split(',').map((s) => s.trim()).filter(Boolean) : []),
    [propParam]
  )

  const [mounted, setMounted] = useState(false)
  const [visibleSlugs, setVisibleSlugs] = useState<string[]>([])
  const [removingSlugs, setRemovingSlugs] = useState<Set<string>>(new Set())

  // Initial read of localStorage — client-only, so this runs after mount to
  // avoid a server/client hydration mismatch. Legitimate one-shot read of an
  // external system, same exception pattern as PropertyCard's own saved-state effect.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isShared) setVisibleSlugs(getSavedSlugs())
    setMounted(true)
  }, [isShared])

  // Own-list mode: when a heart gets un-toggled elsewhere (or on this page),
  // fade the card out and drop it from the grid.
  useEffect(() => {
    if (isShared) return
    const recompute = () => {
      const current = new Set(getSavedSlugs())
      setVisibleSlugs((prev) => {
        const removed = prev.filter((s) => !current.has(s))
        if (removed.length === 0) return prev
        setRemovingSlugs((r) => new Set([...r, ...removed]))
        setTimeout(() => {
          setVisibleSlugs((p2) => p2.filter((s) => current.has(s)))
          setRemovingSlugs((r) => { const n = new Set(r); removed.forEach((s) => n.delete(s)); return n })
        }, 300)
        return prev
      })
    }
    window.addEventListener('saved-changed', recompute)
    window.addEventListener('storage', recompute)
    return () => {
      window.removeEventListener('saved-changed', recompute)
      window.removeEventListener('storage', recompute)
    }
  }, [isShared])

  const activeSlugs = isShared ? sharedSlugs : visibleSlugs

  const orderedProps = useMemo(() => {
    const bySlug = new Map(properties.map((p) => [p.slug, p]))
    return activeSlugs.map((s) => bySlug.get(s)).filter((p): p is Property => Boolean(p))
  }, [properties, activeSlugs])

  const showEmpty = mounted && orderedProps.length === 0
  const showActions = !showEmpty

  // Same unsave mechanism PropertyCard's heart button uses (remove the
  // localStorage flag, fire the shared 'saved-changed' event) — the
  // recompute effect above already listens for this and fades the property
  // out of both the grid and this comparison table, so nothing else needs
  // to change here.
  const handleRemoveFromCompare = (slug: string) => {
    localStorage.removeItem(`saved-${slug}`)
    window.dispatchEvent(new Event('saved-changed'))
  }

  /* ── Toast ────────────────────────────────────────────────────────── */
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 3200)
  }

  // Shared mode: saving a property to your own list pops a confirmation toast
  useEffect(() => {
    if (!isShared) return
    let prev = new Set(getSavedSlugs())
    const handler = () => {
      const now = new Set(getSavedSlugs())
      for (const s of now) {
        if (!prev.has(s)) { showToast('Saved to your wishlist ♥'); break }
      }
      prev = now
    }
    window.addEventListener('saved-changed', handler)
    return () => window.removeEventListener('saved-changed', handler)
  }, [isShared])

  /* ── Share menu ───────────────────────────────────────────────────── */
  const shareBtnRef = useRef<HTMLButtonElement>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareMenuPos, setShareMenuPos] = useState({ top: 0, left: 0 })

  const positionShareMenu = () => {
    const btn = shareBtnRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    setShareMenuPos({ top: r.bottom + 8, left: r.left })
  }

  useEffect(() => {
    if (!shareOpen) return
    const onReposition = () => positionShareMenu()
    const onDocClick = () => setShareOpen(false)
    window.addEventListener('scroll', onReposition, { passive: true })
    window.addEventListener('resize', onReposition)
    document.addEventListener('click', onDocClick)
    return () => {
      window.removeEventListener('scroll', onReposition)
      window.removeEventListener('resize', onReposition)
      document.removeEventListener('click', onDocClick)
    }
  }, [shareOpen])

  const toggleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!shareOpen) positionShareMenu()
    setShareOpen((o) => !o)
  }

  const getShareUrl = () => {
    const currentSlugs = orderedProps.length ? orderedProps.map((p) => p.slug) : activeSlugs
    if (!currentSlugs.length || typeof window === 'undefined') return null
    return `${window.location.origin}${window.location.pathname}?props=${currentSlugs.join(',')}`
  }

  const handleCopyLink = async () => {
    const url = getShareUrl()
    if (!url) return
    setShareOpen(false)
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied — share it with family!')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0'
      document.body.appendChild(ta)
      ta.focus(); ta.select()
      try { document.execCommand('copy'); showToast('Link copied!') } catch { /* no-op */ }
      document.body.removeChild(ta)
    }
  }

  const shareUrl = mounted ? getShareUrl() : null
  const waShareHref = shareUrl ? `https://wa.me/?text=${encodeURIComponent('Check out this property wishlist I put together: ' + shareUrl)}` : '#'
  const smsShareHref = shareUrl ? `sms:?&body=${encodeURIComponent('Check out this property wishlist: ' + shareUrl)}` : '#'
  const telegramShareHref = shareUrl ? `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out this property wishlist from Mexican Reserve')}` : '#'

  /* ── Inquiry modal ────────────────────────────────────────────────── */
  const [inqOpen, setInqOpen] = useState(false)
  const [mode, setMode] = useState<'calendar' | 'flexible'>('calendar')
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
  const [guests, setGuests] = useState({ adults: 0, children: 0, infants: 0 })
  const [guestErr, setGuestErr] = useState(false)

  const openInqModal = () => {
    if (orderedProps.length === 0) return
    setInqOpen(true)
  }
  const closeInqModal = () => setInqOpen(false)

  useEffect(() => {
    document.body.style.overflow = inqOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [inqOpen])

  useEffect(() => {
    if (!inqOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeInqModal() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [inqOpen])

  const toggleFlexMonth = (key: string) => {
    setFlexMonths((prev) => {
      const n = new Set(prev)
      if (n.has(key)) n.delete(key)
      else n.add(key)
      return n
    })
    setFlexErr(false)
  }
  const clearInqDates = () => {
    setCheckIn(null); setCheckOut(null); setFlexibility('exact')
    setFlexDuration(null); setFlexMonths(new Set())
  }
  const dayClick = (ds: string) => {
    if (!checkIn || checkOut || ds < checkIn) { setCheckIn(ds); setCheckOut(null) }
    else if (ds === checkIn) { setCheckIn(null); setCheckOut(null) }
    else { setCheckOut(ds) }
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
  const guestsDisplay = () => {
    const parts: string[] = []
    if (guests.adults) parts.push(`${guests.adults} adult${guests.adults > 1 ? 's' : ''}`)
    if (guests.children) parts.push(`${guests.children} child${guests.children > 1 ? 'ren' : ''}`)
    if (guests.infants) parts.push(`${guests.infants} infant${guests.infants > 1 ? 's' : ''}`)
    return parts.join(', ')
  }
  const dateDisplay = () => {
    if (mode === 'flexible') {
      const parts: string[] = []
      if (flexDuration) parts.push(flexDuration)
      if (flexMonths.size > 0) {
        parts.push([...flexMonths].sort().map((k) => {
          const [y, m] = k.split('-').map(Number)
          return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long' }) + ' ' + y
        }).join(', '))
      }
      return parts.length ? parts.join(' · ') : 'Select flexible dates'
    }
    if (checkIn && checkOut) {
      const fl = flexibility !== 'exact' ? ` (±${flexibility} day${flexibility !== '1' ? 's' : ''})` : ''
      return `${fmtShort(checkIn)} – ${fmtShort(checkOut)}${fl}`
    }
    if (checkIn) return `${fmtShort(checkIn)} → …`
    return 'Select your dates'
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

  const handleInqSubmit = () => {
    let valid = true
    if (mode === 'flexible') {
      setCalErr(false)
      if (!flexDuration || flexMonths.size === 0) { setFlexErr(true); valid = false } else setFlexErr(false)
    } else {
      setFlexErr(false)
      if (!checkIn || !checkOut) { setCalErr(true); valid = false } else setCalErr(false)
    }
    const total = guests.adults + guests.children + guests.infants
    if (total === 0) { setGuestErr(true); valid = false } else setGuestErr(false)
    if (!valid) return

    let dateStr: string
    if (mode === 'flexible') {
      const mLabels = [...flexMonths].sort().map((k) => {
        const [y, m] = k.split('-').map(Number)
        return new Date(y, m - 1, 1).toLocaleString('en-US', { month: 'long' }) + ' ' + y
      })
      dateStr = `${flexDuration} in ${mLabels.join(', ')}`
    } else {
      dateStr = `${fmtLong(checkIn!)} – ${fmtLong(checkOut!)}`
      if (flexibility !== 'exact') dateStr += ` (±${flexibility}${flexibility === '1' ? ' day' : ' days'} flexibility)`
    }

    const gParts: string[] = []
    if (guests.adults) gParts.push(`${guests.adults} ${guests.adults === 1 ? 'adult' : 'adults'}`)
    if (guests.children) gParts.push(`${guests.children} ${guests.children === 1 ? 'child' : 'children'}`)
    if (guests.infants) gParts.push(`${guests.infants} ${guests.infants === 1 ? 'infant' : 'infants'}`)
    const guestStr = gParts.join(' and ')

    const n = orderedProps.length
    const subject = `Property Wishlist Inquiry — ${n} ${n === 1 ? 'property' : 'properties'}`
    let body = `Hi,\n\nI'm interested in the following properties for these dates ${dateStr} and would love to receive more information on availability and pricing. We are ${guestStr}:\n\n`
    orderedProps.forEach((p) => {
      const rate = startingRate(p)
      body += `• ${p.title} — ${p.bedrooms} ${p.bedrooms === 1 ? 'bedroom' : 'bedrooms'}`
      if (rate) body += `, from ${formatPrice(rate)}/night`
      body += '\n'
    })
    const url = getShareUrl()
    if (url) body += `\nWishlist link: ${url}\n`
    body += "\nPlease let us know what's available for our dates. Thank you!"

    closeInqModal()
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <>
      <div id="sv-pg-header">
        <div className="sv-pg-header-row">
          <div>
            <p className="pg-eyebrow">{isShared ? 'Shared with you' : 'Wishlist'}</p>
            <h1 id="sv-heading">{isShared ? 'Shared wishlist' : 'Your wishlist'}</h1>
            <p id="sv-subhead">{mounted && !showEmpty ? (orderedProps.length === 1 ? '1 property' : `${orderedProps.length} properties`) : ''}</p>
          </div>
          {showActions && (
            <div id="sv-actions">
              <button className="sv-btn sv-btn-primary" type="button" onClick={openInqModal}>
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Inquire about all
              </button>
              <div style={{ position: 'relative' }}>
                <button ref={shareBtnRef} className="sv-btn sv-btn-secondary" type="button" onClick={toggleShare}>
                  <svg viewBox="0 0 24 24"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
                  Share wishlist
                </button>
                {mounted && shareOpen && createPortal(
                  <div className="share-menu" style={{ top: shareMenuPos.top, left: shareMenuPos.left }} onClick={(e) => e.stopPropagation()}>
                    <button className="share-menu-item" type="button" onClick={handleCopyLink}>
                      <span className="share-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
                      </span>
                      Copy link
                    </button>
                    <a className="share-menu-item" href={waShareHref} target="_blank" rel="noopener" onClick={() => setShareOpen(false)}>
                      <span className="share-icon">
                        <svg viewBox="0 0 32 32" fill="white"><path d="M16 2.667C8.636 2.667 2.667 8.636 2.667 16a13.258 13.258 0 001.869 6.805L2.667 29.333l6.73-1.764A13.28 13.28 0 0016 29.333c7.364 0 13.333-5.969 13.333-13.333S23.364 2.667 16 2.667zm0 24c-2.152 0-4.266-.565-6.124-1.638l-.437-.258-4.534 1.188 1.209-4.412-.284-.453A10.629 10.629 0 015.333 16C5.333 10.119 10.119 5.333 16 5.333S26.667 10.119 26.667 16 21.881 26.667 16 26.667zm5.848-7.985c-.32-.16-1.896-.936-2.19-1.044-.294-.107-.508-.16-.722.16-.213.32-.826 1.044-1.013 1.258-.187.213-.373.24-.694.08-.32-.16-1.35-.498-2.572-1.59-.95-.848-1.592-1.896-1.778-2.216-.187-.32-.02-.493.14-.652.144-.144.32-.373.48-.56.16-.187.213-.32.32-.534.107-.213.053-.4-.027-.56-.08-.16-.722-1.737-.988-2.376-.26-.624-.525-.54-.722-.55-.186-.01-.4-.013-.614-.013-.213 0-.56.08-.853.4-.293.32-1.12 1.096-1.12 2.672 0 1.576 1.147 3.1 1.307 3.313.16.213 2.256 3.446 5.467 4.832.764.33 1.36.527 1.824.674.767.244 1.465.21 2.016.127.615-.092 1.894-.774 2.16-1.522.267-.747.267-1.388.187-1.522-.08-.133-.293-.213-.613-.373z" /></svg>
                      </span>
                      WhatsApp
                    </a>
                    <a className="share-menu-item" href={smsShareHref} onClick={() => setShareOpen(false)}>
                      <span className="share-icon">
                        <svg viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>
                      </span>
                      iMessage / SMS
                    </a>
                    <a className="share-menu-item" href={telegramShareHref} target="_blank" rel="noopener" onClick={() => setShareOpen(false)}>
                      <span className="share-icon">
                        <svg viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.67 7.87c-.12.58-.46.72-.93.45l-2.56-1.89-1.24 1.19c-.14.14-.26.26-.52.26l.18-2.61 4.74-4.28c.21-.18-.04-.28-.32-.1L7.46 14.8l-2.53-.79c-.55-.17-.56-.55.12-.81l9.88-3.81c.46-.17.86.11.71.81z" /></svg>
                      </span>
                      Telegram
                    </a>
                  </div>,
                  document.body
                )}
              </div>
              {orderedProps.length >= 2 && (
                <a href="#sv-compare" className="sv-btn sv-btn-secondary">
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
                  Compare side by side
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {isShared && (
        <div id="sv-shared-banner">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          You&rsquo;re viewing a <strong>shared wishlist</strong> — tap ♥ on any property to save it to your own list.
        </div>
      )}

      <div id="sv-main">
        {!mounted ? (
          <div id="sv-grid">
            {[0, 1, 2].map((i) => (
              <div className="sv-skeleton" key={i}>
                <div className="sv-skel-photo" />
                <div className="sv-skel-body">
                  <div className="sv-skel-line w60" />
                  <div className="sv-skel-line w80" />
                  <div className="sv-skel-line w60" />
                </div>
              </div>
            ))}
          </div>
        ) : showEmpty ? (
          <div id="sv-empty">
            <div className="sv-empty-icon">
              <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" /></svg>
            </div>
            <h2 className="sv-empty-title">Your wishlist is empty</h2>
            <p className="sv-empty-sub">Browse our collection and tap ♥ on any property to add it to your wishlist.</p>
            <Link href="/villas" className="sv-empty-cta">
              Browse properties
              <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </div>
        ) : (
          <div id="sv-grid">
            {orderedProps.map((p) => (
              <div key={p.slug} className={`sv-card-wrap${removingSlugs.has(p.slug) ? ' is-removing' : ''}`}>
                <PropertyCard property={p} />
              </div>
            ))}
          </div>
        )}
      </div>

      {orderedProps.length >= 2 && (
        <div id="sv-compare">
          <div className="sv-cmp-cue" aria-hidden="true">
            <svg className="sv-cmp-cue-icon" viewBox="0 0 24 34">
              <polyline points="4 3 12 11 20 3" className="c1" />
              <polyline points="4 13 12 21 20 13" className="c2" />
              <polyline points="4 23 12 31 20 23" className="c3" />
            </svg>
          </div>
          <div className="sv-cmp-divider">
            <span className="sv-cmp-divider-badge">Scroll to compare</span>
          </div>
          <div className="sv-cmp-inner">
            <p className="sv-cmp-eyebrow">Comparison</p>
            <h2 className="sec-title">See your wishlist side by side</h2>
            <div className="sv-cmp-scroll">
              <table className="sv-cmp-table">
                <thead>
                  <tr>
                    <th className="sv-cmp-lbl"></th>
                    {orderedProps.map((p) => {
                      const ref = p.heroImage?.asset?._ref
                      return (
                        <th className="sv-cmp-hd" key={p.slug}>
                          <div className="sv-cmp-thumb-wrap">
                            <Link
                              href={`/villas/${p.slug}`}
                              className={`sv-cmp-thumb${ref ? '' : ' sv-cmp-thumb-empty'}`}
                              style={ref ? { backgroundImage: `url('${urlFor(p.heroImage!).width(1200).height(800).quality(90).url()}')` } : undefined}
                            />
                            {!isShared && (
                              <button
                                type="button"
                                className="sv-cmp-remove-btn"
                                onClick={() => handleRemoveFromCompare(p.slug)}
                                aria-label={`Remove ${p.title} from comparison`}
                              >
                                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                              </button>
                            )}
                          </div>
                          <p className="sv-cmp-prop-name">{p.title}</p>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="sv-cmp-lbl">Nightly rate</td>
                    {orderedProps.map((p) => {
                      const r = startingRate(p)
                      return <td className="sv-cmp-val" key={p.slug}>{r ? <span className="is-price">From <strong>{formatPrice(r)}</strong>&thinsp;/&thinsp;night</span> : no()}</td>
                    })}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Bedrooms</td>
                    {orderedProps.map((p) => <td className="sv-cmp-val" key={p.slug}>{p.bedrooms} {p.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</td>)}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Bathrooms</td>
                    {orderedProps.map((p) => <td className="sv-cmp-val" key={p.slug}>{p.bathrooms ? `${p.bathrooms} ${p.bathrooms === 1 ? 'bath' : 'baths'}` : no()}</td>)}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Max guests</td>
                    {orderedProps.map((p) => <td className="sv-cmp-val" key={p.slug}>Up to {p.maxAdults}</td>)}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Views</td>
                    {orderedProps.map((p) => {
                      const v = (p.viewsAndPool || []).filter((k) => VIEW_KEYS_C[k]).map((k) => VIEW_KEYS_C[k])
                      return <td className="sv-cmp-val" key={p.slug}>{v.length ? v.join(', ') : no()}</td>
                    })}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Location</td>
                    {orderedProps.map((p) => {
                      const l = (p.viewsAndPool || []).filter((k) => LOC_KEYS_C[k]).map((k) => LOC_KEYS_C[k])
                      return <td className="sv-cmp-val" key={p.slug}>{l.length ? l.join(', ') : no()}</td>
                    })}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Private pool</td>
                    {orderedProps.map((p) => <td className="sv-cmp-val" key={p.slug}>{(p.viewsAndPool || []).includes('private-pool') ? yes() : no()}</td>)}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Golf cart</td>
                    {orderedProps.map((p) => {
                      const parts: string[] = []
                      if (p.golfCart6Seater) parts.push(`${p.golfCart6Seater}× 6-seater`)
                      if (p.golfCart4Seater) parts.push(`${p.golfCart4Seater}× 4-seater`)
                      return <td className="sv-cmp-val" key={p.slug}>{parts.length ? parts.join(', ') : no()}</td>
                    })}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Membership</td>
                    {orderedProps.map((p) => <td className="sv-cmp-val" key={p.slug}>{p.memberships ? (MEMB_LABELS[p.memberships] || p.memberships) : no()}</td>)}
                  </tr>
                  <tr>
                    <td className="sv-cmp-lbl">Meal preparation</td>
                    {orderedProps.map((p) => <td className="sv-cmp-val" key={p.slug}>{staffMeals(p)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {mounted && toast && createPortal(
        <div id="sv-toast" className="show" role="status" aria-live="polite">{toast}</div>,
        document.body
      )}

      {mounted && inqOpen && createPortal(
        <div id="inq-modal">
          <div className="inq-backdrop" onClick={closeInqModal} />
          <div className="inq-dialog">
            <button className="inq-close" type="button" onClick={closeInqModal} aria-label="Close">&#x2715;</button>
            <span className="inq-eyebrow">Inquiry</span>
            <h3 className="inq-title">Tell us about your trip</h3>

            <div className="inq-sec-hd">
              <span className="inq-sec-label">Check in &nbsp;&#8594;&nbsp; Check out</span>
              <span className="inq-sec-val">{dateDisplay()}</span>
            </div>
            <div className="inq-cal-wrap">
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
                    <button className="dp-clear-btn" type="button" onClick={clearInqDates}>Clear dates</button>
                  </div>
                  {calErr && <p className="inq-flex-err">Please select your check-in and check-out dates.</p>}
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
                    <button className="dp-clear-btn" type="button" onClick={clearInqDates}>Clear</button>
                  </div>
                  {flexErr && <p className="inq-flex-err">Please select a duration and at least one month.</p>}
                </div>
              )}
            </div>

            <hr className="inq-divider" />

            <div className="inq-sec-hd">
              <span className="inq-sec-label">Guests</span>
              <span className="inq-sec-val">{guestsDisplay()}</span>
            </div>
            <div className="inq-guests-wrap">
              {([['adults', 'Adults', 'Ages 13+'], ['children', 'Children', 'Ages 2–13'], ['infants', 'Infants', 'Ages 0–1']] as const).map(([key, label, age]) => (
                <div className="g-row" key={key}>
                  <div className="g-info"><div className="g-type">{label}</div><div className="g-age">{age}</div></div>
                  <div className="g-counter">
                    <button className="ctr-btn" type="button" disabled={guests[key] === 0} onClick={() => step(key, -1)}>&#8722;</button>
                    <span className="ctr-val">{guests[key]}</span>
                    <button className="ctr-btn" type="button" onClick={() => step(key, 1)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            {guestErr && <p className="inq-flex-err" style={{ margin: '12px 0 0', textAlign: 'left' }}>Please add at least one guest.</p>}

            <div className="inq-actions">
              <button className="sv-btn sv-btn-primary inq-submit" type="button" onClick={handleInqSubmit}>
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Send inquiry
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
