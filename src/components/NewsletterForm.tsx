'use client'

import { useState } from 'react'
import Link from 'next/link'

// Fallback address shown only if saving the signup fails (welcome@ is an
// alias of the main inbox, kept separate from rental inquiries).
const CONTACT_EMAIL = 'welcome@mexicanreserve.com'

type Status = 'idle' | 'sending' | 'done' | 'error' | 'invalid'

// Saves the signup straight to Brevo (via /api/subscribe), which then sends
// the welcome email automatically. No email app opens for the visitor.
export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  // Honeypot: a field real visitors never see or fill in, but simple spam
  // bots that blindly fill every input on a page will. The server quietly
  // ignores any submission where it comes back non-empty.
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), company: hp }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) { setStatus('done'); setEmail(''); return }
      setStatus(data.error === 'invalid_email' ? 'invalid' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="newsletter-done" role="status">
        <p className="newsletter-done-title">Welcome to Mexican Reserve.</p>
        <p className="newsletter-done-text">
          Your welcome offer is on its way. Please check your inbox, and your promotions or spam folder
          just in case.
        </p>
      </div>
    )
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate={false}>
      <div className="newsletter-row">
        <input
          id="nl-email"
          type="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === 'invalid' || status === 'error') setStatus('idle') }}
          className="newsletter-input"
          aria-label="Email address"
          aria-invalid={status === 'invalid'}
          aria-describedby={status === 'invalid' || status === 'error' ? 'nl-msg' : undefined}
        />
        <button type="submit" className="newsletter-btn" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Claim offer'}
        </button>
      </div>

      <div className="hp-field" aria-hidden="true">
        <label htmlFor="nl-company">Company</label>
        <input
          id="nl-company"
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
      </div>

      {status === 'invalid' && (
        <p id="nl-msg" className="newsletter-msg" role="alert">Please check your email address and try again.</p>
      )}
      {status === 'error' && (
        <p id="nl-msg" className="newsletter-msg" role="alert">
          Something went wrong on our side. Please try again, or write to us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Welcome offer')}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}

      <label className="newsletter-consent">
        <input type="checkbox" required />
        <span>
          Yes, send me emails about new villas and offers. I agree to the{' '}
          <Link href="/privacy-policy" target="_blank">Privacy Policy</Link> and{' '}
          <Link href="/welcome-offer-terms" target="_blank">Welcome Offer Terms</Link>.
        </span>
      </label>
    </form>
  )
}
