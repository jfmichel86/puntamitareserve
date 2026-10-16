import type { Metadata } from 'next'
import { client } from '@/lib/sanity'
import { JOURNAL_POSTS_QUERY } from '@/lib/queries'
import { JournalPostSummary } from '@/lib/utils'
import JournalClient from './JournalClient'
import JournalMasthead from '@/components/JournalMasthead'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'The Journal',
  description: 'Destination guides, villa stories, and planning advice from Mexican Reserve — written for travelers choosing where to stay in Mexico.',
  alternates: { canonical: 'https://www.mexicanreserve.com/journal' },
}

export default async function JournalPage() {
  const posts: JournalPostSummary[] = await client.fetch(JOURNAL_POSTS_QUERY)
  // Graceful fallback: no journalPost documents exist live in Sanity yet,
  // so this is false today and the plain header below renders — but the
  // moment the first article publishes, the masthead picks it up with no
  // further changes needed here.
  const featured = posts[0]?.coverImage?.asset?._ref ? posts[0] : undefined

  return (
    <>
      {featured ? (
        <JournalMasthead post={featured} />
      ) : (
        <section className="pg-header">
          <p className="pg-eyebrow">The Journal</p>
          <h1 className="pg-title">Stories &amp; <em>Guides</em></h1>
          <p className="pg-sub">Destination guides, villa stories, and planning advice from our team on the ground in Mexico.</p>
        </section>
      )}

      <JournalClient posts={posts} />
    </>
  )
}
