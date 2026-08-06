// ─────────────────────────────────────────────────────────────
// Punta Mita community map data
// ─────────────────────────────────────────────────────────────
// Powers the "Explore the Communities" page (/destinations/punta-mita/
// communities) — one pin per gated community on the peninsula.
//
// IMPORTANT — every lat/lng below is still a placeholder, not a verified
// position. The first version of this file only guessed at 15 of the ~31
// communities in COMM_LABELS (src/lib/utils.ts) and got several visibly
// wrong (pins landing in open water, Kupuri in the wrong spot). This
// version lists every Punta Mita slug so nothing is silently missing from
// the page, but the coordinates themselves still need to come from
// Francisco, not another guess — see the drag-to-correct "calibrate" mode
// in CommunityMap.tsx, reached by adding ?calibrate=1 to the page's URL.
// Slugs here must match `communityPuntaMita` in Sanity exactly — a
// community only actually appears on the page once it has at least one
// published property (computed live, not hardcoded).
export type CommunityGeo = {
  slug: string
  name: string
  lat: number
  lng: number
  description: string
}

export const PUNTA_MITA_COMMUNITIES: CommunityGeo[] = [
  { slug: '7-eight-bahia-golf-residences', name: '7 Eight Bahia', lat: 20.7605, lng: -105.5275, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: '7-eight', name: '7 Eight', lat: 20.7608, lng: -105.5278, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'bahia-signature-estates', name: 'Bahia Signature Estates', lat: 20.7600, lng: -105.5290, description: 'Homes along the Bahia course, on the peninsula’s eastern side facing toward Banderas Bay.' },
  { slug: 'bellavista-residences', name: 'Bellavista Residences', lat: 20.7695, lng: -105.5370, description: 'Elevated, hillside homes on the peninsula’s west side, above the golf course.' },
  { slug: 'bellavista', name: 'Bellavista', lat: 20.7697, lng: -105.5372, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'cuora', name: 'Cuora', lat: 20.7680, lng: -105.5340, description: 'On the western side of the peninsula, near the Pacifico course.' },
  { slug: 'el-encanto', name: 'El Encanto', lat: 20.7670, lng: -105.5360, description: 'Set back from the beach clubs toward the interior of the peninsula, closer to the golf courses than the sand.' },
  { slug: 'el-encanto-villas', name: 'El Encanto Villas', lat: 20.7672, lng: -105.5362, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'four-seasons-residences', name: 'Four Seasons Residences', lat: 20.7715, lng: -105.5390, description: 'Beachfront residences on the northwest point of the peninsula, within the Four Seasons resort grounds and its full-service amenities.' },
  { slug: 'hacienda-de-mita', name: 'Hacienda de Mita', lat: 20.7590, lng: -105.5250, description: 'A residential pocket on the peninsula’s eastern side, closer to the entrance gate than the beach clubs.' },
  { slug: 'iyari-estates', name: 'Iyari Estates', lat: 20.7635, lng: -105.5330, description: 'Estates bordering the Pacifico course fairways, with views over the greens rather than the ocean.' },
  { slug: 'iyari-villas', name: 'Iyari Villas', lat: 20.7637, lng: -105.5332, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'iyari', name: 'Iyari', lat: 20.7639, lng: -105.5334, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'kupuri', name: 'Kupuri', lat: 20.7745, lng: -105.5300, description: 'A beachfront enclave on the peninsula’s north shore, closest to Kupuri Beach Club and its kids’ and teens’ clubs.' },
  { slug: 'kupuri-beach-residences', name: 'Kupuri Beach Residences', lat: 20.7747, lng: -105.5302, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'la-punta-estates', name: 'La Punta Estates', lat: 20.7565, lng: -105.5395, description: 'Near the southern tip of the peninsula, closest to the surf breaks just outside the gates.' },
  { slug: 'la-serenata', name: 'La Serenata', lat: 20.7567, lng: -105.5397, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'lagos-del-mar', name: 'Lagos del Mar', lat: 20.7660, lng: -105.5305, description: 'Set among the lagoons at the heart of the golf course, in the middle of the peninsula.' },
  { slug: 'las-marietas', name: 'Las Marietas', lat: 20.7615, lng: -105.5340, description: 'Toward the southern half of the peninsula, near the Bahia course.' },
  { slug: 'las-palmas', name: 'Las Palmas', lat: 20.7650, lng: -105.5345, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'las-palmas-golf-estates', name: 'Las Palmas Golf Estates', lat: 20.7652, lng: -105.5347, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'las-palmas-selva', name: 'Las Palmas Selva', lat: 20.7654, lng: -105.5349, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'las-terrazas', name: 'Las Terrazas', lat: 20.7645, lng: -105.5350, description: 'Central to the peninsula, near the golf course’s midpoint.' },
  { slug: 'las-vistas-estates', name: 'Las Vistas Estates', lat: 20.7647, lng: -105.5352, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'pacifico-estates', name: 'Pacifico Estates', lat: 20.7665, lng: -105.5320, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'porta-fortuna', name: 'Porta Fortuna', lat: 20.7620, lng: -105.5320, description: 'Toward the center of the peninsula, inland from both coastlines.' },
  { slug: 'porta-fortuna-golf', name: 'Porta Fortuna Golf', lat: 20.7622, lng: -105.5322, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'porta-fortuna-zen-casitas', name: 'Porta Fortuna Zen Casitas', lat: 20.7624, lng: -105.5324, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'ranchos-estates', name: 'Ranchos Estates', lat: 20.7625, lng: -105.5310, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'signature-estates', name: 'Signature Estates', lat: 20.7605, lng: -105.5270, description: 'On the eastern side of the peninsula, near the Bahia course.' },
  { slug: 'tau-residences', name: 'TAU Residences', lat: 20.7580, lng: -105.5370, description: 'Near the southern point of the peninsula, between the Pacific side and Banderas Bay.' },
  { slug: 'tau', name: 'TAU Residences', lat: 20.7582, lng: -105.5372, description: 'Placeholder position — needs to be set via the calibrate tool.' },
  { slug: 'the-surf-residences', name: 'The Surf Residences', lat: 20.7570, lng: -105.5390, description: 'Placeholder position — needs to be set via the calibrate tool.' },
]
