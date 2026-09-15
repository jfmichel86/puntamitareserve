import type { Metadata } from 'next'
import Link from 'next/link'
import ExperienceHero from '@/components/ExperienceHero'

// The hub "THE EXPERIENCE" itself leads to — added when the dropdown grew
// to four items (Guest Journey, Concierge & Experiences, The Journal,
// About Us) and none of the four was a natural landing spot for the trigger
// word on its own. Mirrors /destinations' own role for the Destinations
// dropdown: a short header plus a card per item, nothing else — every card
// links to a page that already exists, so there's no new content to write
// beyond this page's own header line.
const TITLE = 'The Experience'
const DESCRIPTION = 'How Mexican Reserve works — the guest journey, concierge and experiences, The Journal, and the team behind it all.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: 'https://www.mexicanreserve.com/experience' },
  openGraph: { title: TITLE, description: DESCRIPTION },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

const CARDS = [
  {
    href: '/guest-journey',
    title: 'The Guest Journey',
    text: 'Four stages, one team, zero details left to chance — from before you arrive to long after you check out.',
  },
  {
    href: '/experiences',
    title: 'Concierge & Experiences',
    text: 'Golf, beach clubs, private chefs, yacht charters, and more — arranged for your stay across every destination.',
  },
  {
    href: '/journal',
    title: 'The Journal',
    text: 'Destination guides, villa stories, and planning advice from our team on the ground in Mexico.',
  },
  {
    href: '/about',
    title: 'About Us',
    text: 'Who Mexican Reserve is, and the track record behind every property we represent.',
  },
]

export default function ExperienceHubPage() {
  return (
    <>
      <ExperienceHero />

      <div className="experience-hub-wrap">
        <div className="dest-find-grid">
          {CARDS.map((c) => (
            <Link key={c.href} href={c.href} className="dest-find-card">
              <h3 className="dest-find-card-title">{c.title}</h3>
              <p className="dest-find-card-text">{c.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
