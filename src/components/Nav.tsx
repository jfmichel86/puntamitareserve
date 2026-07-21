'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

  useEffect(() => {
    if (alwaysDark) return
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [alwaysDark])

  // While the mobile menu is open: lock background scroll (same reasoning
  // as the search sheet), and mark <body> so the floating WhatsApp/offer
  // buttons — which sit outside the nav entirely, at a higher effective
  // z-index than anything inside the nav's own dropdown — can be hidden via
  // CSS instead of rendering on top of the drawer's own links.
  useEffect(() => {
    document.body.classList.toggle('nav-drawer-open', menuOpen)
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.classList.remove('nav-drawer-open')
      document.body.style.overflow = ''
    }
  }, [menuOpen])

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
  }

  const closeMenu = () => { setMenuOpen(false); setMobileDestOpen(false); setMobilePropsOpen(false) }
  const isActive = (href: string) =>
    href === '/villas' ? pathname.startsWith('/villas') : pathname === href
  const isDestActive = pathname.startsWith('/destinations')

  const DESTINATIONS = [
    { href: '/destinations/punta-mita', label: 'Punta Mita — Inside the Gates' },
    { href: '/destinations/punta-de-mita', label: 'Punta de Mita Area' },
    { href: '/destinations/puerto-vallarta', label: 'Puerto Vallarta' },
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
        <div className="nav-logo-text">
          <span className="top">Mexican</span>
          <span className="bottom">Reserve</span>
        </div>
      </Link>

      <ul className="nav-links">
        <li
          className={`nav-dropdown${propsOpen ? ' is-open' : ''}`}
          ref={propsRef}
          onMouseEnter={() => setPropsOpen(true)}
          onMouseLeave={() => setPropsOpen(false)}
        >
          <div className={`nav-dropdown-trigger${isActive('/villas') ? ' active' : ''}`}>
            <Link href="/villas" className="nav-dropdown-trigger-label">Properties</Link>
            <button
              type="button"
              className="nav-dropdown-trigger-caret"
              onClick={() => setPropsOpen((o) => !o)}
              aria-expanded={propsOpen}
              aria-label="Toggle properties menu"
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
                {d.label}
              </Link>
            ))}
          </div>
        </li>
        <li><Link href="/about" className={pathname === '/about' ? 'active' : ''}>About</Link></li>
      </ul>

      <a
        href="https://wa.me/523313619889"
        target="_blank"
        rel="noopener"
        className="nav-whatsapp"
        aria-label="Chat with us on WhatsApp"
      >
        <svg viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        <span>WhatsApp</span>
      </a>

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
          className={`mobile-dropdown-trigger${isActive('/villas') ? ' active' : ''}`}
          onClick={() => setMobilePropsOpen((o) => !o)}
          aria-expanded={mobilePropsOpen}
        >
          Properties
          <svg className={mobilePropsOpen ? 'open' : ''} viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {mobilePropsOpen && (
          <div className="mobile-dropdown-list">
            {PROPERTIES_MENU.map((p) => (
              <Link key={p.href} href={p.href} onClick={closeMenu}>{p.label}</Link>
            ))}
          </div>
        )}
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
              <Link key={d.href} href={d.href} onClick={closeMenu}>{d.label}</Link>
            ))}
          </div>
        )}
        <Link href="/about" onClick={closeMenu}>About</Link>
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
