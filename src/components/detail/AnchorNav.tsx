'use client'

import { useEffect, useRef, useState } from 'react'

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'amenities', label: 'Amenities' },
  { id: 'staff', label: 'Staff' },
  { id: 'rates', label: 'Rates' },
  { id: 'location', label: 'Location' },
]

export default function AnchorNav() {
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState('overview')
  const anchorRef = useRef<HTMLDivElement>(null)

  // This bar was pinned at a hardcoded top:92px in CSS (see globals.css),
  // matching the main nav's usual height — but that height isn't actually
  // constant (it wraps at some widths, grows when the wishlist count is
  // showing), so on any screen where the real nav was shorter than 92px,
  // a blank strip of page showed between the two bars; where it was taller,
  // this bar sat partly hidden underneath it. A ResizeObserver keeps this
  // bar pinned to the nav's true, current height instead of a guess, on
  // every screen and every state.
  useEffect(() => {
    const navEl = document.querySelector('.nav') as HTMLElement | null
    if (!navEl || !anchorRef.current) return
    const sync = () => {
      if (anchorRef.current) anchorRef.current.style.top = `${navEl.getBoundingClientRect().height}px`
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(navEl)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const show = window.scrollY > 380
      setVisible(show)
      document.body.classList.toggle('an-visible', show)

      let current = 'overview'
      SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top < 170) current = id
      })
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      document.body.classList.remove('an-visible')
    }
  }, [])

  // A flat scroll-margin-top guess (the previous approach) assumed a fixed
  // nav height, but the main nav isn't always the same height — it wraps
  // onto a second line at some widths, and grows when the wishlist count is
  // showing — so a static number was right on some screens and wrong on
  // others (landing under the bars instead of clear of them). Measuring
  // .nav and .anchor-nav's actual rendered height at click time is correct
  // on every screen, no matter what's currently making the nav taller or
  // shorter.
  const scrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const navH = document.querySelector('.nav')?.getBoundingClientRect().height || 0
    const anchorNavH = document.querySelector('.anchor-nav')?.getBoundingClientRect().height || 0
    const BREATHING_ROOM = 20
    const top = el.getBoundingClientRect().top + window.scrollY - navH - anchorNavH - BREATHING_ROOM
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <div ref={anchorRef} className={`anchor-nav${visible ? ' visible' : ''}`} role="navigation" aria-label="Page sections">
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className={`an-link${active === s.id ? ' active' : ''}`}
          onClick={(e) => scrollTo(e, s.id)}
        >
          {s.label}
        </a>
      ))}
    </div>
  )
}
