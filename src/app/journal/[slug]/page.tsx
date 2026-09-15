import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { client, urlFor } from '@/lib/sanity'
import { JOURNAL_POST_BY_SLUG_QUERY, JOURNAL_SLUGS_QUERY } from '@/lib/queries'
import { JournalPost, JOURNAL_CATEGORY_LABEL, readingTime } from '@/lib/utils'
import { renderPortableText } from '@/lib/portableText'
import PropertyCard from '@/components/PropertyCard'

export const revalidate = 60

type Params = { slug: string }

async function getPost(slug: string): Promise<JournalPost | null> {
  return client.fetch(JOURNAL_POST_BY_SLUG_QUERY, { slug })
}

export async function generateStaticParams() {
  const slugs: string[] = await client.fetch(JOURNAL_SLUGS_QUERY)
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt
  const ogImage = post.coverImage?.asset?._ref
    ? urlFor(post.coverImage).width(1200).height(630).quality(85).url()
    : 'https://www.mexicanreserve.com/og-image-1.jpg'

  return {
    title,
    description,
    alternates: { canonical: `https://www.mexicanreserve.com/journal/${slug}` },
    openGraph: { title, description, images: [ogImage], type: 'article' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function JournalArticlePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  const categoryLabel = JOURNAL_CATEGORY_LABEL[post.category] || post.category
  const dateLabel = new Date(post.publishedDate).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const minutes = readingTime(post.body)
  const heroUrl = post.coverImage?.asset?._ref
    ? urlFor(post.coverImage).width(2400).height(1400).quality(90).url()
    : '/og-image-1.jpg'

  const canonicalUrl = `https://www.mexicanreserve.com/journal/${slug}`
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    ...(post.coverImage?.asset?._ref ? { image: [urlFor(post.coverImage).width(1600).height(1067).quality(85).url()] } : {}),
    datePublished: post.publishedDate,
    author: { '@type': 'Organization', name: 'Mexican Reserve' },
    publisher: { '@type': 'Organization', name: 'Mexican Reserve' },
    mainEntityOfPage: canonicalUrl,
  }
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.mexicanreserve.com/' },
      { '@type': 'ListItem', position: 2, name: 'The Journal', item: 'https://www.mexicanreserve.com/journal' },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonicalUrl },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="breadcrumb">
        <Link href="/">Home</Link>
        <span className="bc-sep">/</span>
        <Link href="/journal">The Journal</Link>
        <span className="bc-sep">/</span>
        <span className="bc-current">{post.title}</span>
      </div>

      <div id="journal-hero">
        <Image
          src={heroUrl}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="journal-hero-overlay" />
        <div className="journal-hero-content">
          <p className="journal-hero-eyebrow">{categoryLabel}</p>
          <h1 className="journal-hero-title">{post.title}</h1>
          <p className="journal-hero-meta">{dateLabel} · {minutes} min read</p>
        </div>
      </div>

      <div className="legal-wrap journal-article-wrap">
        <p className="short-desc">{post.excerpt}</p>
        <div className="journal-body">
          {renderPortableText(post.body)}
        </div>
      </div>

      {post.relatedProperties && post.relatedProperties.length > 0 && (
        <div className="legal-wrap journal-related-wrap">
          <div className="detail-section">
            <span className="sec-label">Related Villas</span>
            <h2 className="sec-title">Villas You Might Love</h2>
            <div className="properties-grid">
              {post.relatedProperties.map((p) => <PropertyCard key={p._id} property={p} />)}
            </div>
          </div>
        </div>
      )}

      <div className="legal-wrap journal-back-wrap">
        <Link href="/journal" className="legal-cta">
          <svg viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
          Back to The Journal
        </Link>
      </div>
    </>
  )
}
