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

  // Desktop Properties + Destinations dropdowns — both open on hover (mouse
  // enter/leave on the whole <li>); click is kept too, as a fallback for
  // keyboard/touch users who can't hover.
  const [destOpen, setDestOpen] = useState(false)
  const destRef = useRef<HTMLLIElement>(null)
  const [propsOpen, setPropsOpen] = useState(false)
  const propsRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (!destOpen && !propsOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (destOpen && destRef.current && !destRef.current.contains(e.target as Node)) setDestOpen(false)
      if (propsOpen && propsRef.current && !propsRef.current.contains(e.target as Node)) setPropsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [destOpen, propsOpen])

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
    setSearchOpen(false)
    setSearchTerm('')
  }

  const closeMenu = () => { setMenuOpen(false); setMobileDestOpen(false); setMobilePropsOpen(false) }
  const isActive = (href: string) =>
    href === '/villas' ? pathname.startsWith('/villas') : pathname === href
  const isDestActive = pathname.startsWith('/destinations')

  const DESTINATIONS = [
    { href: '/destinations/punta-mita', name: 'Punta Mita', suffix: 'Inside the Gates' },
    { href: '/destinations/punta-de-mita', name: 'Punta de Mita Area', suffix: undefined as string | undefined },
    { href: '/destinations/puerto-vallarta', name: 'Puerto Vallarta', suffix: undefined as string | undefined },
  ]

  const PROPERTIES_MENU = [
    { href: '/villas', label: 'All Properties' },
    { href: '/villas?collection=exceptional-value', label: 'Exceptional Value' },
    { href: '/villas?collection=family-villas', label: 'Family Villas' },
    { href: '/villas?collection=oceanfront', label: 'Oceanfront' },
  ]

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
              <Link key={p.href} href={p.href} onClick={() => setPropsOpen(false)}>
                {p.label}
              </Link>
            ))}
          </div>
        </li>
        <li><Link href="/offers" className={pathname === '/offers' ? 'active' : ''}>Exclusive Deals</Link></li>
        {/* Label reads "The Experience" (renamed from "About") — same /about
            page, which is actually concierge-service and local-expertise
            content, not a company bio, so the old label undersold it. */}
        <li><Link href="/about" className={pathname === '/about' ? 'active' : ''}>The Experience</Link></li>
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
        <button
          type="button"
          className={`mobile-dropdown-trigger${isDestActive ? ' active' : ''}`}
          onClick={() => setMobileDestOpen((o) => !o)}
          aria-expanded={mobileDestOpen}
        >
          Destinations
          <svg className={mobileDestOpen ? 'open' : ''} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
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
        <button
          type="button"
          className={`mobile-dropdown-trigger${isActive('/villas') ? ' active' : ''}`}
          onClick={() => setMobilePropsOpen((o) => !o)}
          aria-expanded={mobilePropsOpen}
        >
          Collections
          <svg className={mobilePropsOpen ? 'open' : ''} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {mobilePropsOpen && (
          <div className="mobile-dropdown-list">
            {PROPERTIES_MENU.map((p) => (
              <Link key={p.href} href={p.href} onClick={closeMenu}>{p.label}</Link>
            ))}
          </div>
        )}
        <Link href="/offers" onClick={closeMenu}>Exclusive Deals</Link>
        <Link href="/about" onClick={closeMenu}>The Experience</Link>
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
