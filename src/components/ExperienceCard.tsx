import { urlFor } from '@/lib/sanity'
import { Activity, EXPERIENCE_CATEGORY_LABEL } from '@/lib/utils'

// Single shared card for every "Concierge & Experiences" entry — used on
// both the /experiences catalog page and each destination page's teaser
// section, so a visitor sees the exact same card no matter where they
// encounter it (same rule this project follows for PropertyCard).
export default function ExperienceCard({
  experience: e,
  activeDestination,
  destinationLabels,
}: {
  experience: Activity
  // The raw destination value currently in view (e.g. 'punta-mita') — set
  // whenever there IS a single destination in context, either the /experiences
  // catalog filtered to one destination, or a destination page's teaser
  // (always). Used to filter the bullet list below: a bullet with no
  // destinationOverride shows everywhere the activity itself does, but one
  // with an override only shows when activeDestination is in that list.
  // Left undefined only when browsing the catalog with "All Destinations"
  // selected, in which case every bullet shows regardless of scope.
  activeDestination?: string
  // Only passed on the /experiences catalog page, and only when no single
  // destination filter is active — tells a visitor browsing "All
  // Destinations" where a given experience actually applies. Omitted on
  // destination-page teasers, since the destination is already the whole
  // context there.
  destinationLabels?: string[]
}) {
  const photoUrl = e.photo?.asset?._ref
    ? urlFor(e.photo).width(900).height(675).quality(85).url()
    : undefined

  const visibleExperiences = activeDestination
    ? e.experiences.filter((x) => !x.destinationOverride?.length || x.destinationOverride.includes(activeDestination))
    : e.experiences

  return (
    <div className="exp-card">
      <div className="exp-card-photo">
        {photoUrl ? (
          <div className="exp-card-bg" style={{ backgroundImage: `url('${photoUrl}')` }} />
        ) : (
          <div className="exp-card-bg exp-card-bg--placeholder">
            <span>Photo placeholder</span>
          </div>
        )}
        <span className="exp-card-badge">{EXPERIENCE_CATEGORY_LABEL[e.category] || e.category}</span>
      </div>
      <div className="exp-card-body">
        <h3 className="exp-card-title">{e.title}</h3>
        <p className="exp-card-desc">{e.description}</p>
        {visibleExperiences.length > 0 && (
          <div className="exp-card-tags">
            {visibleExperiences.map((x) => <span key={x.text} className="exp-card-tag">{x.text}</span>)}
          </div>
        )}
        {destinationLabels && destinationLabels.length > 0 && (
          <p className="exp-card-dest">Available in {destinationLabels.join(', ')}</p>
        )}
      </div>
    </div>
  )
}
