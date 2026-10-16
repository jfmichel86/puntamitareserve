'use client'

import { useLayoutEffect, useRef, useState } from 'react'

const REVIEWS = [
  {
    text: "Pictures of the villa don't begin to do it justice — beautiful, clean, and well-appointed. Our concierge Sandra handled everything from last-minute massages to arranging food delivery when we were too tired to make it to dinner. We have always enjoyed Punta Mita but this trip set a new bar for tropical vacations.",
    name: 'Joe N.', detail: 'Stayed at Villa Amore', date: 'March 2024', platform: 'Vrbo',
  },
  {
    text: 'The house was spotless, beautifully updated, and it felt like our own luxury resort. We loved starting our mornings with the delicious breakfasts that Brenda prepared. The entire staff was warm, attentive, and incredibly helpful. We will definitely be back.',
    name: 'Kelsey M.', detail: 'Stayed at Villa Llamas', date: 'December 2023', platform: 'Vrbo',
  },
  {
    text: "What an incredible stay! The property is new and gorgeous and so wonderfully planned — from suite-style rooms to the large living room to multiple outdoor spaces. Estrella was our chef and housekeeper, and we all marveled at having her as part of our household. She anticipated our needs, prepared delicious meals, and served graciously. The concierge and property management team were likewise excellent — thank you Sandra and Andres! We'll definitely be looking to see if this property is available next time.",
    name: 'Joe F.', detail: 'Stayed at Villa Brezza', date: 'February 2024', platform: 'Vrbo',
  },
]

const STAR = <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>

export default function Testimonials() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  // Original only shows "See more" when the 5-line clamp is actually cutting
  // off text (checked via scrollHeight vs clientHeight after mount) — a short
  // review never gets a pointless toggle button.
  const [clamped, setClamped] = useState<Set<number>>(new Set())
  const textRefs = useRef<(HTMLParagraphElement | null)[]>([])

  useLayoutEffect(() => {
    const next = new Set<number>()
    textRefs.current.forEach((el, i) => {
      if (el && el.scrollHeight > el.clientHeight + 2) next.add(i)
    })
    // Deliberate: this measures real layout (line-clamp overflow) which can
    // only be known after the DOM paints, so setState here is unavoidable —
    // matches the original site's own post-render scrollHeight check.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClamped(next)
  }, [])

  const toggle = (i: number) => setExpanded((s) => {
    const next = new Set(s)
    if (next.has(i)) next.delete(i)
    else next.add(i)
    return next
  })

  return (
    <section id="testimonials">
      <div className="t-head">
        <p className="s-eye">In their words</p>
        <div className="s-div" />
        <h2 className="s-title">Experiences that <em>stay with you</em></h2>
      </div>
      <div className="t-grid">
        {REVIEWS.map((r, i) => (
          <div className="t-card reveal" key={i}>
            <div className="t-stars">
              {STAR}{STAR}{STAR}{STAR}{STAR}
              <span className="t-score">10/10</span>
            </div>
            <p
              ref={(el) => { textRefs.current[i] = el }}
              className={`t-text${expanded.has(i) ? ' t-expanded' : ''}`}
            >&ldquo;{r.text}&rdquo;</p>
            {clamped.has(i) && (
              <button className="t-more" style={{ display: 'flex' }} aria-expanded={expanded.has(i)} onClick={() => toggle(i)}>
                {expanded.has(i) ? 'See less' : 'See more'}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            )}
            <div className="t-author">
              <div>
                <div className="t-name">{r.name}</div>
                <div className="t-detail">{r.detail}</div>
                <div className="t-date">{r.date}</div>
                <div className="t-platform">{r.platform}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
