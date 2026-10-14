'use client'

import { useState } from 'react'
import Link from 'next/link'

function AccordionItem({
  id, name, content, open, onToggle,
}: { id: string; name: string; content: React.ReactNode; open: boolean; onToggle: () => void }) {
  return (
    <div className={`policy-item${open ? ' open' : ''}`} id={id}>
      <button className="policy-trigger" type="button" aria-expanded={open} onClick={onToggle}>
        <span className="policy-trigger-name">{name}</span>
        <svg className="policy-chev" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div className="policy-body">
        <div className="policy-content">{content}</div>
      </div>
    </div>
  )
}

// Mirrors the live site's togglePolicy(): only one policy item open at a time
// across all three items — even though the house-rules visual grid sits
// between item 2 and item 3 in the markup. houseRulesVis is passed in so it
// renders at that exact spot while sharing this component's accordion state.
export default function PolicyAccordion({
  houseRulesVis,
  rulesContent,
}: {
  houseRulesVis: React.ReactNode
  rulesContent: React.ReactNode
}) {
  const [open, setOpen] = useState<string | null>(null)
  const toggle = (id: string) => setOpen((cur) => (cur === id ? null : id))

  return (
    <>
      <AccordionItem
        id="pi1"
        name="Check-In &amp; Check-Out"
        open={open === 'pi1'}
        onToggle={() => toggle('pi1')}
        content={
          <ul>
            <li>Check-in from 3:00 pm · Check-out by 11:00 am</li>
            <li>Early check-in and late check-out available on request (subject to availability)</li>
            <li>Concierge will greet you on arrival and walk you through the property</li>
          </ul>
        }
      />
      <AccordionItem
        id="pi2"
        name="Cancellation Policy"
        open={open === 'pi2'}
        onToggle={() => toggle('pi2')}
        content={
          // Mirrors the full Cancellation Policy page (/cancellation-policy) —
          // keep both in sync, on Mexican Reserve AND Beyond Traveling.
          <ul>
            <li>90+ days before arrival: 100% refund, less a 5% processing fee</li>
            <li>60–89 days before arrival: 50% refund, less a 5% processing fee</li>
            <li>Within 60 days of arrival: no refund</li>
            <li>One date change allowed at no fee if requested 90+ days before arrival</li>
            <li>No refund for no-shows or early departures</li>
            <li><Link href="/cancellation-policy" style={{ textDecoration: 'underline' }}>Read the full cancellation policy</Link></li>
          </ul>
        }
      />
      {houseRulesVis}
      <AccordionItem
        id="pi3"
        name="Additional Rules"
        open={open === 'pi3'}
        onToggle={() => toggle('pi3')}
        content={rulesContent}
      />
    </>
  )
}
