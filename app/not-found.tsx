import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="four04-hero">
      <div className="four04-content">
        <p className="four04-eyebrow">Page not found</p>
        <h1 className="four04-title">This page has <em>drifted away</em></h1>
        <p className="four04-sub">The page you&rsquo;re looking for may have moved or no longer exists. Let&rsquo;s get you back to somewhere beautiful.</p>
        <div className="four04-actions">
          <Link href="/villas" className="four04-btn-primary">
            Browse properties
            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
          <Link href="/" className="four04-btn-secondary">Back to homepage</Link>
        </div>
      </div>
    </main>
  )
}
