'use client'

import { useState } from 'react'
import Link from 'next/link'

const CONTACT_EMAIL = 'rentals@mexicanreserve.com'

type PanelOpen = 'location' | 'beds' | null

const LOCATION_OPTS = ['Punta Mita', 'Punta de Mita Area', 'Puerto Vallarta', 'Somewhere else in Mexico']
const BEDS_OPTS = ['1–2 bedrooms', '3–4 bedrooms', '5–6 bedrooms', '7+ bedrooms']

export default function OwnerForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')

  const [openPanel, setOpenPanel] = useState<PanelOpen>(null)
  const [location, setLocation] = useState('')
  const [beds, setBeds] = useState('')
  const [locationErr, setLocationErr] = useState(false)

  const [submitErr, setSubmitErr] = useState(false)

  const closeAll = () => setOpenPanel(null)
  const toggle = (p: Exclude<PanelOpen, null>) => setOpenPanel((cur) => (cur === p ? null : p))

  const ddPick = (group: 'location' | 'beds', val: string) => {
    if (group === 'location') { setLocation(val); setLocationErr(false) }
    else setBeds(val)
    closeAll()
  }

  const handleSubmit = () => {
    let valid = true
    if (!name.trim() || !email.trim()) valid = false
    if (!location) { setLocationErr(true); valid = false } else setLocationErr(false)

    if (!valid) { setSubmitErr(true); return }
    setSubmitErr(false)

    const subj = `Property Partnership Inquiry — ${name.trim()}`
    const body = 'Hi,\n\nI\'d like to talk about listing my property with Mexican Reserve.\n\n'
      + `— CONTACT —\nName:   ${name.trim()}\nEmail:  ${email.trim()}\n${phone.trim() ? `Phone:  ${phone.trim()}\n` : ''}`
      + `\n— PROPERTY —\nLocation:  ${location}\n${beds ? `Bedrooms:  ${beds}\n` : ''}`
      + (message.trim() ? `\n— NOTES —\n${message.trim()}\n` : '')
      + '\nThank you!'

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="ct-form-card" onClick={(e) => { if (e.target === e.currentTarget) closeAll() }}>
      <h2 className="ct-form-title">Tell us about your property</h2>
      <p className="ct-trust-line">Personal response &nbsp;·&nbsp; Within 24 hours &nbsp;·&nbsp; No commitment</p>

      <div className="ct-sec-hd first">
        <span className="ct-sec-n">01</span>
        <h3 className="ct-sec-t">About you</h3>
      </div>
      <div className="ct-row ct-row-3">
        <div className="ct-field">
          <label htmlFor="o-name">Name</label>
          <input className="ct-input" type="text" id="o-name" placeholder="Jane Smith" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="ct-field">
          <label htmlFor="o-email">Email</label>
          <input className="ct-input" type="email" id="o-email" placeholder="jane@example.com" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="ct-field">
          <label htmlFor="o-phone">WhatsApp / Phone <span className="opt">(optional)</span></label>
          <input className="ct-input" type="tel" id="o-phone" placeholder="+1 555 000 0000" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="ct-sec-hd">
        <span className="ct-sec-n">02</span>
        <h3 className="ct-sec-t">Your property</h3>
      </div>
      <div className="ct-row ct-row-2" style={{ alignItems: 'start' }}>
        <div className="ct-field">
          <label>Location</label>
          <button className={`ct-dd-trigger${openPanel === 'location' ? ' is-open' : ''}`} type="button" onClick={() => toggle('location')}>
            <span className={`ct-dd-val${location ? '' : ' ph'}`}>{location || 'Select…'}</span>
            <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openPanel === 'location' && (
            <div className="ct-dd-panel">
              {LOCATION_OPTS.map((opt) => (
                <div key={opt} className={`ct-dd-opt${location === opt ? ' is-sel' : ''}`} onClick={() => ddPick('location', opt)}>{opt}</div>
              ))}
            </div>
          )}
          {locationErr && <p className="ct-field-err">Required.</p>}
        </div>
        <div className="ct-field">
          <label>Bedrooms <span className="opt">(optional)</span></label>
          <button className={`ct-dd-trigger${openPanel === 'beds' ? ' is-open' : ''}`} type="button" onClick={() => toggle('beds')}>
            <span className={`ct-dd-val${beds ? '' : ' ph'}`}>{beds || 'Select…'}</span>
            <svg className="ff-arrow" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          {openPanel === 'beds' && (
            <div className="ct-dd-panel">
              {BEDS_OPTS.map((opt) => (
                <div key={opt} className={`ct-dd-opt${beds === opt ? ' is-sel' : ''}`} onClick={() => ddPick('beds', opt)}>{opt}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="ct-sec-hd">
        <span className="ct-sec-n">03</span>
        <h3 className="ct-sec-t">Anything else?</h3>
      </div>
      <div className="ct-field">
        <label htmlFor="o-message">Optional note <span className="opt">(current management, availability, anything we should know)</span></label>
        <textarea className="ct-input" id="o-message" placeholder="Tell us about your property and what you're looking for." value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>

      <div className="ct-submit-row">
        <button className="ct-submit-btn" type="button" onClick={handleSubmit}>
          <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
          Send inquiry
        </button>
        {submitErr && <p id="ct-err">Please fill in all required fields before sending.</p>}
        <div className="ct-submit-footer">
          <p className="ct-submit-note">Opens your email client with your details pre-filled. We reply within 24 hours.</p>
          <p className="ct-privacy-note">
            <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Your information is never shared with third parties.
          </p>
          <p className="ct-legal-note">By sending this inquiry you agree to our <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms-and-conditions">Terms and Conditions</Link>.</p>
        </div>
      </div>
    </div>
  )
}
