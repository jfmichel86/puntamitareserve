// ─────────────────────────────────────────────────────────────
// Punta Mita community map data
// ─────────────────────────────────────────────────────────────
// Powers the "Explore the Communities" page (/destinations/punta-mita/
// communities) — one pin per gated community on the peninsula.
//
// Positions marked "verified" below came from Francisco dragging each pin
// to its real spot in the drag-to-correct "calibrate" mode
// (CommunityMap.tsx, ?calibrate=1 on the page URL) — trustworthy.
// Everything in the second group has never had a live listing to show a
// pin for yet, so its position is still an unverified first-draft guess —
// needs the same calibrate pass once that community has real inventory.
//
// This file only holds what can't be derived from real listing data:
// where the pin sits, and the one-paragraph description (which Francisco
// corrected by hand for communities that split into multiple distinct
// products under one Sanity label — Iyari, Porta Fortuna, El Encanto,
// Kupuri, Las Palmas). The 4 feature pills (location, views, pool,
// bedroom range) are NOT stored here — per Francisco's direction
// (2026-08-06), those come straight from each community's actual
// published properties in Sanity (the `viewsAndPool` and `bedrooms`
// fields), computed live in the page itself. See aggregateLocation /
// aggregateViews / aggregatePool / aggregateBedrooms in
// src/app/destinations/punta-mita/communities/page.tsx.
//
// This list is checked directly against Sanity's real community dropdown
// (29 entries, confirmed by Francisco on 2026-08-06). Slugs must match
// `communityPuntaMita` in Sanity exactly (see COMM_LABELS in
// src/lib/utils.ts) — a community only actually appears on the page once
// it has at least one published property (computed live, not hardcoded).
//
// sunOrientation powers the compare-communities table's "Sunrise/Sunset"
// row. This isn't tracked anywhere in Sanity — it's Francisco's own read
// of which side of the peninsula each community faces (confirmed
// 2026-08-07): 'sunset' = west-facing open Pacific, 'sunrise' =
// south-east or north-east facing (Banderas Bay / Litibu Bay side),
// 'both' = a community like La Punta Estates whose lots wrap the tip and
// split across both sides, 'none' = inland/golf-or-lagoon-facing with no
// open-water sightline. Only set for communities with a live listing
// today — no point guessing an orientation for one that isn't shown yet.
export type CommunityGeo = {
  slug: string
  name: string
  lat: number
  lng: number
  description: string
  sunOrientation?: 'sunset' | 'sunrise' | 'both' | 'none'
}

export const PUNTA_MITA_COMMUNITIES: CommunityGeo[] = [
  // ── Verified positions (from the calibrate tool) ──────────────────
  { slug: '7-eight-bahia-golf-residences', name: '7 Eight Bahia', lat: 20.7781, lng: -105.5280, description: 'Four low-rise buildings on the 7th and 8th fairways of the Bahia course — four-bedroom residences with a private plunge pool on every terrace, an easy walk to Pacifico Beach Club.', sunOrientation: 'none' },
  { slug: 'el-encanto', name: 'El Encanto', lat: 20.7662, lng: -105.5301, description: 'Condominiums within El Encanto, most looking out over the Pacifico course’s fairways or the community’s lakes rather than the ocean.', sunOrientation: 'none' },
  { slug: 'el-encanto-villas', name: 'El Encanto Villas', lat: 20.7651, lng: -105.5295, description: 'Sixteen standalone villas within El Encanto — the community’s only ocean-facing homes, each with its own pool.', sunOrientation: 'sunrise' },
  { slug: 'hacienda-de-mita', name: 'Hacienda de Mita', lat: 20.7708, lng: -105.5219, description: 'Punta Mita’s only true beachfront condominium community — low-rise buildings with their own infinity pool, direct beach access, and Pacifico fairway views.', sunOrientation: 'sunrise' },
  { slug: 'iyari-estates', name: 'Iyari Estates', lat: 20.7850, lng: -105.5134, description: 'Large private lots on Litibu Bay, each with its own custom-built villa — no two homes alike, from the footprint to the architecture.', sunOrientation: 'sunrise' },
  { slug: 'iyari-villas', name: 'Iyari Villas', lat: 20.7843, lng: -105.5148, description: 'A single matched collection of villas in Iyari, all sharing the same architecture and layout — four bedrooms, a private plunge pool, and access to the community’s cabana on Playa Iyari.', sunOrientation: 'sunrise' },
  { slug: 'kupuri', name: 'Kupuri', lat: 20.7819, lng: -105.5115, description: 'Forty-one home sites sold individually across Kupuri — every villa custom-built and different from the next, near the Kupuri Beach Club’s sushi counter, Ka restaurant, and treehouse spa.', sunOrientation: 'sunrise' },
  { slug: 'kupuri-beach-residences', name: 'Kupuri Beach Residences', lat: 20.7803, lng: -105.5086, description: 'A single matched collection of condominiums within Kupuri, all built to the same design, a short walk from the Kupuri Beach Club.', sunOrientation: 'sunrise' },
  { slug: 'la-punta-estates', name: 'La Punta Estates', lat: 20.7599, lng: -105.5348, description: 'Thirty-one oceanfront lots on the peninsula’s western tip next to the St. Regis, each with 270-degree views and a second, separately gated entrance.', sunOrientation: 'both' },
  { slug: 'lagos-del-mar', name: 'Lagos del Mar', lat: 20.7686, lng: -105.5259, description: 'Contemporary homes built around the golf course’s interior lagoons, with cantilevered rooflines and floor-to-ceiling glass framing the water on both sides.', sunOrientation: 'sunrise' },
  { slug: 'las-marietas', name: 'Las Marietas', lat: 20.7634, lng: -105.5350, description: 'An ultra-private enclave at the peninsula’s edge, named for the Marietas Islands visible from nearly every residence — five to eight bedrooms, minimal density.', sunOrientation: 'sunset' },
  { slug: 'las-palmas', name: 'Las Palmas', lat: 20.7742, lng: -105.5313, description: 'Twenty-eight houses in Las Palmas’ original phase, nearly all facing the golf course — three and four bedrooms, built to a small set of very similar layouts.', sunOrientation: 'none' },
  { slug: 'las-palmas-selva', name: 'Las Palmas Selva', lat: 20.7748, lng: -105.5301, description: 'Larger four-bedroom villas than Las Palmas’ original phase, set back among dense tropical planting rather than facing a view — nearly all built to the same architecture and layout.', sunOrientation: 'none' },
  { slug: 'las-terrazas', name: 'Las Terrazas', lat: 20.7732, lng: -105.5258, description: 'A 27-unit boutique condominium on the Pacifico course’s 14th fairway, centered on twin pools linked by a 160-meter saltwater swimming canal.', sunOrientation: 'none' },
  { slug: 'las-vistas-estates', name: 'Las Vistas Estates', lat: 20.7794, lng: -105.5238, description: 'Punta Mita’s newest hillside community, on Careyeros hill, with homesites looking out over the entire peninsula, the Four Seasons, and the Tail of the Whale.', sunOrientation: 'sunset' },
  { slug: 'pacifico-estates', name: 'Pacifico Estates', lat: 20.7710, lng: -105.5374, description: 'West-facing homes near the Pacifico course built for sunset — horizontal architecture and extensive glazing framing the Pacific’s golden hour.', sunOrientation: 'sunset' },
  { slug: 'porta-fortuna', name: 'Porta Fortuna', lat: 20.7627, lng: -105.5313, description: 'Porta Fortuna’s original ocean-facing villas, in two rows — first-row homes sit beachfront with five real bedrooms, second-row villas hold four bedrooms and their own ocean views.', sunOrientation: 'sunrise' },
  { slug: 'porta-fortuna-golf', name: 'Porta Fortuna Golf', lat: 20.7636, lng: -105.5328, description: 'The newest villas in Porta Fortuna — a matched set of four-plus-bedroom homes facing the golf course, sharing a consistent layout and architecture.', sunOrientation: 'none' },
  { slug: 'porta-fortuna-zen-casitas', name: 'Porta Fortuna Zen Casitas', lat: 20.7629, lng: -105.5323, description: 'Three-bedroom casitas within Porta Fortuna built for quiet — private pool, ocean and golf views, and a short walk to Sufi Ocean Club’s fire pit and restaurant.', sunOrientation: 'sunrise' },
  { slug: 'ranchos-estates', name: 'Ranchos Estates', lat: 20.7684, lng: -105.4999, description: 'One of Punta Mita’s original beachfront communities — some of the peninsula’s largest oceanfront estates, set in mature tropical gardens near the Pacifico course.', sunOrientation: 'sunset' },
  { slug: 'tau-residences', name: 'TAU Residences', lat: 20.7622, lng: -105.5351, description: 'Punta Mita’s newest enclave, at the peninsula’s southern point, built for sunset views with modern, smart-home-equipped two- to five-bedroom residences.', sunOrientation: 'sunset' },
  { slug: 'the-surf-residences', name: 'The Surf Residences', lat: 20.7639, lng: -105.4900, description: 'Forty condos by architects Sordo Madaleno, set directly in front of the La Lancha surf break with views of the Marietas Islands and Banderas Bay.', sunOrientation: 'sunset' },

  // ── Not yet verified — no live listing yet, so never shown a pin to
  //    calibrate. Positions are still rough first-draft guesses; will
  //    need the calibrate tool once a property lists in one of these. ──
  { slug: 'bahia-signature-estates', name: 'Bahia Signature Estates', lat: 20.7600, lng: -105.5290, description: 'Estates set between the Bahia fairways and the open Pacific, most with a private infinity pool angled toward the water — three to six bedrooms, no two homes alike.' },
  { slug: 'bellavista-residences', name: 'Bellavista Residences', lat: 20.7695, lng: -105.5370, description: 'Eleven hillside homes above the golf courses, each with floor-to-ceiling glass, a private pool, and sweeping views over the Pacific and both fairways below.' },
  { slug: 'cuora', name: 'Cuora', lat: 20.7680, lng: -105.5340, description: 'A beachfront enclave with its own private beach club, pools, and spa — residences range from garden villas to rooftop penthouses, all oceanfront.' },
  { slug: 'four-seasons-residences', name: 'Four Seasons Residences', lat: 20.7715, lng: -105.5390, description: 'Private villas and residences inside the Four Seasons Resort grounds, with full access to the hotel’s dining, spa, and daily service standards.' },
  { slug: 'la-serenata', name: 'La Serenata', lat: 20.7567, lng: -105.5397, description: 'A secluded, low-density enclave designed around quiet — spa-style finishes and generous grounds on four- to seven-bedroom homes.' },
  { slug: 'las-palmas-golf-estates', name: 'Las Palmas Golf Estates', lat: 20.7742, lng: -105.5313, description: 'Large home sites in Las Palmas, sold as lots rather than finished houses — every future villa here will be custom-built and different from its neighbors.' },
  { slug: 'signature-estates', name: 'Signature Estates', lat: 20.7605, lng: -105.5270, description: 'Oceanfront homes between the Pacific and the golf course fairways, many with cliffside infinity pools — no two residences built alike.' },
]
