import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client, urlFor } from '@/lib/sanity'
import { PROPERTIES_BY_DESTINATION_QUERY, ACTIVITIES_BY_DESTINATION_QUERY } from '@/lib/queries'
import { Property, communityLabel, startingRate, Activity, LOCATION_LABEL_BY_SLUG } from '@/lib/utils'
import PropertyCard from '@/components/PropertyCard'
import BeachClubShowcase from '@/components/BeachClubShowcase'
import ExperienceCard from '@/components/ExperienceCard'

export const revalidate = 60

type Params = { slug: string }

type Destination = {
  slug: string
  eyebrow: string
  title: string
  // Only set for Punta Mita: the disambiguating "Inside the Gates" suffix,
  // rendered smaller/muted next to the big title (just a clarifier, not a
  // second headline) — and kept separate from `title` so it doesn't leak
  // into the many places `title` gets embedded in a sentence ("Properties
  // in Punta Mita", "Why Punta Mita") where it would read awkwardly repeated.
  titleSuffix?: string
  heroSub: string
  // "redesigned" pages use the newer template below (Why statement + dark
  // In Numbers band) instead of the older paragraph/fact-card layout.
  // Only Punta Mita is redesigned so far — Punta de Mita and Puerto Vallarta
  // keep using `overview` until we redesign them too, using this page as
  // the template.
  redesigned?: boolean
  whyStatement?: { headline: string; support: string }
  overview?: string[]
  // Non-redesigned pages use one flat `experiences` list. Redesigned pages
  // split it into what's exclusive inside the gates vs. what's out in the
  // wider area — set both to switch a redesigned page over.
  experiences?: { title: string; text: string }[]
  insideExperiences?: { title: string; text: string }[]
  // Richer alternative to insideExperiences, for destinations with enough
  // "inside the gates" amenities to warrant labeled sub-groups (e.g. Punta
  // Mita's golf courses vs. beach clubs). Takes priority over
  // insideExperiences when set. `note` renders as a small callout under
  // that group's cards — used for the beach club access fee disclosure.
  // `layout` picks the visual treatment per group, so marquee content
  // (golf, beach clubs) doesn't read the same as supporting content
  // (tennis courts, the pier):
  //   cinematic — full-width photo bands, text overlaid on the image
  //   showcase  — click-through tabs + one large panel (vibe/tags/copy per
  //               item) — used for Beach Clubs, where each one needs real
  //               editorial depth rather than a caption
  //   list      — compact text rows, no photo (for secondary amenities)
  insideGroups?: {
    label: string
    layout: 'cinematic' | 'showcase' | 'list'
    // imageUrl/images are left unset until real photography exists for that
    // specific item — renders the existing placeholder. Set per-item, not
    // per-group, since a group like Beach Clubs will get real photos one at
    // a time as they become available.
    //   imageUrl        — single full-bleed photo, used by cinematic bands
    //                      (Golf Courses). imagePosition overrides the
    //                      default "center" background-position — most of
    //                      our source photos are wide landscape shots with a
    //                      lot of empty sky at the top, so the interesting
    //                      part (the green, the clubhouse) needs to be told
    //                      explicitly where it sits, or a center crop lands
    //                      on nothing attractive.
    //   images           — 1-3 photos, used by showcase panels (Beach
    //                      Clubs) as a small square mosaic instead of one
    //                      wide panorama. Our beach club source photos are
    //                      lower-resolution lifestyle shots that read much
    //                      better small and square than stretched full-width.
    items: { title: string; text: string; stat?: string; vibe?: string; tags?: string[]; imageUrl?: string; imagePosition?: string; images?: string[] }[]
    note?: string
  }[]
  // The section title/intro above insideGroups — "Inside the Gates" only
  // makes sense for Punta Mita's gated community. Other redesigned pages
  // set their own (e.g. "In the Village" / "In the City") since they're
  // describing a public place, not a private amenity list.
  insideSectionTitle?: string
  insideSectionIntro?: string
  // Intro line above the "Villas to Match the Way You Travel" tiles —
  // "sits inside the gates" is only true for Punta Mita, so every
  // redesigned page sets its own.
  findVillaIntro?: string
  // Only used by non-redesigned pages' fallback "Experiences" section.
  // Redesigned pages keep everything scoped to the destination itself
  // (see insideGroups) — regional/other-destination content belongs on
  // that other destination's own page, and concierge services (formerly
  // an "Arranged for You" section here) belong on a future dedicated,
  // sitewide Concierge page instead, since they're not destination-specific.
  beyondExperiences?: { title: string; text: string }[]
  // Full-bleed editorial image break (redesigned pages only), for visual
  // pacing between Inside the Gates and Find the Right Villa. imageUrl is
  // left unset until real photography exists — renders a placeholder panel.
  photoBreak?: { caption: string; imageUrl?: string; imagePosition?: string }
  facts: { label: string; value: string; sub: string }[]
  emptyNote: string
  // When true, the page renders a standalone "Coming Soon" teaser instead
  // of the full page below — used while a destination still needs real
  // photography and/or property inventory before it's ready to launch.
  // Everything else on this object (whyStatement, insideGroups, etc.) stays
  // in place untouched, so turning this off is the only step needed to
  // bring the full page back later.
  comingSoon?: boolean
}

const DESTINATIONS: Record<string, Destination> = {
  'punta-mita': {
    slug: 'punta-mita',
    eyebrow: 'Riviera Nayarit, Mexico',
    title: 'Punta Mita',
    titleSuffix: 'Inside the Gates',
    heroSub: 'A private, guard-gated peninsula on Mexico’s Pacific coast — golf, beaches, and every villa in this collection sits inside the gates.',
    redesigned: true,
    whyStatement: {
      headline: 'A 1,500-acre guard-gated peninsula — home to two Jack Nicklaus Signature golf courses, the Four Seasons, and the St. Regis.',
      support: 'Every villa in this collection sits inside that private gate, with the security, service, and amenities that come with it. Guests choose Punta Mita for privacy as much as scenery — quiet, uncrowded beaches and a level of service that’s built into the villas themselves, not added on.',
    },
    findVillaIntro: 'Every villa in this collection sits inside the gates — filtered here by what matters most when choosing where to stay.',
    insideGroups: [
      {
        label: 'Golf Courses',
        layout: 'cinematic',
        items: [
          { title: 'Pacífico', text: 'Jack Nicklaus’s original signature course at Punta Mita, home to the Tail of the Whale — the world’s only natural island green, reached by land at low tide and by amphibious cart at high tide.', imageUrl: '/images/destinations/punta-mita/golf-pacifico.jpg', imagePosition: 'center 88%' },
          { title: 'Bahía', text: 'A 7,035-yard, par-72 signature course with five ocean-side holes, including panoramic views of Banderas Bay and the Puerto Vallarta skyline from the 15th.', stat: '7,035 yds · Par 72', imageUrl: '/images/destinations/punta-mita/golf-bahia.jpg', imagePosition: 'center 78%' },
        ],
      },
      {
        label: 'Beach Clubs',
        layout: 'showcase',
        items: [
          {
            title: 'Pacífico',
            vibe: 'The original, and still a classic',
            tags: ['Restaurant & bar', 'Best breakfast in Punta Mita', 'Adult & family pools'],
            text: 'The full-service restaurant here has been a Punta Mita institution since the club’s earliest days — best known for its quesadillas, coconut shrimp, and the daily catch, plus what regulars call the best breakfast in Punta Mita. Indoor and al fresco tables both look out toward the Tail of the Whale ocean hole, and a daily happy hour runs from 5 to 7pm.',
            images: [
              '/images/destinations/punta-mita/beach-club-pacifico-1.jpg',
              '/images/destinations/punta-mita/beach-club-pacifico-2.jpg',
              '/images/destinations/punta-mita/beach-club-pacifico-3.jpg',
              '/images/destinations/punta-mita/beach-club-pacifico-4.jpg',
            ],
          },
          {
            title: 'Sea Breeze',
            vibe: 'St. Regis polish, right on the Pacific',
            tags: ['Sea Breeze Restaurant', 'Argentine-style steaks', 'Poolside butler service'],
            text: 'Sea Breeze Restaurant works a wood-burning grill and oven into a Latin-fusion menu — ceviches, tiraditos, pizzas, empanadas, and Argentinean-style steaks — with the polish of St. Regis service throughout. The adjoining round bar under a palapa roof is a favorite for a sunset drink, and the Mita Mary Seafood boat serves casual bites right on the sand.',
            images: [
              '/images/destinations/punta-mita/beach-club-sea-breeze-1.jpg',
              '/images/destinations/punta-mita/beach-club-sea-breeze-2.jpg',
              '/images/destinations/punta-mita/beach-club-sea-breeze-3.jpg',
              '/images/destinations/punta-mita/beach-club-sea-breeze-4.jpg',
            ],
          },
          {
            title: 'Kupuri',
            vibe: 'Built for a full family day',
            tags: ['Kupuri Restaurant', 'Oceanfront snack palapa', 'Kids’ & teens’ clubs'],
            text: 'Kupuri Restaurant blends traditional Mexican technique with Mediterranean influence into a menu that changes with the seasons, so there’s always something new. For a lighter bite without leaving the sand, the oceanfront snack palapa and bar serves fresh, casual fare, while the Coritas Kids’ Club and a dedicated teen clubhouse keep the rest of the family entertained.',
            images: [
              '/images/destinations/punta-mita/beach-club-kupuri-1.jpg',
              '/images/destinations/punta-mita/beach-club-kupuri-2.jpg',
              '/images/destinations/punta-mita/beach-club-kupuri-3.jpg',
              '/images/destinations/punta-mita/beach-club-kupuri-4.jpg',
            ],
          },
          {
            title: 'Sufi Ocean Club',
            vibe: 'Boho-chic, with the water as the main event',
            tags: ['Sufi Restaurant', '‘Mexiterranean’ menu', 'Punta Mita Pier access'],
            text: 'Sufi Restaurant serves what the club calls “Mexiterranean” cuisine — Mediterranean technique applied to ocean-fresh, Mexican ingredients — with a palapa snack shack nearby for something quicker. Set on Banderas Bay with a daily-refilled saltwater pool and direct Punta Mita Pier access, it’s just as easy to book a fishing or diving excursion between courses.',
            images: [
              '/images/destinations/punta-mita/beach-club-sufi-1.jpg',
              '/images/destinations/punta-mita/beach-club-sufi-2.jpg',
              '/images/destinations/punta-mita/beach-club-sufi-3.jpg',
              '/images/destinations/punta-mita/beach-club-sufi-4.jpg',
            ],
          },
          {
            title: 'El Surf Club',
            vibe: 'Barefoot luxury for surfers',
            tags: ['Coastal menu', 'Fresh juices & mezcal', 'Board rentals'],
            text: 'The kitchen keeps it simple and coastal — fresh fish tostadas, spicy pork tacos, and a rotating lineup of homemade salsas, alongside fresh juices, cold beer, and tequila and mezcal cocktails. The peninsula’s newest beach club, set at La Lancha Beach with views of the Islas Marietas, and a favorite sunset spot for private events.',
            images: [
              '/images/destinations/punta-mita/beach-club-el-surf-club-1.jpg',
              '/images/destinations/punta-mita/beach-club-el-surf-club-2.jpg',
              '/images/destinations/punta-mita/beach-club-el-surf-club-3.jpg',
              '/images/destinations/punta-mita/beach-club-el-surf-club-4.jpg',
            ],
          },
        ],
        note: 'A one-time Club Punta Mita access fee applies per guest, per stay (children under 5 are free) — contact us for current rates.',
      },
      {
        label: 'Amenities',
        layout: 'list',
        items: [
          { title: 'Tennis & Pickleball', text: 'Rated among the top tennis resorts in the world, the Punta Mita Tennis Club offers daily clinics, pickleball mixers, and a full pro shop.' },
          { title: 'Fitness Center & Spa', text: 'A fully equipped fitness center with a personal trainer on-site, plus spa treatments at the Navi Spa inside Pacífico Beach Club — or in the comfort of your villa.' },
          { title: 'Punta Mita Pier', text: 'The launch point for sport fishing, boat charters, and dive trips — tenders shuttle guests out to deeper water for excursions across Banderas Bay and beyond.' },
          { title: 'Recreational Trails', text: 'Paved trails connect the Palm Court to the entrance gate, the St. Regis, and the Four Seasons — a scenic stretch for a run, walk, or bike ride around the peninsula.' },
        ],
      },
    ],
    photoBreak: {
      caption: 'The world’s only natural island green — reached by land at low tide, by amphibious cart at high tide.',
      imageUrl: '/images/destinations/punta-mita/golf-sunset.jpg',
      imagePosition: 'center 60%',
    },
    facts: [
      { label: 'Getting Here', value: '45 min', sub: 'From Puerto Vallarta International Airport (PVR), via the coastal toll road.' },
      { label: 'Best Time to Visit', value: 'Nov – Apr', sub: 'The dry season brings warm days, low humidity, and calm seas.' },
      { label: 'Whale Season', value: 'Dec – Mar', sub: 'Humpback whales migrate through Banderas Bay, peaking in January and February.' },
    ],
    emptyNote: '',
  },
  'punta-de-mita': {
    slug: 'punta-de-mita',
    eyebrow: 'Riviera Nayarit, Mexico',
    title: 'Punta de Mita',
    titleSuffix: 'Beyond the Gates',
    heroSub: 'The surf town just outside Punta Mita’s gates — four named breaks, a fishing-village pace, and boutique stays minutes from the peninsula.',
    redesigned: true,
    comingSoon: true,
    whyStatement: {
      headline: 'A fishing-village-turned-surf-town at the tip of the peninsula — outside Punta Mita’s private gates, with four named breaks minutes from the sand.',
      support: 'Properties here trade the golf-course quiet of Punta Mita for a livelier, walkable village: surf shops and seafood palapas along Avenida El Anclote, pangas leaving daily for the Marietas Islands, and a fishing-town pace that’s never needed a gate.',
    },
    insideSectionTitle: 'In the Village',
    insideSectionIntro: 'Everything below sits just outside Punta Mita’s gates — open to everyone, not just villa guests.',
    findVillaIntro: 'Every villa in this collection sits just outside the gates — filtered here by what matters most when choosing where to stay.',
    insideGroups: [
      {
        label: 'Surf Breaks',
        layout: 'showcase',
        items: [
          { title: 'El Anclote', vibe: 'The easiest break to learn on', tags: ['Beginner-friendly', 'Surf schools', '2-min walk from parking'], text: 'A mellow, longboard-friendly beach break over a soft, shallow sandbar — Punta de Mita’s primary beginner wave, and home to most of the area’s surf schools. Best at mid tide, when a south-southwest swell meets light offshore winds.' },
          { title: 'La Lancha', vibe: 'Long, playful rides', tags: ['Point break', 'Longer rides', 'Intermediate'], text: 'A point break known for its long, fun rides — a natural next step once you’ve outgrown El Anclote but aren’t chasing a true expert wave.' },
          { title: 'Burros', vibe: 'Faster, punchier take-offs', tags: ['Reef break', 'Faster take-offs', 'Intermediate to advanced'], text: 'A quicker, more demanding break that rewards good timing over patience — the pick for surfers ready to move past the mellow breaks.' },
          { title: 'El Faro', vibe: 'Powerful, and not for beginners', tags: ['Reef break', 'Expert only', 'Named for the lighthouse'], text: 'The most demanding of Punta de Mita’s named breaks — a powerful, experienced-surfers-only wave, named for the lighthouse that marks the point.' },
        ],
        note: 'Board rentals and lessons are available at El Anclote for every level.',
      },
      {
        label: 'Village Life',
        layout: 'cinematic',
        items: [
          { title: 'Avenida El Anclote', text: 'The village’s main street runs straight down to the beach, lined with open-air seafood palapas, surf shops, and espresso bars — Punta de Mita’s real, walkable town center, not a resort promenade built to look like one.' },
        ],
      },
      {
        label: 'Amenities',
        layout: 'list',
        items: [
          { title: 'Boat Tours & Snorkeling', text: 'Pangas leave daily from the village jetty for the Marietas Islands marine reserve — snorkeling, diving, and the hidden Playa del Amor.' },
          { title: 'Sayulita', text: 'About 19 minutes up the coast — the region’s best-known beach town, with its own surf break, boutiques, and a lively night market.' },
          { title: 'San Pancho', text: 'A few minutes past Sayulita — quieter and less touristed, with a long stretch of sand and a handful of excellent restaurants.' },
        ],
      },
    ],
    photoBreak: {
      caption: 'Pangas at sunrise, boards at sunset — Punta de Mita keeps its own pace.',
    },
    facts: [
      { label: 'Getting Here', value: '45 min', sub: 'From Puerto Vallarta International Airport (PVR), via the coastal toll road.' },
      { label: 'Best Time to Visit', value: 'Nov – Apr', sub: 'The dry season brings warm days, low humidity, and calm seas.' },
      { label: 'Whale Season', value: 'Dec – Mar', sub: 'Humpback whales migrate through Banderas Bay, peaking in January and February.' },
    ],
    emptyNote: 'We’re adding our first Punta de Mita properties soon. In the meantime, our Punta Mita villas are a short drive away.',
  },
  'puerto-vallarta': {
    slug: 'puerto-vallarta',
    eyebrow: 'Jalisco, Mexico',
    title: 'Puerto Vallarta',
    heroSub: 'A historic beach city on Banderas Bay — a mile of oceanfront boardwalk, four distinct neighborhoods, and a livelier pace than the private peninsula.',
    redesigned: true,
    comingSoon: true,
    whyStatement: {
      headline: 'A historic beach city on Banderas Bay — the widest dining, nightlife, and after-dark scene anywhere on the bay, all of it walkable.',
      support: 'Puerto Vallarta trades the private peninsula for a real city: rooftop bars and live music every night of the week, restaurants and galleries within walking distance, and a beach scene that’s never asked for a membership. If nightlife matters more than quiet, this is the destination that delivers it.',
    },
    insideSectionTitle: 'In the City',
    insideSectionIntro: 'Puerto Vallarta is a public city, not a private community — everything below is open to anyone.',
    findVillaIntro: 'Every villa in this collection is in the city itself — filtered here by what matters most when choosing where to stay.',
    insideGroups: [
      {
        label: 'The Malecón',
        layout: 'cinematic',
        items: [
          { title: 'The Malecón', text: 'A mile of oceanfront boardwalk linking the Zona Romántica to El Centro, dotted with 34 sculptures — including the bronze “Boy on the Seahorse,” Puerto Vallarta’s official symbol. Vendors and street performers by day; the bars and restaurants along it carry the energy into the night.' },
        ],
      },
      {
        label: 'Nightlife',
        layout: 'cinematic',
        items: [
          { title: 'Puerto Vallarta After Dark', text: 'Rooftop bars watching the sun drop into the Pacific, a nightly cabaret and live-music scene through the Zona Romántica, and enough restaurants, bars, and clubs within a few blocks that you never need to call a cab. It’s the one advantage no other destination on the bay can match.' },
        ],
      },
      {
        label: 'Neighborhoods',
        layout: 'showcase',
        items: [
          { title: 'El Centro', vibe: 'Historic and walkable', tags: ['Cobblestone streets', 'Cathedral', 'Galleries'], text: 'Puerto Vallarta’s original downtown, anchored by the crown-topped Church of Our Lady of Guadalupe. Cobblestone streets climb from the bay past art galleries, cafés, and the city’s oldest architecture.' },
          { title: 'Zona Romántica', vibe: 'The dining and nightlife core', tags: ['Rooftop bars', 'Live music & cabaret', 'South of the Cuale River'], text: 'Puerto Vallarta’s Old Town, just south of the Cuale River — rooftop bars, a nightly cabaret and live-music scene, and the widest concentration of restaurants and galleries in the city, all within walking distance of the beach.' },
          { title: 'Los Muertos Beach', vibe: 'The city’s most popular beach', tags: ['Beach clubs & palapas', 'Water sports', '335-ft illuminated pier'], text: 'The heart of the Zona Romántica’s beachfront — beach clubs, palapa restaurants, and a 335-foot pier that lights up over the water at night. The busiest beach in Puerto Vallarta, and the most fun.' },
          { title: 'Marina Vallarta', vibe: 'Quiet, and built around the harbor', tags: ['450-slip marina', 'Golf course', 'Near the airport'], text: 'A planned neighborhood around Puerto Vallarta’s yacht marina, with its own 18-hole golf course and a quieter, more residential pace than downtown — five minutes from the airport, farthest from the nightlife.' },
        ],
      },
      {
        label: 'City Life',
        layout: 'list',
        items: [
          { title: 'Art & Galleries', text: 'Dozens of galleries across El Centro and the Zona Romántica, showing everything from Huichol folk art to contemporary Mexican painting.' },
          { title: 'Isla Río Cuale', text: 'A tree-shaded river island splitting El Centro from the Zona Romántica, home to an artisan market of silver, ceramics, and Huichol art, plus a small cultural center — reachable on foot from either neighborhood.' },
        ],
      },
    ],
    photoBreak: {
      caption: 'A city built to be walked — the Malecón at golden hour.',
    },
    facts: [
      { label: 'Getting Here', value: '20 min', sub: 'Puerto Vallarta International Airport (PVR) is inside the city itself.' },
      { label: 'Best Time to Visit', value: 'Nov – Apr', sub: 'The dry season brings warm days, low humidity, and calm seas.' },
      { label: 'Whale Season', value: 'Dec – Mar', sub: 'Humpback whales migrate through Banderas Bay, peaking in January and February.' },
    ],
    emptyNote: 'We’re adding our first Puerto Vallarta properties soon. In the meantime, our Punta Mita villas are about 45 minutes away.',
  },
}

type FindVillaTileConfig = {
  key: string
  title: string
  text: string
  query: string
  match: (p: Property) => boolean
}

// "Find the Right Villa" tiles (redesigned pages only) — each is a
// pre-filtered shortcut into the villas listing page. The community names
// shown under each tile are derived live from real property data below,
// not hand-maintained, so they stay accurate as inventory changes. `query`
// holds only the filter-specific params — the destination param is added
// per-page at render time (see `findVillaTiles` below), so the same tile
// config works for any destination. A tile with zero matches for the
// current destination is filtered out automatically (e.g. "Golf Course
// Villas" will simply never appear on Punta de Mita or Puerto Vallarta).
const FIND_VILLA_TILES: FindVillaTileConfig[] = [
  {
    key: 'oceanfront',
    title: 'Oceanfront & Beachfront',
    text: 'Direct beach access or unobstructed ocean views.',
    query: 'view=oceanfront&view=beachfront',
    match: (p) => (p.viewsAndPool || []).some((v) => v === 'oceanfront' || v === 'beachfront'),
  },
  {
    key: 'ocean-views',
    title: 'Ocean Views',
    text: 'A water view from the property — not necessarily right on the sand.',
    query: 'view=ocean-view',
    match: (p) => (p.viewsAndPool || []).includes('ocean-view'),
  },
  // Deliberately avoids "Villas" in the title — this includes condos too.
  {
    key: 'golf',
    title: 'Golf Course Properties',
    text: 'Steps from the fairway on Pacífico or Bahía.',
    query: 'view=golf-course-view&view=golf-course',
    match: (p) => (p.viewsAndPool || []).some((v) => v === 'golf-course-view' || v === 'golf-course'),
  },
  {
    key: 'family',
    title: 'Family Villas (6+ Bedrooms)',
    text: 'Room for multi-generational groups and extended stays.',
    query: 'beds=6',
    match: (p) => p.bedrooms >= 6,
  },
  // Also avoids "Villas" for the same reason as Golf Course Properties.
  {
    key: 'intimate',
    title: 'Intimate Properties (2–4 Bedrooms)',
    text: 'Sized right for a couple, a small family, or a close group of friends.',
    query: 'beds=2&bedsMax=4',
    match: (p) => p.bedrooms >= 2 && p.bedrooms <= 4,
  },
  {
    key: 'staffed',
    title: 'Fully Staffed',
    text: 'Four or more dedicated staff — housekeeping, a private chef, and more.',
    query: 'staff=1',
    match: (p) => (p.staffServices?.length || 0) >= 4,
  },
]

// Same bucket boundaries as PRICE_RANGES in villas/VillasClient.tsx — kept
// in sync manually so the "Lower Nightly Rates" tile's "View all" link
// points at a real price filter the listing page understands. Computed
// per-destination (see `findVillaTiles` below) rather than a static
// FIND_VILLA_TILES entry, since "cheapest" only means something relative to
// what's actually available here — a fixed dollar figure would either be
// empty or meaningless as inventory and pricing change.
const PRICE_BUCKETS: [string, number, number][] = [
  ['0-1000', 0, 1000],
  ['1001-2500', 1001, 2500],
  ['2501-5000', 2501, 5000],
  ['5001-8000', 5001, 8000],
  ['8001+', 8001, Infinity],
]

async function getProperties(locationLabel: Property['locationLabel']): Promise<Property[]> {
  return client.fetch(PROPERTIES_BY_DESTINATION_QUERY, { locationLabel })
}

async function getExperiences(destination: string): Promise<Activity[]> {
  return client.fetch(ACTIVITIES_BY_DESTINATION_QUERY, { destination })
}

export async function generateStaticParams() {
  return Object.keys(DESTINATIONS).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const dest = DESTINATIONS[slug]
  if (!dest) return {}

  const title = dest.comingSoon ? `${dest.title} — Coming Soon` : `${dest.title} Guide`
  const description = dest.heroSub

  // Same photo the page itself uses for its hero background (the first
  // matching property's hero image) — without this, link previews (iMessage,
  // WhatsApp, Slack, etc.) had no og:image to find at all and fell back to
  // the site's small favicon/logo mark instead of a real destination photo.
  // Mirrors the pattern already used on villas/[slug]/page.tsx.
  const locationLabel = LOCATION_LABEL_BY_SLUG[slug]
  const properties = locationLabel ? await getProperties(locationLabel) : []
  // Falls back to the sitewide default photo (set in layout.tsx) rather than
  // no image — matters most for "Coming Soon" destinations, which by
  // definition have no properties yet to pull a photo from.
  const ogImage = properties[0]?.heroImage?.asset?._ref
    ? urlFor(properties[0].heroImage!).width(1200).height(630).quality(85).url()
    : 'https://www.mexicanreserve.com/og-image-1.jpg'

  return {
    title,
    description,
    openGraph: { title, description, images: [ogImage] },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function DestinationPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const dest = DESTINATIONS[slug]
  if (!dest) notFound()

  if (dest.comingSoon) {
    return (
      <div className="dest-soon">
        <div className="dest-soon-inner">
          <p className="dest-soon-eyebrow">{dest.eyebrow}</p>
          <span className="dest-soon-badge">Coming Soon</span>
          <h1 className="dest-soon-title">{dest.title}</h1>
          {dest.whyStatement && <p className="dest-soon-tagline">{dest.whyStatement.headline}</p>}
          <p className="dest-soon-support">{dest.emptyNote}</p>
          {dest.insideGroups && dest.insideGroups.length > 0 && (
            <div className="dest-soon-tags">
              {dest.insideGroups.map((g) => (
                <span key={g.label} className="dest-soon-tag">{g.label}</span>
              ))}
            </div>
          )}
          <Link href="/villas?destination=punta-mita" className="bottom-cta-btn bcb-primary">
            <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            Browse Punta Mita Villas
          </Link>
        </div>
      </div>
    )
  }

  const locationLabel = LOCATION_LABEL_BY_SLUG[slug]
  const [properties, experiences] = await Promise.all([
    getProperties(locationLabel),
    getExperiences(locationLabel),
  ])
  // This is a full-width page hero, same visual role as the homepage hero —
  // matching that same quality(92) standard rather than leaving it unset.
  const heroUrl = properties[0]?.heroImage?.asset?._ref
    ? urlFor(properties[0].heroImage!).width(2400).height(1400).quality(92).url()
    : '/og-image-1.jpg'

  // Only computed for redesigned pages — each tile's community list and
  // count come straight from this destination's already-fetched properties,
  // so a tile with zero matches simply doesn't render.
  const communitiesFor = (matches: Property[]) =>
    Array.from(new Set(matches.map((p) => communityLabel(p)).filter(Boolean))).sort().slice(0, 4)

  // "Lower Nightly Rates" — the cheapest price bucket (see PRICE_BUCKETS
  // above) that actually has a property in it for this destination. Built
  // separately from FIND_VILLA_TILES rather than as a static entry, since
  // which bucket counts as "cheapest" depends on this destination's real
  // rates, not a fixed dollar figure.
  const lowerRatesBucket = PRICE_BUCKETS.find(([, lo, hi]) =>
    properties.some((p) => { const r = startingRate(p); return r != null && r >= lo && r <= hi })
  )
  const lowerRatesMatches = lowerRatesBucket
    ? properties.filter((p) => {
        const r = startingRate(p)
        return r != null && r >= lowerRatesBucket[1] && r <= lowerRatesBucket[2]
      })
    : []

  const findVillaTiles = dest.redesigned
    ? [
        ...FIND_VILLA_TILES.map((t) => {
          const matches = properties.filter(t.match)
          return { ...t, count: matches.length, communities: communitiesFor(matches) }
        }),
        ...(lowerRatesBucket ? [{
          key: 'lower-rates',
          title: 'Lower Nightly Rates',
          text: 'Our most accessible nightly rates in this collection.',
          query: `price=${lowerRatesBucket[0]}`,
          count: lowerRatesMatches.length,
          communities: communitiesFor(lowerRatesMatches),
        }] : []),
      ].filter((t) => t.count > 0)
    : []

  // Shared between the two places this can render: early (non-redesigned
  // pages) or at the end, as "Where to Stay" (redesigned pages) — the grid
  // itself never differs, only where the section sits and what it's called.
  // Sort order (featured villas first) comes from the query itself. Capped
  // to a teaser of 6 — this section is a preview, not the full listing —
  // with "View all" only appearing when there's actually more to see.
  // Redesigned pages render this inside the wider .dest-wrap--redesigned
  // column (see below), so cards get the same width as every other section
  // on the page instead of a one-off wide breakout.
  const PROPERTIES_PREVIEW_LIMIT = 6
  // Same "teaser, not the full list" reasoning as PROPERTIES_PREVIEW_LIMIT
  // above — 20-30+ experiences don't work cramped into an on-page section,
  // so this shows a handful with a link to the full, filterable /experiences
  // catalog (pre-filtered to this destination) for the rest.
  const EXPERIENCES_TEASER_LIMIT = 6
  const propertiesBody = properties.length > 0 ? (
    <>
      <div className="properties-grid" style={{ marginBottom: 24 }}>
        {properties.slice(0, PROPERTIES_PREVIEW_LIMIT).map((p) => <PropertyCard key={p._id} property={p} />)}
      </div>
      {properties.length > PROPERTIES_PREVIEW_LIMIT && (
        <Link href={`/villas?destination=${dest.slug}`} className="legal-cta">
          View all {properties.length} {dest.title} properties
          <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </Link>
      )}
    </>
  ) : (
    <div className="dest-empty">
      <p>{dest.emptyNote}</p>
      <Link href="/villas" className="btn-primary">Browse all properties</Link>
    </div>
  )

  return (
    <>
      <div id="dest-hero" style={{ backgroundImage: `url('${heroUrl}')` }}>
        <p className="pg-eyebrow">{dest.eyebrow}</p>
        <h1 className="pg-title">
          {dest.title}
          {dest.titleSuffix && <span className="pg-title-suffix"> — {dest.titleSuffix}</span>}
        </h1>
        <p className="pg-sub">{dest.heroSub}</p>
      </div>

      <div className={`dest-wrap${dest.redesigned ? ' dest-wrap--redesigned' : ''}`}>
        {dest.redesigned && dest.whyStatement ? (
          <div className="dest-why">
            <span className="dest-why-eyebrow">Why {dest.title}</span>
            <p className="dest-why-headline">{dest.whyStatement.headline}</p>
            <span className="dest-why-rule" />
            <p className="dest-why-support">{dest.whyStatement.support}</p>
          </div>
        ) : (
          dest.overview?.map((p, i) => (
            <p key={i} className="legal-intro">{p}</p>
          ))
        )}

        {dest.redesigned && (
          <div className="dest-numbers">
            <div className="dest-numbers-grid">
              {dest.facts.map((f) => (
                <div key={f.label} className="dest-numbers-item">
                  <span className="dest-numbers-value">{f.value}</span>
                  <span className="dest-numbers-label">{f.label}</span>
                  <span className="dest-numbers-sub">{f.sub}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!dest.redesigned && (
          <div className="detail-section">
            <span className="sec-label">{properties.length > 0 ? '01' : '02'}</span>
            <h2 className="sec-title">Properties in {dest.title}</h2>
            {propertiesBody}
          </div>
        )}

        {dest.redesigned && (dest.insideExperiences || dest.insideGroups) ? (
          <>
            <div className="detail-section">
              <span className="sec-label">01</span>
              <h2 className="sec-title">{dest.insideSectionTitle || 'Inside the Gates'}</h2>
              <p className="dest-section-intro">{dest.insideSectionIntro || 'Reserved for guests and residents inside the gates — not open to the public.'}</p>
              {dest.insideGroups ? (
                dest.insideGroups.map((g) => (
                  <div key={g.label} className="dest-subgroup">
                    <p className="dest-subgroup-label">{g.label}</p>

                    {g.layout === 'cinematic' && (
                      <div className="dest-cinematic-stack">
                        {g.items.map((e) => (
                          <div
                            key={e.title}
                            className="dest-cinematic-band"
                            style={e.imageUrl ? {
                              backgroundImage: `url('${e.imageUrl}')`,
                              backgroundPosition: e.imagePosition || 'center',
                            } : undefined}
                          >
                            {!e.imageUrl && <span className="dest-cinematic-photo-label">Photo placeholder</span>}
                            {e.stat && <span className="dest-cinematic-stat">{e.stat}</span>}
                            <div className="dest-cinematic-text">
                              <h3 className="dest-cinematic-title">{e.title}</h3>
                              <p className="dest-cinematic-desc">{e.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {g.layout === 'showcase' && (
                      <BeachClubShowcase
                        items={g.items.map((e) => ({
                          title: e.title,
                          vibe: e.vibe || '',
                          tags: e.tags || [],
                          text: e.text,
                          images: e.images || (e.imageUrl ? [e.imageUrl] : []),
                        }))}
                      />
                    )}

                    {g.layout === 'list' && (
                      <div className="dest-amenity-list">
                        {g.items.map((e) => (
                          <div key={e.title} className="dest-amenity-row">
                            <p className="dest-amenity-title">{e.title}</p>
                            <p className="dest-amenity-text">{e.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {g.note && <p className="legal-note">{g.note}</p>}
                  </div>
                ))
              ) : (
                <div className="guide-grid">
                  {dest.insideExperiences?.map((e) => (
                    <div key={e.title} className="guide-card">
                      <h3 className="guide-card-title">{e.title}</h3>
                      <p className="guide-card-text">{e.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {dest.photoBreak && (
              <div
                className="dest-photo-break"
                style={dest.photoBreak.imageUrl ? {
                  backgroundImage: `url('${dest.photoBreak.imageUrl}')`,
                  backgroundPosition: dest.photoBreak.imagePosition || 'center',
                } : undefined}
              >
                {!dest.photoBreak.imageUrl && <span className="dest-photo-break-label">Photo placeholder</span>}
                <p className="dest-photo-break-caption">{dest.photoBreak.caption}</p>
              </div>
            )}

            {findVillaTiles.length > 0 && (
              <div className="detail-section">
                <span className="sec-label">02</span>
                <h2 className="sec-title">Villas to Match the Way You Travel</h2>
                <p className="dest-section-intro">{dest.findVillaIntro}</p>
                <div className="dest-find-grid">
                  {findVillaTiles.map((t) => (
                    <Link key={t.key} href={`/villas?destination=${dest.slug}${t.query ? `&${t.query}` : ''}`} className="dest-find-card">
                      <h3 className="dest-find-card-title">{t.title}</h3>
                      <p className="dest-find-card-text">{t.text}</p>
                      <p className="dest-find-card-communities">
                        {t.communities.length > 0 ? t.communities.join(', ') : `Available in ${dest.title}`}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <span className="sec-label">{findVillaTiles.length > 0 ? '03' : '02'}</span>
              <h2 className="sec-title">Where to Stay</h2>
              {propertiesBody}
            </div>
          </>
        ) : (
          <div className="detail-section">
            <span className="sec-label">{properties.length > 0 ? '02' : '01'}</span>
            <h2 className="sec-title">Experiences</h2>
            <div className="guide-grid">
              {dest.experiences?.map((e) => (
                <div key={e.title} className="guide-card">
                  <h3 className="guide-card-title">{e.title}</h3>
                  <p className="guide-card-text">{e.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {experiences.length > 0 && (
          <div className="detail-section">
            <span className="sec-label">
              {dest.redesigned
                ? (findVillaTiles.length > 0 ? '04' : '03')
                : (properties.length > 0 ? '03' : '02')}
            </span>
            <h2 className="sec-title">Concierge &amp; Experiences</h2>
            <p className="dest-section-intro">Arranged for guests staying in {dest.title} — a preview of what your concierge can book.</p>
            <div className="exp-card-grid">
              {experiences.slice(0, EXPERIENCES_TEASER_LIMIT).map((e) => (
                <ExperienceCard key={e._id} experience={e} activeDestination={locationLabel} />
              ))}
            </div>
            {experiences.length > EXPERIENCES_TEASER_LIMIT && (
              <Link href={`/experiences?destination=${dest.slug}`} className="legal-cta" style={{ marginTop: 24 }}>
                Explore all {experiences.length} {dest.title} experiences
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </Link>
            )}
          </div>
        )}

        {!dest.redesigned && (
          <div className="detail-section">
            <span className="sec-label">03</span>
            <h2 className="sec-title">Getting Here &amp; When to Visit</h2>
            <div className="facts-grid dest-facts-grid">
              {dest.facts.map((f) => (
                <div key={f.label} className="fact-card">
                  <span className="fact-label">{f.label}</span>
                  <span className="fact-value">{f.value}</span>
                  <span className="fact-sub">{f.sub}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bottom-cta">
          <div className="bottom-cta-inner">
            <div className="bottom-cta-text">
              <h3>Ready to experience <em>{dest.title}</em>?</h3>
              <p>Browse our villas or reach out and we&rsquo;ll help you plan the right stay.</p>
            </div>
            <div className="bottom-cta-btns">
              <Link href="/villas" className="bottom-cta-btn bcb-primary">
                <svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                Browse all villas
              </Link>
              <Link href="/contact" className="bottom-cta-btn bcb-secondary">
                <svg viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                Contact our team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
