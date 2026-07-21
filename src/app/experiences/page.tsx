import { Suspense } from 'react'
import type { Metadata } from 'next'
import { client } from '@/lib/sanity'
import { ALL_EXPERIENCES_QUERY } from '@/lib/queries'
import { Activity } from '@/lib/utils'
import ExperiencesClient from './ExperiencesClient'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Concierge & Experiences',
  description: 'A curated menu of what our concierge team can arrange for your stay — golf, beach clubs, private chefs, yacht charters, and more — across every Mexican Reserve destination.',
}

export default async function ExperiencesPage() {
  const experiences: Activity[] = await client.fetch(ALL_EXPERIENCES_QUERY)

  return (
    <>
      <section className="pg-header">
        <p className="pg-eyebrow">Concierge &amp; Experiences</p>
        <h1 className="pg-title">Arranged for <em>your stay</em></h1>
        <p className="pg-sub">A curated menu of what we can arrange for you, across every Mexican Reserve destination — filter by destination or category to browse.</p>
      </section>

      <Suspense fallback={null}>
        <ExperiencesClient experiences={experiences} />
      </Suspense>
    </>
  )
}
