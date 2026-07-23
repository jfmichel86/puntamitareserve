// ─────────────────────────────────────────────────────────────
// Property detail page data — icon/label dictionaries copied
// verbatim from property-detail.html + shared.js (single source
// of truth on the live site). Keep in sync if Sanity schema options change.
// ─────────────────────────────────────────────────────────────

export const MEMBERSHIP_LABELS: Record<string, string> = {
  'golf-membership': 'Golf Membership',
  'sport-membership': 'Sport Membership',
}

export const BED_LABELS: Record<string, string> = {
  king: 'King bed',
  queen: 'Queen bed',
  full: 'Full bed',
  twin: 'Twin bed',
  single: 'Single bed',
  double: 'Double bed',
  bunk: 'Bunk bed',
  'sofa-bed': 'Sofa bed',
  crib: 'Crib',
  trundle: 'Trundle bed',
}

export const LOC_LABEL: Record<string, string> = {
  'punta-mita': 'Punta Mita, Nayarit',
  'punta-de-mita-area': 'Punta de Mita, Nayarit',
  'puerto-vallarta': 'Puerto Vallarta, Jalisco',
}

export const VIEW_H2_MAP: Record<string, string> = {
  beachfront: 'Beachfront',
  oceanfront: 'Oceanfront',
  'golf-course-view': 'Golf Course',
  'golf-course': 'Golf Course',
  'ocean-view': 'Ocean View',
  'lake-view': 'Lake View',
  hillside: 'Hillside',
}

export const AMENITY_LABELS: Record<string, string> = {
  // Essential Features
  'air-conditioning': 'Air Conditioning', wifi: 'High Speed Internet & WiFi', safe: 'Safe',
  'towels-provided': 'Towels Provided', 'washing-machine': 'Washing Machine',
  'linens-provided': 'Linens Provided', 'clothes-dryer': 'Clothes Dryer', 'first-aid-kit': 'First-Aid Kit',
  // Kitchen & Dining
  bar: 'Bar', 'coffee-maker': 'Coffee Maker', 'wine-cellar': 'Wine Cellar',
  'coffee-grinder': 'Coffee Grinder', nespresso: 'Nespresso Machine',
  // Entertainment & Health
  'basketball-court': 'Basketball Court',
  'bocce-ball-court': 'Bocce Ball Court', 'bowling-alley': 'Bowling Alley',
  'cards-poker-table': 'Cards / Poker Table',
  'cinema-room': 'Cinema Room', foosball: 'Foosball', games: 'Games',
  'golf-simulator': 'Golf Simulator', gym: 'Gym / Fitness Room', 'golf-clubs': 'High End Golf Clubs',
  'media-room': 'Media Room', petanque: 'Pétanque', piano: 'Piano',
  'pickleball-court': 'Pickleball Court', 'ping-pong': 'Ping Pong Table', 'pool-table': 'Pool Table',
  'putting-green': 'Putting Green', 'satellite-cable-tv': 'Satellite & Cable TV',
  'scrabble-table': 'Scrabble Table', shuffleboard: 'Shuffleboard Table',
  'smart-tv': 'Smart TV', sonos: 'SONOS Sound System', 'sound-system': 'Sound System',
  'tennis-court': 'Tennis Court', 'video-games': 'Video Games', 'yoga-room': 'Yoga Room',
  // Outdoor Features
  'beach-chairs': 'Beach Chairs', bicycles: 'Bicycles', 'boat-yacht': 'Boat / Yacht',
  'boogie-boards': 'Boogie Boards', cornhole: 'Cornhole', croquet: 'Croquet',
  kayaks: 'Kayaks', 'paddle-boards': 'Paddle Boards', 'private-vehicle': 'Private Vehicle',
  'snorkel-equipment': 'Snorkel Equipment', 'surf-boards': 'Surf Boards',
  // Pool & Spa Facilities
  'alfresco-dining': 'Alfresco Dining', 'palapa-roof': 'Alfresco Palapa Roof',
  'bbq-grill': 'BBQ / Grill', 'cold-water-tub': 'Cold Water Tub',
  'electric-massage-bed': 'Electric Massage Bed', firepit: 'Firepit',
  'heated-infinity-pool': 'Heated Infinity Pool', 'heated-pool': 'Heated Pool',
  'hot-tub': 'Hot Tub', 'infrared-room': 'Infrared Room', jacuzzi: 'Jacuzzi',
  'private-spa': 'Private Spa', sauna: 'Sauna', 'steam-room': 'Steam Room',
  'sun-loungers': 'Sun Loungers', 'volleyball-pool': 'Volleyball Pool', 'wet-bar': 'Wet Bar',
  // Office
  'computer-monitor': 'Computer Monitor', desk: 'Desk', 'desk-chair': 'Desk Chair', printer: 'Printer',
  // Community Amenities
  'communal-heated-pool': 'Communal Heated Pool', 'shared-gym': 'Shared Gym',
  'community-ping-pong': 'Ping Pong Table', 'community-foosball': 'Foosball Table',
  // Accessibility
  elevator: 'Elevator', 'ground-floor-bedroom': 'Ground Floor Bedroom',
  'wheelchair-accessible': 'Wheelchair Accessible',
}

export const STAFF_NAMES: Record<string, string> = {
  concierge: 'Concierge', housekeeper: 'Housekeeper',
  chef: 'Chef', cook: 'Cook', 'sous-chef': 'Sous Chef / Chef Assistant',
  butler: 'Butler', driver: 'Driver', babysitter: 'Babysitter',
  gardener: 'Groundskeeper', security: 'Security',
  waiter: 'Waiter / Server', bartender: 'Bartender',
}

// Kept in sync with the checkbox values defined per-role in
// sanity-studio/components/StaffServicesInput.jsx — that file is the source
// of truth for which raw values actually exist. table-meal-service,
// cocktail-preparation, bar-service, table-service, beverage-service and
// guest-attention (Waiter and Butler/Bartender roles) were missing here,
// which is why those roles were rendering their raw, hyphenated Sanity
// values instead of real words.
export const STAFF_SERVICE_LABELS: Record<string, string> = {
  'daily-cleaning': 'Daily Cleaning',
  laundry: 'Laundry',
  'linen-changes': 'Linen Changes',
  'turndown-service': 'Turndown Service',
  'grocery-shopping': 'Grocery Shopping',
  'activity-bookings': 'Activity Bookings',
  'restaurant-reservations': 'Restaurant Reservations',
  'transportation-arrangements': 'Transportation Arrangements',
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  'meal-preparation': 'Meal Preparation',
  'menu-planning': 'Menu Planning',
  'kitchen-assistance': 'Kitchen Assistance',
  'all-meals': 'All Meals',
  'custom-menus': 'Custom Menus',
  'table-service': 'Table Service',
  'beverage-service': 'Beverage Service',
  'guest-attention': 'Personalized Guest Attention',
  'table-meal-service': 'Meal & Beverage Table Service',
  'cocktail-preparation': 'Cocktail Preparation',
  'bar-service': 'Bar Service',
}

export type AmenityCat = { label: string; icon: React.ReactNode; keys: string[] }

export const AMENITY_CATS: AmenityCat[] = [
  {
    label: 'Essential Features',
    icon: <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    keys: ['air-conditioning', 'wifi', 'safe', 'towels-provided', 'washing-machine', 'linens-provided', 'clothes-dryer', 'first-aid-kit'],
  },
  {
    label: 'Kitchen & Dining',
    icon: <svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>,
    keys: ['bar', 'coffee-maker', 'wine-cellar', 'coffee-grinder', 'nespresso'],
  },
  {
    label: 'Entertainment & Health',
    icon: <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
    keys: ['basketball-court', 'bocce-ball-court', 'bowling-alley', 'cards-poker-table', 'cinema-room', 'foosball', 'games', 'golf-simulator', 'gym', 'golf-clubs', 'media-room', 'petanque', 'piano', 'pickleball-court', 'ping-pong', 'pool-table', 'putting-green', 'satellite-cable-tv', 'scrabble-table', 'shuffleboard', 'smart-tv', 'sonos', 'sound-system', 'tennis-court', 'video-games', 'yoga-room'],
  },
  {
    label: 'Outdoor Features',
    icon: <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    keys: ['beach-chairs', 'bicycles', 'boat-yacht', 'boogie-boards', 'cornhole', 'croquet', 'kayaks', 'paddle-boards', 'private-vehicle', 'snorkel-equipment', 'surf-boards'],
  },
  {
    label: 'Pool & Spa Facilities',
    icon: <svg viewBox="0 0 24 24"><path d="M2 20c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 16c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2"/></svg>,
    keys: ['alfresco-dining', 'palapa-roof', 'bbq-grill', 'cold-water-tub', 'electric-massage-bed', 'firepit', 'heated-infinity-pool', 'heated-pool', 'hot-tub', 'infrared-room', 'jacuzzi', 'private-spa', 'sauna', 'steam-room', 'sun-loungers', 'volleyball-pool', 'wet-bar'],
  },
  {
    label: 'Office',
    icon: <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    keys: ['computer-monitor', 'desk', 'desk-chair', 'printer'],
  },
  {
    label: 'Community Amenities',
    icon: <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    keys: ['communal-heated-pool', 'shared-gym', 'community-ping-pong', 'community-foosball'],
  },
  {
    label: 'Accessibility',
    icon: <svg viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><path d="M12 8v4"/><path d="M8 21l4-8 4 8"/><path d="M6 13h12"/></svg>,
    keys: ['elevator', 'ground-floor-bedroom', 'wheelchair-accessible'],
  },
]

// Amenity "highlight" priority — used by AmenitiesSection to surface a
// short row of standout amenities above the full categorized checklist,
// so a genuinely impressive villa doesn't get buried under 40+ checkmarks.
// Per Francisco (2026-07-21, refined 2026-07-21): every amenity in
// Entertainment & Health and Pool & Spa Facilities is ranked together in
// ONE combined list — not category-by-category — purely by how difficult
// or expensive the amenity is to actually have: dedicated square footage +
// build cost + rarity, NOT how fun it sounds or which category it happens
// to sit in. That's why a Private Spa, Sauna, and Infrared Room (all Pool &
// Spa) rank above a Smart TV, Satellite & Cable TV, or Ping Pong Table (all
// Entertainment & Health) — a real spa is a bigger investment than a TV,
// regardless of category. Nothing outside these two categories qualifies —
// see pickAmenityHighlights() below for what happens when a property
// doesn't have enough of these to fill the row.
export const AMENITY_HIGHLIGHTS_PRIORITY: string[] = [
  'tennis-court',
  'bowling-alley',
  'golf-simulator',
  'cinema-room',
  'heated-infinity-pool',
  'private-spa',
  'steam-room',
  'sauna',
  'infrared-room',
  'basketball-court',
  'pickleball-court',
  'putting-green',
  'gym',
  'media-room',
  'volleyball-pool',
  'cold-water-tub',
  'wet-bar',
  'bocce-ball-court',
  'petanque',
  'yoga-room',
  'piano',
  'electric-massage-bed',
  'heated-pool',
  'hot-tub',
  'jacuzzi',
  'alfresco-dining',
  'palapa-roof',
  'firepit',
  'bbq-grill',
  'sun-loungers',
  'pool-table',
  'shuffleboard',
  'cards-poker-table',
  'scrabble-table',
  'foosball',
  'ping-pong',
  'games',
  'video-games',
  'smart-tv',
  'satellite-cable-tv',
  'sonos',
  'sound-system',
  'golf-clubs',
]

function catKeys(label: string): string[] {
  return AMENITY_CATS.find((c) => c.label === label)?.keys || []
}

// Builds the amenity highlight row for one property. Every item from
// Entertainment & Health and Pool & Spa Facilities the property has gets
// picked in the single cost/rarity order above, capped at `max`. Per
// Francisco: every property must show at least `min` amenities if at all
// possible — a condo or small villa may not have enough of those two
// categories to reach that floor, so as a last resort (never used just to
// pad past `min`) Community Amenities is tapped instead of Accessibility,
// since shared/community features are a closer match to what this row is
// for than accessibility features are.
export function pickAmenityHighlights(propertyAmenities: string[], max = 6, min = 3): string[] {
  const has = new Set(propertyAmenities)
  const picked: string[] = []
  const addFrom = (keys: string[], limit: number) => {
    for (const k of keys) {
      if (picked.length >= limit) return
      if (has.has(k) && !picked.includes(k)) picked.push(k)
    }
  }
  addFrom(AMENITY_HIGHLIGHTS_PRIORITY, max)
  if (picked.length < min) addFrom(catKeys('Community Amenities'), min)
  return picked
}

// Bed-type icons — front-view. viewBox 0 0 24 24, className "bed-svg" applied by caller.
export const BED_SVGS: Record<string, React.ReactNode> = {
  king: <svg viewBox="0 0 24 24" className="bed-svg"><rect x="1" y="2" width="22" height="11" rx="2.5"/><rect x="2" y="3.5" width="9" height="8" rx="1.5"/><rect x="13" y="3.5" width="9" height="8" rx="1.5"/><rect x="1" y="13" width="22" height="8" rx="1.5"/><path d="M3 21h18"/><path d="M4 21v3M20 21v3"/></svg>,
  queen: <svg viewBox="0 0 24 24" className="bed-svg"><rect x="1" y="3.5" width="22" height="9" rx="2.5"/><rect x="2.5" y="5" width="8" height="6" rx="1.5"/><rect x="13.5" y="5" width="8" height="6" rx="1.5"/><rect x="1" y="12.5" width="22" height="8" rx="1.5"/><path d="M3 20.5h18"/><path d="M4 20.5v3M20 20.5v3"/></svg>,
  double: <svg viewBox="0 0 24 24" className="bed-svg"><rect x="2" y="4" width="20" height="8.5" rx="2.5"/><rect x="3" y="5.5" width="7.5" height="5.5" rx="1.5"/><rect x="13.5" y="5.5" width="7.5" height="5.5" rx="1.5"/><rect x="2" y="12.5" width="20" height="8" rx="1.5"/><path d="M4 20.5h16"/><path d="M5 20.5v3M19 20.5v3"/></svg>,
  twin: <svg viewBox="0 0 24 24" className="bed-svg"><rect x="6.5" y="2" width="11" height="11" rx="2.5"/><rect x="8" y="3.5" width="8" height="8" rx="1.5"/><rect x="5.5" y="13" width="13" height="8" rx="1.5"/><path d="M7.5 21h9"/><path d="M8.5 21v3M15.5 21v3"/></svg>,
  single: <svg viewBox="0 0 24 24" className="bed-svg"><rect x="6.5" y="2" width="11" height="11" rx="2.5"/><rect x="8" y="3.5" width="8" height="8" rx="1.5"/><rect x="5.5" y="13" width="13" height="8" rx="1.5"/><path d="M7.5 21h9"/><path d="M8.5 21v3M15.5 21v3"/></svg>,
  bunk: <svg viewBox="0 0 24 24" className="bed-svg"><rect x="1" y="1.5" width="17" height="8" rx="1.5"/><line x1="3" y1="6.5" x2="16" y2="6.5"/><rect x="1" y="12.5" width="17" height="8" rx="1.5"/><line x1="3" y1="17.5" x2="16" y2="17.5"/><line x1="19.5" y1="1.5" x2="19.5" y2="23"/><line x1="22.5" y1="1.5" x2="22.5" y2="23"/><line x1="19.5" y1="6.5" x2="22.5" y2="6.5"/><line x1="19.5" y1="11" x2="22.5" y2="11"/><line x1="19.5" y1="17.5" x2="22.5" y2="17.5"/></svg>,
  'sofa-bed': <svg viewBox="0 0 24 24" className="bed-svg"><rect x="1" y="7" width="3" height="11" rx="1.5"/><rect x="20" y="7" width="3" height="11" rx="1.5"/><rect x="4" y="7" width="16" height="5" rx="1.5"/><rect x="4" y="12" width="16" height="6" rx="1.5"/><path d="M6 18v4M18 18v4"/></svg>,
  crib: <svg viewBox="0 0 24 24" className="bed-svg"><circle cx="4.5" cy="3.5" r="2"/><circle cx="19.5" cy="3.5" r="2"/><path d="M4.5 5.5v17M19.5 5.5v17"/><path d="M4.5 9h15M4.5 20h15"/><path d="M4.5 22.5h15"/><path d="M9 9v11M14.5 9v11"/></svg>,
  trundle: <svg viewBox="0 0 24 24" className="bed-svg"><rect x="1" y="2" width="22" height="9" rx="1.5"/><line x1="3" y1="7" x2="21" y2="7"/><rect x="3.5" y="14" width="18" height="7" rx="1.5"/><path d="M1 11l2.5 3M23 11l-2 3"/></svg>,
}

// Staff icons — some viewBox 0 0 64 64 (from uploaded icon set), some 0 0 24 24 (custom).
// stroke-width is fixed in CSS so it renders consistently regardless of viewBox.
export const STAFF_SVGS: Record<string, React.ReactNode> = {
  concierge: <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M14 44h36"/><path d="M18 44a14 14 0 0 1 28 0"/><path d="M32 26v-6"/><circle cx="32" cy="17" r="3"/><path d="M12 52h40"/></svg>,
  housekeeper: <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h20l4 14H18l4-14z"/><path d="M18 26h28v26H18z"/><path d="M26 34h12"/><path d="M26 42h12"/><path d="M12 52h40"/></svg>,
  chef: <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 25a9 9 0 0 1 2-17 10 10 0 0 1 18 0 9 9 0 0 1 2 17"/><path d="M20 25h24v26H20z"/><path d="M24 36h16"/><path d="M24 44h16"/></svg>,
  cook: <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 25a9 9 0 0 1 2-17 10 10 0 0 1 18 0 9 9 0 0 1 2 17"/><path d="M20 25h24v26H20z"/><path d="M24 36h16"/><path d="M24 44h16"/></svg>,
  'sous-chef': <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M21 25a9 9 0 0 1 2-17 10 10 0 0 1 18 0 9 9 0 0 1 2 17"/><path d="M20 25h24v26H20z"/><path d="M24 36h16"/><path d="M24 44h16"/></svg>,
  butler: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 14a7 7 0 0 1 14 0"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="3" y1="18" x2="21" y2="18"/><line x1="12" y1="8" x2="12" y2="14"/><circle cx="12" cy="7" r="1.5"/></svg>,
  driver: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="9" x2="12" y2="3"/><line x1="15.1" y1="10.8" x2="20.2" y2="7.5"/><line x1="8.9" y1="10.8" x2="3.8" y2="7.5"/></svg>,
  babysitter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="7" r="3"/><path d="M5 13c0-2 1.5-4 3-4s3 2 3 4v3H5v-3z"/><circle cx="17" cy="9" r="2"/><path d="M15 13c0-1.5 1-3 2-3s2 1.5 2 3v2h-4v-2z"/><path d="M5 16h6"/><path d="M15 15h4"/></svg>,
  gardener: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
  security: <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M32 8l20 8v14c0 13-8 22-20 26-12-4-20-13-20-26V16l20-8z"/><path d="M23 32l6 6 13-14"/></svg>,
  waiter: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="17" x2="21" y2="17"/><path d="M5 17a7 7 0 0 1 14 0"/><line x1="12" y1="10" x2="12" y2="13"/><circle cx="12" cy="9.5" r="1.5"/><line x1="3" y1="20" x2="21" y2="20"/></svg>,
  bartender: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M8 4h8l-4 8-4-8z"/><line x1="12" y1="12" x2="12" y2="19"/><line x1="8" y1="19" x2="16" y2="19"/><circle cx="16.5" cy="5.5" r="1.5"/><line x1="15.5" y1="6.5" x2="14" y2="8"/></svg>,
}

export const STAFF_FALLBACK_SVG = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
)
