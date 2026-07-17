'use client'

import { useState } from 'react'
import Link from 'next/link'

const CONTACT_EMAIL = 'rentals@mexicanreserve.com'

// Same submission approach as ContactForm.tsx: this site has no email-service
// backend wired up yet, so both forms simply open the visitor's email client
// with the details pre-filled, addressed to us. When a real newsletter tool
// (Mailchimp, etc.) gets connected, only this one function needs to change.
export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  // Honeypot: a field real visitors never see or fill in, but simple spam
  // bots that blindly fill every input on a page will. If it comes back
  // non-empty, we quietly drop the submission instead of opening the email
  // client — no CAPTCHA, no extra step for real people.
  const [hp, setHp] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (hp.trim()) return
    if (!email.trim()) return
    const subject = 'Welcome offer — please add me'
    const body = `Hi,\n\nPlease add me to your mailing list (new villas + welcome offer).\n\nEmail: ${email.trim()}\n\nThank you!`
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setEmail('')
  }

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <div className="newsletter-row">
        <input
          id="nl-email"
          type="email"
          required
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="newsletter-input"
          aria-label="Email address"
        />
        <button type="submit" className="newsletter-btn">Claim offer</button>
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

      <label className="newsletter-consent">
        <input type="checkbox" required />
        <span>
          I agree to the <Link href="/privacy-policy" target="_blank">Privacy Policy</Link> and{' '}
          <Link href="/welcome-offer-terms" target="_blank">Welcome Offer Terms</Link>.
        </span>
      </label>
    </form>
  )
}
