'use client'

import { useState } from 'react'
import { JournalPostSummary, JOURNAL_CATEGORIES } from '@/lib/utils'
import JournalCard from '@/components/JournalCard'

// Category filter + grid — same client-side filter pattern as
// ExperiencesClient (no destination axis here, just one filter group), so
// switching categories doesn't need a page reload.
export default function JournalClient({ posts }: { posts: JournalPostSummary[] }) {
  const [catFilter, setCatFilter] = useState('all')

  const filtered = catFilter === 'all' ? posts : posts.filter((p) => p.category === catFilter)

  return (
    <div className="exp-catalog">
      <div className="exp-filters">
        <div className="exp-filter-group">
          <span className="exp-filter-label">Category</span>
          <div className="exp-chip-row">
            <button
              className={`exp-chip${catFilter === 'all' ? ' is-active' : ''}`}
              onClick={() => setCatFilter('all')}
            >
              All Articles
            </button>
            {JOURNAL_CATEGORIES.map(([value, label]) => (
              <button
                key={value}
                className={`exp-chip${catFilter === value ? ' is-active' : ''}`}
                onClick={() => setCatFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="journal-grid">
          {filtered.map((post) => <JournalCard key={post._id} post={post} />)}
        </div>
      ) : (
        <div className="exp-empty">
          <p>No articles in this category yet.</p>
          <button className="exp-clear-btn" onClick={() => setCatFilter('all')}>View all articles</button>
        </div>
      )}
    </div>
  )
}
