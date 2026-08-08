// ─────────────────────────────────────────────────────────────
// Punta Mita beach club map data
// ─────────────────────────────────────────────────────────────
// Powers the "distance to closest beach club" row on the upcoming compare-
// communities table. Only shows up in the community map's calibrate mode
// (?calibrate=1) — the same drag-to-correct workflow already used for
// community pins (see CommunityMap.tsx). Positions below are rough
// first-draft guesses; not trustworthy until Francisco drags each one to
// its real spot and sends back the corrected list.
//
// The 5 clubs are Punta Mita's real Residents' Beach Clubs (confirmed by
// Francisco) — there is no 6th, and none of them belong to Four Seasons.
export type BeachClubGeo = {
  slug: string
  name: string
  lat: number
  lng: number
}

export const PUNTA_MITA_BEACH_CLUBS: BeachClubGeo[] = [
  { slug: 'pacifico-beach-club', name: 'Pacífico Beach Club', lat: 20.7700, lng: -105.5230 },
  { slug: 'sea-breeze-beach-club', name: 'Sea Breeze Beach Club', lat: 20.7590, lng: -105.5340 },
  { slug: 'kupuri-beach-club', name: 'Kupuri Beach Club', lat: 20.7810, lng: -105.5100 },
  { slug: 'sufi-ocean-club', name: 'Sufi Ocean Club', lat: 20.7625, lng: -105.5310 },
  { slug: 'el-surf-club', name: 'El Surf Club', lat: 20.7639, lng: -105.4900 },
]
