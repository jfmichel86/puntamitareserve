import Link from 'next/link'
import { urlFor } from '@/lib/sanity'
import { JournalPostSummary, JOURNAL_CATEGORY_LABEL } from '@/lib/utils'

// Single shared card for every Journal article — used on the /journal
// listing page, and built to be reusable anywhere else an article teaser is
// needed later (e.g. a "More from the Journal" strip), same rule this
// project follows for PropertyCard and ExperienceCard.
export default function JournalCard({ post }: { post: JournalPostSummary }) {
  const photoUrl = post.coverImage?.asset?._ref
    ? urlFor(post.coverImage).width(900).height(675).quality(85).url()
    : undefined

  const dateLabel = new Date(post.publishedDate).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <Link href={`/journal/${post.slug}`} className="journal-card">
      <div className="journal-card-photo">
        {photoUrl ? (
          <div className="journal-card-bg" style={{ backgroundImage: `url('${photoUrl}')` }} role="img" aria-label={post.title} />
        ) : (
          <div className="journal-card-bg journal-card-bg--placeholder">
            <span>Photo placeholder</span>
          </div>
        )}
        <span className="journal-card-badge">{JOURNAL_CATEGORY_LABEL[post.category] || post.category}</span>
      </div>
      <div className="journal-card-body">
        <h3 className="journal-card-title">{post.title}</h3>
        <p className="journal-card-excerpt">{post.excerpt}</p>
        <div className="journal-card-foot">
          <span className="journal-card-date">{dateLabel}</span>
          <span className="journal-card-more">
            Read more
            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
