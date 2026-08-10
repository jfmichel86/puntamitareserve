// ─────────────────────────────────────────────────────────────
// Punta Mita beach club map data
// ─────────────────────────────────────────────────────────────
// Powers the "distance to closest beach club" row on the compare-
// communities table. Positions below came from Francisco dragging each
// pin to its real spot in the community map's calibrate mode
// (?calibrate=1) on 2026-08-07 — trustworthy, same as the verified
// community positions in puntaMitaCommunities.ts.
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
  { slug: 'pacifico-beach-club', name: 'Pacífico Beach Club', lat: 20.7806, lng: -105.5309 },
  { slug: 'sea-breeze-beach-club', name: 'Sea Breeze Beach Club', lat: 20.7698, lng: -105.5385 },
  { slug: 'kupuri-beach-club', name: 'Kupuri Beach Club', lat: 20.7820, lng: -105.5086 },
  { slug: 'sufi-ocean-club', name: 'Sufi Ocean Club', lat: 20.7631, lng: -105.5302 },
  { slug: 'el-surf-club', name: 'El Surf Club', lat: 20.7629, lng: -105.4915 },
]
