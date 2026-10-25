// Wishlist inquiries: the "Inquire about all" pop-up on the wishlist page
// posts here, and this sends two emails through Brevo:
//   1. To the team (rentals@) — the full inquiry. Hitting Reply in the inbox
//      replies straight to the guest.
//   2. To the guest — a short branded confirmation that it arrived.
//
// The email wording is built HERE on the server (not in the visitor's
// browser) so nobody can use this to send arbitrary messages.
//
// Uses the same BREVO_API_KEY saved in Vercel for the newsletter. The sender
// address must be listed in Brevo → Senders, Domains & IPs → Senders.

const BREVO_SEND_URL = 'https://api.brevo.com/v3/smtp/email'
const TEAM_EMAIL = process.env.INQUIRY_TO_EMAIL || 'rentals@mexicanreserve.com'
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'rentals@mexicanreserve.com'
const SITE_URL = 'https://www.mexicanreserve.com'
const WHATSAPP_URL = 'https://wa.me/523313619889'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SLUG_RE = /^[a-z0-9-]{1,80}$/

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : ''

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

type Prop = { title: string; slug: string; bedrooms: number; rate: number | null }

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US')

async function send(apiKey: string, payload: Record<string, unknown>) {
  const res = await fetch(BREVO_SEND_URL, {
    method: 'POST',
    headers: { 'api-key': apiKey, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`)
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ ok: false, error: 'invalid' }, { status: 400 })
  }

  // Honeypot (invisible to people): bots get a fake success, nothing is sent.
  if (typeof body.company === 'string' && body.company.trim()) {
    return Response.json({ ok: true })
  }

  const firstName = clean(body.firstName, 60)
  const lastName = clean(body.lastName, 60)
  const email = clean(body.email, 254).toLowerCase()
  const phone = clean(body.phone, 40)
  const dates = clean(body.dates, 300)
  const guests = clean(body.guests, 120)
  const season = clean(body.season, 60)

  if (!firstName || !lastName) return Response.json({ ok: false, error: 'missing_name' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return Response.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  if (!dates || !guests) return Response.json({ ok: false, error: 'invalid' }, { status: 400 })

  const props: Prop[] = (Array.isArray(body.properties) ? body.properties : [])
    .slice(0, 30)
    .map((p: Record<string, unknown>) => ({
      title: clean(p?.title, 100),
      slug: clean(p?.slug, 80),
      bedrooms: Math.max(0, Math.min(50, Number(p?.bedrooms) || 0)),
      rate: Number(p?.rate) > 0 ? Math.min(Number(p.rate), 1_000_000) : null,
    }))
    .filter((p: Prop) => p.title && SLUG_RE.test(p.slug))
  if (props.length === 0) return Response.json({ ok: false, error: 'invalid' }, { status: 400 })

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.error('[inquiry] BREVO_API_KEY is not set')
    return Response.json({ ok: false, error: 'not_configured' }, { status: 500 })
  }

  const fullName = `${firstName} ${lastName}`
  const n = props.length
  const villasWord = n === 1 ? 'property' : 'properties'
  const wishlistUrl = `${SITE_URL}/saved?props=${props.map((p) => p.slug).join(',')}`
  const bedroomsTxt = (b: number) => `${b} ${b === 1 ? 'bedroom' : 'bedrooms'}`

  /* ── 1. Team email — same wording as the old email-app version ───────── */
  const lines = props.map((p) => {
    let l = `• ${p.title} — ${bedroomsTxt(p.bedrooms)}`
    if (p.rate) l += `, from ${usd(p.rate)} USD/night`
    return l
  })
  const seasonNote = season ? ` (rates below reflect ${season})` : ''
  const teamText =
    `Hi,\n\nI'm interested in the following properties for these dates ${dates} and would love to receive more information on availability and pricing${seasonNote}. We are ${guests}:\n\n` +
    lines.join('\n') +
    `\n\nWishlist link: ${wishlistUrl}\n\nPlease let us know what's available for our dates. Thank you!\n\n` +
    `—\n${fullName}\n${email}${phone ? `\n${phone}` : ''}\n\nSent from the wishlist page at mexicanreserve.com. Reply to this email to answer ${firstName} directly.`

  const font = 'font-family:Helvetica,Arial,sans-serif;'
  const teamHtml = `<div style="${font}font-size:15px;line-height:1.65;color:#33363B;max-width:640px;">
<p>Hi,</p>
<p>I'm interested in the following properties for these dates <strong>${esc(dates)}</strong> and would love to receive more information on availability and pricing${esc(seasonNote)}. We are <strong>${esc(guests)}</strong>:</p>
<ul style="padding-left:20px;margin:0 0 16px;">${props
    .map((p) => `<li style="margin-bottom:4px;"><a href="${SITE_URL}/villas/${p.slug}" style="color:#1E3A50;">${esc(p.title)}</a> — ${bedroomsTxt(p.bedrooms)}${p.rate ? `, from ${usd(p.rate)} USD/night` : ''}</li>`)
    .join('')}</ul>
<p>Wishlist link: <a href="${wishlistUrl}" style="color:#1E3A50;">${esc(wishlistUrl)}</a></p>
<p>Please let us know what's available for our dates. Thank you!</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #EDE5D4;padding-top:16px;width:100%;${font}font-size:14px;color:#33363B;">
<tr><td style="padding:16px 0 2px;"><strong>${esc(fullName)}</strong></td></tr>
<tr><td style="padding:2px 0;"><a href="mailto:${esc(email)}" style="color:#1E3A50;">${esc(email)}</a></td></tr>
${phone ? `<tr><td style="padding:2px 0;">${esc(phone)}</td></tr>` : ''}
</table>
<p style="font-size:12px;color:#8A8E95;margin-top:20px;">Sent from the wishlist page at mexicanreserve.com. Reply to this email to answer ${esc(firstName)} directly.</p>
</div>`

  try {
    await send(apiKey, {
      sender: { name: `${fullName} via Mexican Reserve`, email: SENDER_EMAIL },
      to: [{ email: TEAM_EMAIL, name: 'Mexican Reserve' }],
      replyTo: { email, name: fullName },
      subject: `Property Wishlist Inquiry — ${n} ${villasWord} · ${fullName}`,
      htmlContent: teamHtml,
      textContent: teamText,
      tags: ['wishlist-inquiry'],
    })
  } catch (err) {
    console.error('[inquiry] team email failed', err)
    return Response.json({ ok: false, error: 'upstream' }, { status: 502 })
  }

  /* ── 2. Guest confirmation — branded, honest timing ─────────────────── */
  const guestRows = props
    .map((p) => `<tr><td style="padding:10px 0;border-bottom:1px solid #EDE5D4;${font}font-size:14px;color:#33363B;"><a href="${SITE_URL}/villas/${p.slug}" style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:#1E3A50;text-decoration:none;">${esc(p.title)}</a><br><span style="color:#5A5E65;font-size:13px;">${bedroomsTxt(p.bedrooms)}</span></td></tr>`)
    .join('')
  const guestHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>We received your inquiry</title><style>@media only screen and (max-width:620px){.wrap{width:100% !important;}.pad{padding-left:24px !important;padding-right:24px !important;}}</style></head>
<body style="margin:0;padding:0;background:#F8F4EE;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EE;"><tr><td align="center" style="padding:32px 12px;">
<table role="presentation" class="wrap" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#FEFEFE;">
<tr><td align="center" style="background:#1E3A50;padding:26px 24px 22px;"><img src="${SITE_URL}/images/email/logo-lockup.png" width="300" height="128" alt="Mexican Reserve" style="display:block;width:300px;max-width:100%;height:auto;margin:0 auto;border:0;${font}font-size:22px;color:#EFF6FB;"></td></tr>
<tr><td class="pad" align="center" style="padding:44px 48px 8px;">
<div style="${font}font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#7E5A1C;padding-bottom:16px;">Inquiry received</div>
<h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:400;font-size:34px;line-height:1.2;color:#1E3A50;">Thank you, ${esc(firstName)}.</h1>
<p style="margin:18px 0 0;${font}font-size:15px;line-height:1.75;color:#33363B;">Your inquiry for ${n === 1 ? '1 villa' : `${n} villas`} is with our team, and we&rsquo;ll be in touch within 24 hours. We confirm availability and rates directly with each villa&rsquo;s owner, so some answers can take a little longer. We&rsquo;ll keep you updated as they come in.</p>
</td></tr>
<tr><td class="pad" style="padding:28px 48px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EE;border:1px solid #EDE5D4;"><tr><td style="padding:22px 26px;">
<div style="${font}font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5A5E65;padding-bottom:4px;">Your trip</div>
<div style="${font}font-size:14px;line-height:1.7;color:#33363B;padding-bottom:10px;">${esc(dates)}<br>${esc(guests.charAt(0).toUpperCase() + guests.slice(1))}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${guestRows}</table>
<div style="padding-top:14px;${font}font-size:13px;"><a href="${wishlistUrl}" style="color:#1E3A50;text-decoration:underline;">View your wishlist</a></div>
</td></tr></table>
</td></tr>
<tr><td class="pad" align="center" style="padding:28px 48px 40px;${font}font-size:14px;line-height:1.7;color:#5A5E65;">Anything to add, like a special occasion or must-haves? Simply reply to this email, or message us on <a href="${WHATSAPP_URL}" style="color:#1E3A50;text-decoration:underline;">WhatsApp</a>.</td></tr>
<tr><td align="center" style="background:#1E3A50;padding:26px 24px 28px;${font}font-size:12px;line-height:1.8;color:#B8C8D8;"><a href="${SITE_URL}" style="color:#EFF6FB;text-decoration:none;letter-spacing:1px;">mexicanreserve.com</a><br>Punta de Mita, Nayarit, M&eacute;xico<br><span style="color:#8FA3B5;">You&rsquo;re receiving this one-time confirmation because you sent an inquiry at mexicanreserve.com.</span></td></tr>
</table></td></tr></table></body></html>`

  const guestText =
    `Thank you, ${firstName}.\n\nYour inquiry for ${n === 1 ? '1 villa' : `${n} villas`} is with our team, and we'll be in touch within 24 hours. We confirm availability and rates directly with each villa's owner, so some answers can take a little longer. We'll keep you updated as they come in.\n\n` +
    `Your trip: ${dates}, ${guests}\n${props.map((p) => `• ${p.title} — ${bedroomsTxt(p.bedrooms)}`).join('\n')}\n\nYour wishlist: ${wishlistUrl}\n\nAnything to add? Simply reply to this email, or message us on WhatsApp: ${WHATSAPP_URL}\n\nMexican Reserve · mexicanreserve.com`

  try {
    await send(apiKey, {
      sender: { name: 'Mexican Reserve', email: SENDER_EMAIL },
      to: [{ email, name: fullName }],
      replyTo: { email: TEAM_EMAIL, name: 'Mexican Reserve' },
      subject: 'We received your inquiry — Mexican Reserve',
      htmlContent: guestHtml,
      textContent: guestText,
      tags: ['wishlist-inquiry-confirmation'],
    })
  } catch (err) {
    // The team already has the inquiry, so the guest still sees success.
    console.error('[inquiry] guest confirmation failed', err)
  }

  return Response.json({ ok: true })
}
