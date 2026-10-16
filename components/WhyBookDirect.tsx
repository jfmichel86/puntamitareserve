const PILLARS = [
  {
    title: 'The Best Rate, Always',
    body: 'We work directly with each homeowner to secure the best possible rate for you — the kind of care a platform listing simply can’t offer.',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M20.59 13.41 12 22l-9-9V4h9l8.59 8.59a2 2 0 0 1 0 2.82Z" />
        <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'No Platform Fees',
    body: 'Book with us directly and skip the service fees that Airbnb, Vrbo, and other platforms add at checkout.',
    icon: (
      <svg viewBox="0 0 24 24">
        <path d="M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2-3-2V4a1 1 0 0 1 1-1Z" />
        <line x1="4" y1="20" x2="20" y2="4" />
      </svg>
    ),
  },
  {
    title: 'Properties You Won’t Find Elsewhere',
    body: 'Some of Mexico’s finest private villas are never listed publicly — available only through Mexican Reserve.',
    icon: (
      <svg viewBox="0 0 24 24">
        <circle cx="7" cy="15" r="4" />
        <path d="M10.2 12 19 3.2m-3.6 3.6 2.4 2.4m-5.4-.6 2.4 2.4" />
      </svg>
    ),
  },
  {
    title: 'Flexibility, On Your Terms',
    body: 'Need to shift your dates, arrive early, or adjust how you pay? We work with you directly to make it happen.',
    icon: (
      <svg viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="1.5" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="7" y1="2.5" x2="7" y2="6.5" />
        <line x1="17" y1="2.5" x2="17" y2="6.5" />
        <polyline points="8.5 15.5 11 18 16 13" />
      </svg>
    ),
  },
]

export default function WhyBookDirect() {
  return (
    <section id="why-book-direct">
      <div className="wbd-hdr reveal">
        <p className="s-eye">Why Book Direct</p>
        <div className="s-div" />
        <h2 className="s-title">The advantages you <em>won&rsquo;t find</em> on a booking platform</h2>
        <p className="s-body">When you book directly with Mexican Reserve, you get more than a reservation — you get an advocate working on your behalf, before your trip even begins.</p>
      </div>
      <div className="wbd-grid">
        {PILLARS.map((p) => (
          <div className="wbd-item reveal" key={p.title}>
            <span className="wbd-icon">{p.icon}</span>
            <h3 className="wbd-title">{p.title}</h3>
            <p className="wbd-desc">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
