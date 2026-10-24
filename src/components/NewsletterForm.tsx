'use client'

import { useState } from 'react'
import Link from 'next/link'

// Fallback address shown only if saving the signup fails (welcome@ is an
// alias of the main inbox, kept separate from rental inquiries).
const CONTACT_EMAIL = 'welcome@mexicanreserve.com'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Status = 'idle' | 'sending' | 'done' | 'error' | 'missing_name' | 'invalid' | 'need_consent'

// On-brand messages instead of the browser's grey "Please fill out this
// field" bubbles (the form uses noValidate and checks fields itself).
const MESSAGES: Partial<Record<Status, string>> = {
  missing_name: 'Please enter your first and last name.',
  invalid: 'Please enter a valid email address.',
  need_consent: 'Please tick the box above to agree before claiming your offer.',
}

// Saves the signup straight to Brevo (via /api/subscribe), which then sends
// the welcome email automatically. No email app opens for the visitor.
// Layout follows the order people fill it in: names, email, consent, then
// the button as the final step.
export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [consent, setConsent] = useState(false)
  // Honeypot: a field real visitors never see or fill in, but simple spam
  // bots that blindly fill every input on a page will. The server quietly
  // ignores any submission where it comes back non-empty.
  const [hp, setHp] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  // Typing in a field clears the message once it's been addressed.
  const clearIf = (...which: Status[]) => { if (which.includes(status)) setStatus('idle') }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return
    if (!firstName.trim() || !lastName.trim()) { setStatus('missing_name'); return }
    if (!EMAIL_RE.test(email.trim())) { setStatus('invalid'); return }
    if (!consent) { setStatus('need_consent'); return }
    setStatus('sending')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim(), lastName: lastName.trim(), company: hp }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.ok) {
        setStatus('done'); setEmail(''); setFirstName(''); setLastName(''); setConsent(false)
        return
      }
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

  const message = MESSAGES[status]

  return (
    <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
      <div className="newsletter-names">
        <input
          id="nl-first"
          type="text"
          maxLength={60}
          autoComplete="given-name"
          placeholder="First name"
          value={firstName}
          onChange={(e) => { setFirstName(e.target.value); clearIf('missing_name') }}
          className="newsletter-input"
          aria-label="First name"
          aria-invalid={status === 'missing_name' && !firstName.trim()}
          aria-describedby={message ? 'nl-msg' : undefined}
        />
        <input
          id="nl-last"
          type="text"
          maxLength={60}
          autoComplete="family-name"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => { setLastName(e.target.value); clearIf('missing_name') }}
          className="newsletter-input"
          aria-label="Last name"
          aria-invalid={status === 'missing_name' && !lastName.trim()}
          aria-describedby={message ? 'nl-msg' : undefined}
        />
      </div>

      <input
        id="nl-email"
        type="email"
        autoComplete="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => { setEmail(e.target.value); clearIf('invalid', 'error') }}
        className="newsletter-input newsletter-email"
        aria-label="Email address"
        aria-invalid={status === 'invalid'}
        aria-describedby={message ? 'nl-msg' : undefined}
      />

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

      <label className="newsletter-consent">
        <input
          id="nl-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => { setConsent(e.target.checked); clearIf('need_consent') }}
          aria-invalid={status === 'need_consent'}
        />
        <span>
          Yes, send me emails about new villas and offers. I agree to the{' '}
          <Link href="/privacy-policy" target="_blank">Privacy Policy</Link> and{' '}
          <Link href="/welcome-offer-terms" target="_blank">Welcome Offer Terms</Link>.
        </span>
      </label>

      {message && (
        <p id="nl-msg" className="newsletter-msg" role="alert">{message}</p>
      )}
      {status === 'error' && (
        <p id="nl-msg" className="newsletter-msg" role="alert">
          Something went wrong on our side. Please try again, or write to us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Welcome offer')}`}>{CONTACT_EMAIL}</a>.
        </p>
      )}

      <button type="submit" className="newsletter-btn newsletter-btn--block" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Claim offer'}
      </button>
    </form>
  )
}
