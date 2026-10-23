// Welcome Offer signups: the newsletter form on every page posts the
// visitor's email here, and this adds them to the "Welcome Offer" list in
// Brevo. Adding someone to that list is what triggers Brevo's automatic
// welcome email (set up inside Brevo, not in this code).
//
// The Brevo API key lives ONLY in Vercel's Environment Variables
// (BREVO_API_KEY) — never in this file — because this code is public on
// GitHub and the key works like a password to the Brevo account.

const BREVO_URL = 'https://api.brevo.com/v3/contacts'
// "Welcome Offer" list in Brevo (Contacts → Lists, ID #3).
const WELCOME_LIST_ID = Number(process.env.BREVO_WELCOME_LIST_ID || 3)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: Request) {
  let body: { email?: unknown; company?: unknown }
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  // Honeypot field (invisible to people). Bots that fill it get a fake
  // "success" so they don't retry, but nothing is saved.
  if (typeof body.company === 'string' && body.company.trim()) {
    return Response.json({ ok: true })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return Response.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.error('[subscribe] BREVO_API_KEY is not set')
    return Response.json({ ok: false, error: 'not_configured' }, { status: 500 })
  }

  try {
    const res = await fetch(BREVO_URL, {
      method: 'POST',
      headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
      // updateEnabled: someone already in Brevo (e.g. a past guest) is
      // simply added to the list instead of causing an error.
      body: JSON.stringify({ email, listIds: [WELCOME_LIST_ID], updateEnabled: true }),
    })
    // 201 = new contact, 204 = existing contact updated — both are success.
    if (res.status === 201 || res.status === 204) {
      return Response.json({ ok: true })
    }
    const detail = await res.text()
    console.error('[subscribe] Brevo error', res.status, detail)
    const badEmail = res.status === 400 && /email/i.test(detail)
    return Response.json({ ok: false, error: badEmail ? 'invalid_email' : 'upstream' }, { status: badEmail ? 400 : 502 })
  } catch (err) {
    console.error('[subscribe] network error', err)
    return Response.json({ ok: false, error: 'upstream' }, { status: 502 })
  }
}
