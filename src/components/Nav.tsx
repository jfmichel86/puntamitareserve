'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Logo from './Logo'

export default function Nav() {
  const pathname = usePathname()
  const alwaysDark = pathname !== '/'

  // "scrolled" only ever becomes true from an actual scroll event on the
  // homepage — it drives the padding-shrink. Non-homepage pages get the dark
  // background via alwaysDark instead, without ever shrinking the nav.
  const [scrolled, setScrolled] = useState(false)
  const isDark = alwaysDark || scrolled
  const [menuOpen, setMenuOpen] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  // Global property search — collapses to a single icon in the nav bar;
  // clicking it opens a small dropdown panel below it, same pattern as the
  // Destinations/Collections menus. Submitting routes to /villas?q=...
  // where VillasClient does the actual matching against villa name /
  // community / destination.
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (alwaysDark) return
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [alwaysDark])

  // While the mobile menu is open: lock background scroll, and mark <body>
  // so the floating WhatsApp/offer buttons — which sit outside the nav
  // entirely, at a higher effective z-index than anything inside the nav's
  // own dropdown — can be hidden via CSS instead of rendering on top of the
  // drawer's own links. The search panel doesn't need this: like the
  // Destinations/Collections dropdowns, it's a small anchored panel that
  // never covers the page.
  useEffect(() => {
    document.body.classList.toggle('nav-drawer-open', menuOpen)
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.classList.remove('nav-drawer-open')
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  // Focus the field the moment it appears, and close on an outside click —
  // same pattern as the Destinations/Collections dropdowns below.
  useEffect(() => {
    if (!searchOpen) return
    searchInputRef.current?.focus()
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    const term = searchTerm.trim()
    if (!term) return
    router.push(`/villas?q=${encodeURIComponent(term)}`)
    setSearchOpen(false)
  }

  useEffect(() => {
    const refreshSaved = () => {
      const count = Object.keys(localStorage).filter(
        (k) => k.startsWith('saved-') && localStorage.getItem(k) === '1'
      ).length
      setSavedCount(count)
    }
    refreshSaved()
    window.addEventListener('storage', refreshSaved)
    window.addEventListener('saved-changed', refreshSaved)
    return () => {
      window.removeEventListener('storage', refreshSaved)
      window.removeEventListener('saved-changed', refreshSaved)
    }
  }, [])

  const [mobileDestOpen, setMobileDestOpen] = useState(false)
  const [mobilePropsOpen, setMobilePropsOpen] = useState(false)
  const [mobileExpOpen, setMobileExpOpen] = useState(false)

  // Desktop Properties + Destinations dropdowns — both open on hover (mouse
  // enter/leave on the whole <li>); click is kept too, as a fallback for
  // keyboard/touch users who can't hover.
  const [destOpen, setDestOpen] = useState(false)
  const destRef = useRef<HTMLLIElement>(null)
  const [propsOpen, setPropsOpen] = useState(false)
  const propsRef = useRef<HTMLLIElement>(null)
  // "The Experience" — same hover-dropdown pattern as Destinations/
  // Collections, added when The Journal needed a real nav entry point
  // alongside Concierge & Experiences, rather than adding a 4th top-level
  // link and crowding the header further.
  const [expOpen, setExpOpen] = useState(false)
  const expRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!destOpen && !propsOpen && !expOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (destOpen && destRef.current && !destRef.current.contains(e.target as Node)) setDestOpen(false)
      if (propsOpen && propsRef.current && !propsRef.current.contains(e.target as Node)) setPropsOpen(false)
      if (expOpen && expRef.current && !expRef.current.contains(e.target as Node)) setExpOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [destOpen, propsOpen, expOpen])

  // Close both dropdowns on any navigation (Nav persists across route
  // changes in the App Router, so it won't unmount and reset on its own).
  // Adjusting state during render on a pathname change, per React's
  // guidance, instead of an effect that would just call setState
  // unconditionally.
  const [destOpenForPath, setDestOpenForPath] = useState(pathname)
  if (pathname !== destOpenForPath) {
    setDestOpenForPath(pathname)
    setDestOpen(false)
    setPropsOpen(false)
    setExpOpen(false)
    setSearchOpen(false)
    setSearchTerm('')
  }

  const closeMenu = () => { setMenuOpen(false); setMobileDestOpen(false); setMobilePropsOpen(false); setMobileExpOpen(false) }
  const isActive = (href: string) =>
    // /offers now lives inside the Collections menu (see PROPERTIES_MENU),
    // so the Collections trigger should still light up as "active" when
    // you're actually on the Exclusive Deals page.
    href === '/villas' ? (pathname.startsWith('/villas') || pathname === '/offers') : pathname === href
  const DESTINATIONS = [
    { href: '/punta-mita', name: 'Punta Mita', suffix: 'Inside the Gates' },
    { href: '/punta-de-mita', name: 'Punta de Mita Area', suffix: undefined as string | undefined },
    { href: '/puerto-vallarta', name: 'Puerto Vallarta', suffix: undefined as string | undefined },
  ]
  // Destination guide pages now live at short, root-level URLs (/punta-mita,
  // not /destinations/punta-mita) rather than under one shared /destinations
  // prefix, so this can no longer be a simple pathname.startsWith check —
  // it has to test against each destination's own href (and the /destinations
  // hub page itself, plus Punta Mita's nested /communities page) individually.
  const isDestActive =
    pathname === '/destinations' ||
    DESTINATIONS.some((d) => pathname === d.href || pathname.startsWith(`${d.href}/`))

  const PROPERTIES_MENU = [
    // "All Properties" used to lead here too — removed as a dead duplicate:
    // the "Collections" trigger label itself already links to /villas, so
    // clicking the word above this list does exactly what that item did.
    { href: '/villas?collection=exceptional-value', label: 'Exceptional Value' },
    { href: '/villas?collection=family-villas', label: 'Family Villas' },
    { href: '/villas?collection=oceanfront', label: 'Oceanfront' },
    // Not a /villas filter like the others above — this points at the
    // standalone /offers page (limited-time rates, Pay 3 Stay 4, etc).
    // Folded in here instead of keeping its own top-level nav slot: it
    // still gets a real entry point in the Collections menu without
    // adding a 5th item to an already-crowded header. `deal: true` gives
    // it its own visual treatment (see .nav-dropdown-panel a.is-deal in
    // globals.css) since it's a different kind of thing from the property
    // collections above it, not just another one of them.
    { href: '/offers', label: 'Exclusive Deals', deal: true },
  ]

  // "The Experience" dropdown — trigger now links to /experience, a short
  // hub page listing all four items below, instead of jumping straight to
  // one of them (Francisco's call, 2026-08-31: the old direct link to
  // /about broke the pattern every other dropdown follows — Destinations'
  // trigger goes to the /destinations hub, Collections' to /villas — so
  // clicking the word itself should land somewhere that contains the whole
  // menu, not skip straight to one item). /about used to BE the guest-
  // journey content directly; that content now lives at /guest-journey,
  // and /about became a real, separate About Us page — so both need their
  // own entry here now.
  const EXPERIENCE_MENU = [
    { href: '/guest-journey', label: 'The Guest Journey' },
    { href: '/experiences', label: 'Concierge & Experiences' },
    { href: '/journal', label: 'The Journal' },
    { href: '/about', label: 'About Us' },
  ]
  const isExpActive =
    pathname === '/experience' || pathname === '/guest-journey' ||
    pathname === '/experiences' || pathname.startsWith('/journal') || pathname === '/about'

  return (
    <nav className={`nav${isDark ? ' nav--dark' : ''}${scrolled ? ' nav--scrolled' : ''}`}>
      <Link href="/" className="nav-logo" onClick={closeMenu}>
        <Logo />
      </Link>

      <ul className="nav-links">
        <li
          className={`nav-dropdown${destOpen ? ' is-open' : ''}`}
          ref={destRef}
          onMouseEnter={() => setDestOpen(true)}
          onMouseLeave={() => setDestOpen(false)}
        >
          <div className={`nav-dropdown-trigger${isDestActive ? ' active' : ''}`}>
            <Link href="/destinations" className="nav-dropdown-trigger-label">Destinations</Link>
            <button
              type="button"
              className="nav-dropdown-trigger-caret"
              onClick={() => setDestOpen((o) => !o)}
              aria-expanded={destOpen}
              aria-label="Toggle destinations menu"
            >
              <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <div className="nav-dropdown-panel">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className={pathname === d.href ? 'is-sel' : ''}
                onClick={() => setDestOpen(false)}
              >
                {d.name}
                {d.suffix && <span className="nav-dest-suffix"> — {d.suffix}</span>}
              </Link>
            ))}
          </div>
        </li>
        <li
          className={`nav-dropdown${propsOpen ? ' is-open' : ''}`}
          ref={propsRef}
          onMouseEnter={() => setPropsOpen(true)}
          onMouseLeave={() => setPropsOpen(false)}
        >
          <div className={`nav-dropdown-trigger${isActive('/villas') ? ' active' : ''}`}>
            {/* Label reads "Collections" (renamed from "Properties") — same
                dropdown underneath, still leading to /villas. "Collections"
                surfaces the curated groupings (Exceptional Value, Family
                Villas, Oceanfront) as the headline idea instead of a flat
                "browse everything" label competing with the search bar. */}
            <Link href="/villas" className="nav-dropdown-trigger-label">Collections</Link>
            <button
              type="button"
              className="nav-dropdown-trigger-caret"
              onClick={() => setPropsOpen((o) => !o)}
              aria-expanded={propsOpen}
              aria-label="Toggle collections menu"
            >
              <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <div className="nav-dropdown-panel">
            {PROPERTIES_MENU.map((p) => (
              <Link key={p.href} href={p.href} className={p.deal ? 'is-deal' : ''} onClick={() => setPropsOpen(false)}>
                {p.deal ? (
                  <span className="nav-deal-inner">
                    <svg className="nav-deal-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span className="nav-deal-text">
                      <span className="nav-deal-label">{p.label}</span>
                      {/* Deliberately generic, not a specific %/date — the
                          actual offers on /offers change over time, and a
                          hardcoded number here would go stale. */}
                      <span className="nav-deal-sub">Limited-time rates</span>
                    </span>
                  </span>
                ) : p.label}
              </Link>
            ))}
          </div>
        </li>
        {/* Label reads "The Experience" (renamed from "About") — same /about
            page, which is actually concierge-service and local-expertise
            content, not a company bio, so the old label undersold it. Now a
            dropdown (same pattern as Destinations/Collections) so Concierge
            & Experiences and The Journal both get a real nav entry point. */}
        <li
          className={`nav-dropdown${expOpen ? ' is-open' : ''}`}
          ref={expRef}
          onMouseEnter={() => setExpOpen(true)}
          onMouseLeave={() => setExpOpen(false)}
        >
          <div className={`nav-dropdown-trigger${isExpActive ? ' active' : ''}`}>
            <Link href="/experience" className="nav-dropdown-trigger-label">The Experience</Link>
            <button
              type="button"
              className="nav-dropdown-trigger-caret"
              onClick={() => setExpOpen((o) => !o)}
              aria-expanded={expOpen}
              aria-label="Toggle experience menu"
            >
              <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
          </div>
          <div className="nav-dropdown-panel">
            {EXPERIENCE_MENU.map((e) => (
              <Link key={e.href} href={e.href} className={pathname === e.href ? 'is-sel' : ''} onClick={() => setExpOpen(false)}>
                {e.label}
              </Link>
            ))}
          </div>
        </li>
      </ul>

      {/* Global search — collapsed to an icon by default. Expanding it opens
          a small dropdown panel below the icon (same visual language as the
          Destinations/Collections panels above), so the rest of the nav —
          links, wishlist, Inquire — stays exactly as it is; nothing shifts
          or hides to make room. A small pointer/caret (::before on
          .nav-search-form) visually connects the panel back to the icon it
          came from, and there's just the one close (X) action — pressing
          Enter in the single text field submits the form on its own, no
          separate magnifying-glass button needed. */}
      <div className="nav-search" ref={searchRef}>
        {searchOpen ? (
          <form className="nav-search-form" onSubmit={submitSearch}>
            <input
              ref={searchInputRef}
              type="text"
              className="nav-search-input"
              placeholder="Search villas, communities, destinations…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setSearchOpen(false) }}
            />
            <button type="button" className="nav-search-close" aria-label="Close search" onClick={() => setSearchOpen(false)}>
              <svg viewBox="0 0 24 24"><line x1="5" y1="5" x2="19" y2="19" /><line x1="19" y1="5" x2="5" y2="19" /></svg>
            </button>
          </form>
        ) : (
          <button type="button" className="nav-search-toggle" aria-label="Search properties" onClick={() => setSearchOpen(true)}>
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          </button>
        )}
      </div>

      {/* WhatsApp was removed from here — redundant with the Inquire button
          right next to it, and with the floating sticky WhatsApp button that
          persists on every page regardless of scroll position. Same reasoning
          already applied to the mobile drawer below. */}
      {savedCount > 0 && (
        <Link href="/saved" className="nav-saved-link" style={{ display: 'flex' }} aria-label="Wishlist">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span className="nav-saved-count">{savedCount} in wishlist</span>
        </Link>
      )}

      <Link href="/contact" className="nav-cta">Inquire</Link>

      <button
        className={`nav-hamburger${menuOpen ? ' open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Open menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`}>
        {/* Split into a real link (the word itself, so tapping it goes
            straight to /destinations) plus a separate small caret button
            for expand/collapse — this used to be one <button> that only
            ever toggled the list, so there was no way to actually get to
            the Destinations overview page from the mobile menu at all
            (Francisco's report, 2026-08-09). Same split desktop's
            .nav-dropdown-trigger already uses, for the same reason. */}
        <div className={`mobile-dropdown-trigger${isDestActive ? ' active' : ''}`}>
          <Link href="/destinations" className="mobile-dropdown-trigger-label" onClick={closeMenu}>
            Destinations
          </Link>
          <button
            type="button"
            className="mobile-dropdown-trigger-caret"
            onClick={() => setMobileDestOpen((o) => !o)}
            aria-expanded={mobileDestOpen}
            aria-label="Toggle destinations list"
          >
            <svg className={mobileDestOpen ? 'open' : ''} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        {mobileDestOpen && (
          <div className="mobile-dropdown-list">
            {DESTINATIONS.map((d) => (
              <Link key={d.href} href={d.href} onClick={closeMenu}>
                {d.name}
                {d.suffix && <span className="nav-dest-suffix"> — {d.suffix}</span>}
              </Link>
            ))}
          </div>
        )}
        <div className={`mobile-dropdown-trigger${isActive('/villas') ? ' active' : ''}`}>
          <Link href="/villas" className="mobile-dropdown-trigger-label" onClick={closeMenu}>
            Collections
          </Link>
          <button
            type="button"
            className="mobile-dropdown-trigger-caret"
            onClick={() => setMobilePropsOpen((o) => !o)}
            aria-expanded={mobilePropsOpen}
            aria-label="Toggle collections list"
          >
            <svg className={mobilePropsOpen ? 'open' : ''} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        {mobilePropsOpen && (
          <div className="mobile-dropdown-list">
            {PROPERTIES_MENU.map((p) => (
              <Link key={p.href} href={p.href} className={p.deal ? 'is-deal' : ''} onClick={closeMenu}>
                {p.deal ? (
                  <span className="nav-deal-inner">
                    <svg className="nav-deal-icon" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z" />
                      <line x1="7" y1="7" x2="7.01" y2="7" />
                    </svg>
                    <span className="nav-deal-text">
                      <span className="nav-deal-label">{p.label}</span>
                      <span className="nav-deal-sub">Limited-time rates</span>
                    </span>
                  </span>
                ) : p.label}
              </Link>
            ))}
          </div>
        )}
        <div className={`mobile-dropdown-trigger${isExpActive ? ' active' : ''}`}>
          <Link href="/experience" className="mobile-dropdown-trigger-label" onClick={closeMenu}>
            The Experience
          </Link>
          <button
            type="button"
            className="mobile-dropdown-trigger-caret"
            onClick={() => setMobileExpOpen((o) => !o)}
            aria-expanded={mobileExpOpen}
            aria-label="Toggle experience list"
          >
            <svg className={mobileExpOpen ? 'open' : ''} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
        </div>
        {mobileExpOpen && (
          <div className="mobile-dropdown-list">
            {EXPERIENCE_MENU.map((e) => (
              <Link key={e.href} href={e.href} onClick={closeMenu}>{e.label}</Link>
            ))}
          </div>
        )}
        {savedCount > 0 && (
          <Link href="/saved" onClick={closeMenu}>Wishlist ({savedCount})</Link>
        )}
        {/* WhatsApp Us was redundant here — Inquire already leads to a
            dedicated contact page that offers WhatsApp as one of its own
            quick-contact options (see ContactForm.tsx's .ct-quick-icon.wa),
            so this menu doesn't need to duplicate that entry point. */}
        <Link href="/contact" onClick={closeMenu} className="mobile-drawer-cta">Inquire</Link>
      </div>
    </nav>
  )
}
