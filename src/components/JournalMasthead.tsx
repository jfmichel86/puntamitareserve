import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { JournalPostSummary, JOURNAL_CATEGORY_LABEL } from '@/lib/utils'

// The Journal's header — an editorial magazine treatment instead of the
// flat .pg-header every utility page uses: the hero photo is the most
// recently published article's own cover image, with a small "Latest"
// call-out overlaid that links straight into that article (Francisco's
// 3-header proposal, 2026-08-31: "a photo band using your most recently
// published article's own cover image, with a small 'Latest' teaser").
// Every fresh article automatically becomes this page's next hero photo —
// no manual curation step, unlike the homepage/Experience hero photos.
// JournalPage (page.tsx) only renders this when posts[0] exists AND has a
// cover image; otherwise it falls back to the plain .pg-header, since no
// journalPost documents exist live in Sanity yet.
export default function JournalMasthead({ post }: { post: JournalPostSummary }) {
  const photoUrl = urlFor(post.coverImage!).width(2400).height(1400).quality(90).url()
  const dateLabel = new Date(post.publishedDate).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <section id="journal-masthead" style={{ backgroundImage: `url('${photoUrl}')` }}>
      <div className="journal-masthead-scrim" />
      <div className="journal-masthead-head">
        <p className="pg-eyebrow">The Journal</p>
        <h1 className="pg-title">Stories &amp; <em>Guides</em></h1>
        <p className="pg-sub">Destination guides, villa stories, and planning advice from our team on the ground in Mexico.</p>
      </div>
      <Link href={`/journal/${post.slug}`} className="journal-masthead-latest">
        <span className="journal-masthead-latest-tag">Latest &middot; {JOURNAL_CATEGORY_LABEL[post.category] || post.category}</span>
        <span className="journal-masthead-latest-title">{post.title}</span>
        <span className="journal-masthead-latest-meta">{dateLabel}</span>
      </Link>
    </section>
  )
}
