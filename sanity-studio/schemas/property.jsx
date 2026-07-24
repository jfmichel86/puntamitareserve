// ─────────────────────────────────────────────────────────────────────────────
// property.js — Luxury Rentals Punta Mita
// Full property schema covering all 10 sections
// ─────────────────────────────────────────────────────────────────────────────

import { StaffServicesInput }    from '../components/StaffServicesInput'
import { AmenitiesInput }        from '../components/AmenitiesInput'
import { SpecsToggleInput }      from '../components/SpecsToggleInput'
import { RadioRowInput }         from '../components/RadioRowInput'
import { StatusInput }           from '../components/StatusInput'
import { CheckboxRowInput }      from '../components/CheckboxRowInput'
import { ViewsPoolInput }        from '../components/ViewsPoolInput'
import { CompactNumberInput }    from '../components/CompactNumberInput'
import { PoliciesInput }         from '../components/PoliciesInput'
import { GalleryManagerInput }   from '../components/GalleryManagerInput'
import { PromotionsPanelInput }  from '../components/PromotionsPanelInput'
import { PricingTableInput }     from '../components/PricingTableInput'
import { BedroomConfigInput }    from '../components/BedroomConfigInput'
import { CreatedByInput }        from '../components/CreatedByInput'
import { LastModifiedByInput }   from '../components/LastModifiedByInput'
import { CharacterCountInput }   from '../components/CharacterCountInput'
import { CommunitySelectInput }  from '../components/CommunitySelectInput'
import { SectionNavInput }       from '../components/SectionNavInput'
import { NoActionsField }        from '../components/NoActionsField'
import { AdminLockInput }        from '../components/AdminLockInput'
import { LockedFormWrapper }     from '../components/LockedFormWrapper'
import { SlugAutoInput }         from '../components/SlugAutoInput'
import { OwnerManagerInput }     from '../components/OwnerManagerInput'
import { CommissionRateInput }    from '../components/CommissionRateInput'
import { FullDescriptionInput }   from '../components/FullDescriptionInput'
import { SeoTitleInput, SeoDescriptionInput } from '../components/SeoFieldInput'

// ─── Access control helper for private fields (Owner/Manager, Calendar URL) ──
// Returns true = HIDE the field.
// Visible to: Administrators · the property creator · anyone in authorizedViewers
const PRIVATE_HIDDEN = ({ currentUser, document }) => {
  if (!currentUser) return true
  if (currentUser.roles?.some(r => r.name === 'administrator')) return false
  if (document?.createdByUserId && document.createdByUserId === currentUser.id) return false
  const viewers = Array.isArray(document?.authorizedViewers) ? document.authorizedViewers : []
  if (currentUser.email && viewers.includes(currentUser.email)) return false
  return true
}

// ─── Community Lists ──────────────────────────────────────────────────────────

const PUNTA_MITA_COMMUNITIES = [
  { title: '7 Eight Bahia Golf Residences',  value: '7-eight-bahia-golf-residences'  },
  { title: 'Bahia Signature Estates',        value: 'bahia-signature-estates'        },
  { title: 'Bellavista Residences',          value: 'bellavista-residences'          },
  { title: 'Cuora',                          value: 'cuora'                          },
  { title: 'El Encanto',                     value: 'el-encanto'                     },
  { title: 'El Encanto Villas',              value: 'el-encanto-villas'              },
  { title: 'Four Seasons Residences',        value: 'four-seasons-residences'        },
  { title: 'Hacienda de Mita',              value: 'hacienda-de-mita'              },
  { title: 'Iyari Estates',                  value: 'iyari-estates'                  },
  { title: 'Iyari Villas',                   value: 'iyari-villas'                   },
  { title: 'Kupuri',                         value: 'kupuri'                         },
  { title: 'Kupuri Beach Residences',        value: 'kupuri-beach-residences'        },
  { title: 'La Punta Estates',               value: 'la-punta-estates'               },
  { title: 'La Serenata',                    value: 'la-serenata'                    },
  { title: 'Lagos del Mar',                  value: 'lagos-del-mar'                  },
  { title: 'Las Marietas',                   value: 'las-marietas'                   },
  { title: 'Las Palmas',                     value: 'las-palmas'                     },
  { title: 'Las Palmas Golf Estates',        value: 'las-palmas-golf-estates'        },
  { title: 'Las Palmas Selva',               value: 'las-palmas-selva'               },
  { title: 'Las Terrazas',                   value: 'las-terrazas'                   },
  { title: 'Las Vistas Estates',             value: 'las-vistas-estates'             },
  { title: 'Pacifico Estates',               value: 'pacifico-estates'               },
  { title: 'Porta Fortuna',                  value: 'porta-fortuna'                  },
  { title: 'Porta Fortuna Golf',             value: 'porta-fortuna-golf'             },
  { title: 'Porta Fortuna Zen Casitas',      value: 'porta-fortuna-zen-casitas'      },
  { title: 'Ranchos Estates',                value: 'ranchos-estates'                },
  { title: 'Signature Estates',              value: 'signature-estates'              },
  { title: 'TAU Residences',                 value: 'tau-residences'                 },
  { title: 'The Surf Residences',            value: 'the-surf-residences'            },
]

const PUNTA_DE_MITA_COMMUNITIES = [
  { title: 'Bolongo',                          value: 'bolongo'                          },
  { title: 'El Farallón',                      value: 'el-farallon'                      },
  { title: 'Kiráh',                            value: 'kirah'                            },
  { title: 'Litibú',                           value: 'litibu'                           },
  { title: 'Los Veneros',                      value: 'los-veneros'                      },
  { title: 'Maena',                            value: 'maena'                            },
  { title: 'Naya',                             value: 'naya'                             },
  { title: 'Nayamá',                           value: 'nayama'                           },
  { title: 'Paradise Coves',                   value: 'paradise-coves'                   },
  { title: 'Pontoquito',                        value: 'pontoquito'                        },
  { title: 'Punta del Burro',                  value: 'punta-del-burro'                  },
  { title: 'Real del Mar',                     value: 'real-del-mar'                     },
  { title: 'San Pancho',                       value: 'san-pancho'                       },
  { title: 'Sayulita',                         value: 'sayulita'                         },
  { title: 'Susurros del Corazón (Auberge)',   value: 'susurros-del-corazon'             },
  { title: 'Uavi',                             value: 'uavi'                             },
]

// ─── Helper: "required to publish" validation ─────────────────────────────────
const requiredToPublish = (fieldCheck) => (Rule) =>
  Rule.custom((value, context) => {
    if (context.document?.status === 'published' && fieldCheck(value)) {
      return 'Required to publish'
    }
    return true
  })

const reqPub = requiredToPublish((v) => !v)
const reqPubArray = requiredToPublish((v) => !v || v.length === 0)

// ─────────────────────────────────────────────────────────────────────────────

export default {
  name: 'property',
  title: 'Property',
  type: 'document',
  // Wraps the entire form — enforces read-only state when adminLocked = true
  components: { form: LockedFormWrapper },

  // Compact side-by-side layouts
  fieldsets: [
    { name: 'topRow',    title: '',           options: { columns: 3 } },
    { name: 'capacity',  title: 'Capacity',   options: { columns: 4 } },
    { name: 'golfCarts', title: 'Golf Carts', options: { columns: 2 } },
    { name: 'urlFields', title: 'Links',      options: { columns: 2 } },
  ],

  // Tabs shown in the Studio editor
  groups: [
    { name: 'identity',   title: '① Identity'         , default: true },
    { name: 'location',   title: '② Destination'                     },
    { name: 'specs',      title: '③ Specs'                           },
    { name: 'pricing',    title: '④ Pricing'                         },
    { name: 'media',      title: '⑤ Media'                           },
    { name: 'amenities',  title: '⑥ Amenities'                       },
    { name: 'staff',      title: '⑦ Staff & Services'                },
    { name: 'rules',      title: '⑧ Rules & Policies'                },
    { name: 'seo',        title: '⑨ SEO & Social'                    },
    { name: 'internal',   title: '⑩ Internal'                        },
  ],

  fields: [

    // ═══════════════════════════════════════════════════════════════
    // SECTION 1 — CORE IDENTITY
    // ═══════════════════════════════════════════════════════════════

    // ── Top row: Property Type | Sort Order | Featured ───────────────────────────
    {
      name: 'propertyType',
      title: 'Property Type',
      type: 'string',
      group: 'identity',
      fieldset: 'topRow',
      options: {
        list: [
          { title: 'Condo',   value: 'condo'   },
          { title: 'Villa',   value: 'villa'   },
          { title: 'Estate',  value: 'estate'  },
        ],
      },
      components: { input: RadioRowInput },
      validation: reqPub,
    },
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      group: 'identity',
      fieldset: 'topRow',
      components: { input: CompactNumberInput },
      description: 'Lower numbers appear first.',
    },
    {
      name: 'featured',
      title: 'Featured Property',
      type: 'boolean',
      group: 'identity',
      fieldset: 'topRow',
      initialValue: false,
      description: 'Appears on homepage carousel.',
      components: { input: SpecsToggleInput },
    },
    // ── Main identity fields ──────────────────────────────────────────────────────
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'identity',
      description: 'e.g. "Villa Cielo Azul"',
      validation: [
        reqPub,
        (Rule) => Rule.custom(async (title, context) => {
          if (!title) return true
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2024-01-01' })
          const id = document._id.replace(/^drafts\./, '')
          const existing = await client.fetch(
            `*[_type == "property" && lower(title) == lower($title) && !(_id in [$draft, $published])][0].title`,
            { title: title.trim(), draft: `drafts.${id}`, published: id }
          )
          return existing
            ? { message: `A property named "${existing}" already exists. Make sure this isn't a duplicate.`, level: 'warning' }
            : true
        }),
      ],
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      group: 'identity',
      options: { source: 'title', maxLength: 96 },
      description: 'Auto-generated from the Title. You can still edit it manually.',
      components: { input: SlugAutoInput },
      validation: [
        requiredToPublish((v) => !v?.current),
        (Rule) => Rule.custom(async (slug, context) => {
          if (!slug?.current) return true
          const { document, getClient } = context
          const client = getClient({ apiVersion: '2024-01-01' })
          const id = document._id.replace(/^drafts\./, '')
          const existingTitle = await client.fetch(
            `*[_type == "property" && slug.current == $slug && !(_id in [$draft, $published])][0].title`,
            { slug: slug.current, draft: `drafts.${id}`, published: id }
          )
          return existingTitle
            ? `This URL is already used by "${existingTitle}". Each property must have a unique URL slug.`
            : true
        }),
      ],
    },
    {
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      group: 'identity',
      description: 'Short punchy line. e.g. "Panoramic ocean views, private pool, steps from the beach." Max 120 characters.',
      components: { input: CharacterCountInput },
      options: { hardMax: 120 },
      validation: reqPub,
    },
    {
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text',
      rows: 3,
      group: 'identity',
      description: '2–3 sentences. Used on listing cards and as the default SEO description. Ideal: 160–200 characters.',
      components: { input: CharacterCountInput },
      options: { softMin: 160, softMax: 200, hardMax: 240, rows: 3 },
      validation: reqPub,
    },
    {
      name: 'fullDescription',
      title: 'Full Description',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'identity',
      description: 'Rich text. Shown on the property detail page.',
      validation: reqPubArray,
      components: { input: FullDescriptionInput },
    },
    {
      name: 'collection',
      title: 'Collection',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'identity',
      options: {
        list: [
          { title: 'Exceptional Value', value: 'exceptional-value' },
          { title: 'Family Villas',     value: 'family-villas'     },
          { title: 'Oceanfront',        value: 'oceanfront'        },
        ],
      },
      components: { input: CheckboxRowInput },
      description: 'Optional. Can belong to none, one, or all.',
    },

    // ═══════════════════════════════════════════════════════════════
    // SECTION 2 — LOCATION
    // ═══════════════════════════════════════════════════════════════

    {
      name: 'locationLabel',
      title: 'Destination',
      type: 'string',
      group: 'location',
      options: {
        list: [
          { title: 'Punta Mita (Inside the gates)', value: 'punta-mita'          },
          { title: 'Punta de Mita Area',          value: 'punta-de-mita-area'  },
          { title: 'Puerto Vallarta',             value: 'puerto-vallarta'     },
        ],
      },
      components: { input: RadioRowInput },
      description: '"Punta Mita" = inside the gates.',
      validation: reqPub,
    },
    // Community — shown only when Location = Punta Mita
    {
      name: 'communityPuntaMita',
      title: 'Community',
      type: 'string',
      group: 'location',
      hidden: ({ document }) => document?.locationLabel !== 'punta-mita',
      options: { list: PUNTA_MITA_COMMUNITIES },
      components: { input: CommunitySelectInput },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (
            context.document?.status === 'published' &&
            context.document?.locationLabel === 'punta-mita' &&
            !value
          ) return 'Required to publish'
          return true
        }),
    },
    // Community — shown only when Location = Punta de Mita Area
    {
      name: 'communityPuntaDeMita',
      title: 'Community',
      type: 'string',
      group: 'location',
      hidden: ({ document }) => document?.locationLabel !== 'punta-de-mita-area',
      options: { list: PUNTA_DE_MITA_COMMUNITIES },
      components: { input: CommunitySelectInput },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (
            context.document?.status === 'published' &&
            context.document?.locationLabel === 'punta-de-mita-area' &&
            !value
          ) return 'Required to publish'
          return true
        }),
    },
    // Note: Puerto Vallarta has no sub-community dropdown — the location label itself is sufficient.
    // Note: Map pins are stored in the separate "community" document type — no URL field needed here.

    // ═══════════════════════════════════════════════════════════════
    // SECTION 3 — SPECS
    // ═══════════════════════════════════════════════════════════════

    {
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      group: 'specs',
      fieldset: 'capacity',
      components: { input: CompactNumberInput, field: NoActionsField },
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.status === 'published' && (value === undefined || value === null))
            return 'Required to publish'
          if (value !== undefined && value !== null && (!Number.isInteger(value) || value < 1))
            return 'Must be a whole number of at least 1'
          return true
        }),
    },
    {
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      group: 'specs',
      fieldset: 'capacity',
      components: { input: CompactNumberInput, field: NoActionsField },
      description: 'Half-baths OK: 2.5, 3.5…',
      validation: reqPub,
    },
    {
      name: 'maxAdults',
      title: 'Max Adults',
      type: 'number',
      group: 'specs',
      fieldset: 'capacity',
      components: { input: CompactNumberInput, field: NoActionsField },
      validation: reqPub,
    },
    {
      name: 'childOnlyBeds',
      title: 'Child-Only Beds',
      type: 'number',
      group: 'specs',
      fieldset: 'capacity',
      initialValue: 0,
      components: { input: CompactNumberInput, field: NoActionsField },
      description: 'Twin bunks etc. 0 if none.',
    },
    // totalMaxGuests is computed on the frontend: maxAdults + childOnlyBeds

    // ─── Bedroom configuration table ─────────────────────────────────────────────
    {
      name: 'bedConfiguration',
      title: 'Bedroom Configuration',
      type: 'array',
      group: 'specs',
      components: { input: BedroomConfigInput },
      description: 'List each bedroom with its bed types and counts per type.',
      of: [
        {
          type: 'object',
          name: 'bedroomEntry',
          fields: [
            { name: 'name', title: 'Bedroom Name', type: 'string' },
            {
              name: 'beds',
              title: 'Beds',
              type: 'array',
              of: [{
                type: 'object',
                name: 'bedItem',
                fields: [
                  { name: 'bedType', title: 'Bed Type', type: 'string' },
                  { name: 'count',   title: 'Count',    type: 'number' },
                ],
              }],
            },
            {
              name: 'enSuite',
              title: 'En-suite Bathroom',
              type: 'boolean',
            },
            {
              name: 'bathAmenities',
              title: 'Bathroom Amenities',
              type: 'array',
              of: [{ type: 'string' }],
              options: {
                list: [
                  { title: 'Hot Tub',         value: 'hot-tub'         },
                  { title: 'Jacuzzi',         value: 'jacuzzi'         },
                  { title: 'Outdoor Shower',  value: 'outdoor-shower'  },
                  { title: 'Double Shower',   value: 'double-shower'   },
                ],
              },
            },
          ],
        },
      ],
    },

    {
      name: 'viewsAndPool',
      title: 'Views & Pool',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'specs',
      options: {
        list: [
          // Views
          { title: 'Ocean View',       value: 'ocean-view'       },
          { title: 'Golf Course View', value: 'golf-course-view' },
          { title: 'Lake View',        value: 'lake-view'        },
          // Location
          { title: 'Oceanfront',       value: 'oceanfront'       },
          { title: 'Beachfront',       value: 'beachfront'       },
          { title: 'Golf Course',      value: 'golf-course'      },
          { title: 'Hillside',         value: 'hillside'         },
          // Pool
          { title: 'Private Pool',     value: 'private-pool'     },
          { title: 'Communal Pool',    value: 'communal-pool'    },
        ],
      },
      components: { input: ViewsPoolInput },
      description: 'Oceanfront = ocean-facing, no beach access. Beachfront = direct beach access. Selecting a location auto-adds its implied view.',
      validation: (Rule) => Rule.custom((value) => {
        if (!value?.length) return true
        const hasOcean      = value.includes('ocean-view')
        const hasOceanfront = value.includes('oceanfront')
        const hasBeachfront = value.includes('beachfront')
        const hasGolf       = value.includes('golf-course-view')
        const hasSeaAccess  = hasOceanfront || hasBeachfront

        if (hasOceanfront && hasBeachfront)
          return 'Cannot select both Oceanfront and Beachfront — they are mutually exclusive'
        if (hasSeaAccess && hasGolf)
          return 'Golf Course View cannot be combined with Oceanfront or Beachfront'
        if (hasSeaAccess && !hasOcean)
          return 'Ocean View must be included when Oceanfront or Beachfront is selected'
        return true
      }),
    },
    {
      name: 'golfCart6Seater',
      title: '6 Seater Golf Cart',
      type: 'number',
      group: 'specs',
      fieldset: 'golfCarts',
      options: {
        list: [
          { title: '1', value: 1 },
          { title: '2', value: 2 },
        ],
      },
      description: 'Leave unselected if not included.',
      components: { input: RadioRowInput },
    },
    {
      name: 'golfCart4Seater',
      title: '4 Seater Golf Cart',
      type: 'number',
      group: 'specs',
      fieldset: 'golfCarts',
      options: {
        list: [
          { title: '1', value: 1 },
          { title: '2', value: 2 },
        ],
      },
      description: 'Leave unselected if not included.',
      components: { input: RadioRowInput },
    },
    {
      name: 'memberships',
      title: 'Membership',
      type: 'string',
      group: 'specs',
      hidden: ({ document }) => document?.locationLabel !== 'punta-mita',
      options: {
        list: [
          { title: 'Golf Membership',  value: 'golf-membership'  },
          { title: 'Sport Membership', value: 'sport-membership' },
        ],
      },
      components: { input: RadioRowInput },
      description: 'Select one membership type for this property.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const doc = context.document
          if (doc?.locationLabel === 'punta-mita' && !value) {
            if (doc?.status === 'published') {
              return 'You must select a Membership type to publish this property'
            }
            return { message: 'Select a Membership type before publishing', level: 'warning' }
          }
          return true
        }),
    },

    // ═══════════════════════════════════════════════════════════════
    // SECTION 4 — PRICING
    // ═══════════════════════════════════════════════════════════════

    {
      name: 'priceOnRequest',
      title: 'Price on Request',
      type: 'boolean',
      group: 'pricing',
      description: 'Enable for properties where rates are shared privately on a case-by-case basis. When on, the website shows "Please Inquire" instead of a rate table, and the property can be published without season rates.',
      initialValue: false,
    },

    {
      name: 'seasons',
      title: 'Pricing by Season',
      type: 'array',
      group: 'pricing',
      components: { input: PricingTableInput },
      description: '6 seasons are pre-loaded — enter the nightly rate for each. The site automatically uses the lowest rate as the Starting Price. Use "+ Add season" for extra rows.',
      of: [
        {
          type: 'object',
          name: 'season',
          title: 'Season',
          fields: [
            {
              name: 'seasonName',
              title: 'Season Name',
              type: 'string',
              description: 'e.g. Low Season, High Season, Spring Break, Easter, Christmas, New Year',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'nightlyRate',
              title: 'Nightly Rate (USD)',
              type: 'number',
              // Optional when bedroomRates is used instead
              validation: (Rule) => Rule.min(1),
            },
            {
              // Bedroom-tiered rates — used instead of a single nightlyRate
              // when the property prices differently per number of bedrooms occupied.
              name: 'bedroomRates',
              title: 'Bedroom-tiered Rates',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'bedroomRate',
                  fields: [
                    { name: 'bedrooms',    title: 'Bedrooms',         type: 'number' },
                    { name: 'nightlyRate', title: 'Nightly Rate (USD)', type: 'number' },
                  ],
                },
              ],
            },
            {
              name: 'minimumStay',
              title: 'Minimum Stay (nights)',
              type: 'number',
              validation: (Rule) => Rule.required().integer().min(1),
            },
          ],
          preview: {
            select: {
              title:       'seasonName',
              nightlyRate: 'nightlyRate',
              minimumStay: 'minimumStay',
            },
            prepare({ title, nightlyRate, minimumStay }) {
              return {
                title:    title || 'Unnamed Season',
                subtitle: [
                  nightlyRate  ? `$${nightlyRate}/night`           : '',
                  minimumStay  ? `· ${minimumStay}-night minimum`  : '',
                ].filter(Boolean).join(' '),
              }
            },
          },
        },
      ],
      initialValue: [
        { _type: 'season', _key: 'low-season',   seasonName: 'Low Season',   minimumStay: 3 },
        { _type: 'season', _key: 'high-season',  seasonName: 'High Season',  minimumStay: 5 },
        { _type: 'season', _key: 'thanksgiving', seasonName: 'Thanksgiving', minimumStay: 7 },
        { _type: 'season', _key: 'easter',       seasonName: 'Easter',       minimumStay: 7 },
        { _type: 'season', _key: 'christmas',    seasonName: 'Christmas',    minimumStay: 7 },
        { _type: 'season', _key: 'new-year',     seasonName: 'New Year',     minimumStay: 7 },
      ],
      validation: [
        (Rule) => Rule.custom((seasons, context) => {
          if (context.document?.priceOnRequest) return true
          if (context.document?.status === 'published' && (!seasons || seasons.length === 0))
            return 'At least one season is required to publish'
          return true
        }),
        (Rule) => Rule.custom((seasons) => {
          if (!seasons?.length) return true
          const missing = seasons.filter(s => s.seasonName && !s.nightlyRate && !(s.bedroomRates?.length))
          if (missing.length > 0)
            return { message: `Missing nightly rate for: ${missing.map(s => s.seasonName).join(', ')}`, level: 'warning' }
          return true
        }),
      ],
    },
    // startingRate is computed on the frontend: Math.min(...seasons.map(s => s.nightlyRate))

    // ═══════════════════════════════════════════════════════════════
    // SECTION 5 — MEDIA
    // ═══════════════════════════════════════════════════════════════

    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
      description: 'Main image at the top of the property detail page.',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          if (context.document?.status === 'published' && !value?.asset)
            return 'Required to publish'
          return true
        }),
    },
    // ─── Gallery — custom manager (bulk upload + bulk tag + bulk delete) ─────────
    {
      name: 'gallery',
      title: 'Photo Gallery',
      type: 'array',
      group: 'media',
      description: 'Upload all photos at once. Then select photos and assign a room category in bulk.',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'roomTag',  title: 'Room Tag',    type: 'string'  },
            { name: 'isMosaic', title: 'Mosaic Pick', type: 'boolean' },
          ],
        },
      ],
      components: { input: GalleryManagerInput },
      validation: (Rule) =>
        Rule.custom((gallery, context) => {
          if (context.document?.status === 'published') {
            const count = gallery?.length || 0
            if (count < 20)
              return `Minimum 20 photos required to publish. Currently ${count}.`
          }
          return true
        }),
    },
    {
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      group: 'media',
      fieldset: 'urlFields',
      description: 'Optional. YouTube or Vimeo link.',
    },
    {
      name: 'virtualTourUrl',
      title: 'Virtual Tour URL',
      type: 'url',
      group: 'media',
      fieldset: 'urlFields',
      description: 'Optional. Matterport or 360° link.',
    },

    // ═══════════════════════════════════════════════════════════════
    // SECTION 6 — AMENITIES
    // ═══════════════════════════════════════════════════════════════

    {
      name: 'amenities',
      title: 'Amenities',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'amenities',
      description: 'Check all that apply. Minimum 10 required to publish.',
      initialValue: [
        'air-conditioning',
        'wifi',
        'linens-provided',
        'towels-provided',
        'coffee-maker',
        'smart-tv',
      ],
      components: {
        input: AmenitiesInput,
      },
      options: {
        list: [
          // ── Essential Features ──────────────────────────────
          { title: 'Air Conditioning',           value: 'air-conditioning'      },
          { title: 'High Speed Internet & WiFi', value: 'wifi'                  },
          { title: 'Safe',                       value: 'safe'                  },
          { title: 'Washing Machine',            value: 'washing-machine'       },
          { title: 'Clothes Dryer',              value: 'clothes-dryer'         },
          { title: 'Linens Provided',            value: 'linens-provided'       },
          { title: 'Towels Provided',            value: 'towels-provided'       },
          { title: 'First-Aid Kit',              value: 'first-aid-kit'         },
          // ── Kitchen & Dining ────────────────────────────────
          { title: 'Bar',                        value: 'bar'                   },
          { title: 'Coffee Grinder',             value: 'coffee-grinder'        },
          { title: 'Coffee Maker',               value: 'coffee-maker'          },
          { title: 'Nespresso Coffee Machine',   value: 'nespresso'             },
          { title: 'Wine Cellar',                value: 'wine-cellar'           },
          // ── Entertainment & Health ──────────────────────────
          { title: 'Basketball Court',           value: 'basketball-court'      },
          { title: 'Bocce Ball Court',           value: 'bocce-ball-court'      },
          { title: 'Bowling Alley',              value: 'bowling-alley'         },
          { title: 'Cinema Room',                value: 'cinema-room'           },
          { title: 'Foosball',                   value: 'foosball'              },
          { title: 'Games',                      value: 'games'                 },
          { title: 'Golf Simulator',             value: 'golf-simulator'        },
          { title: 'Gym / Fitness Room',         value: 'gym'                   },
          { title: 'High End Golf Clubs',        value: 'golf-clubs'            },
          { title: 'Media Room',                 value: 'media-room'            },
          { title: 'Pétanque',                   value: 'petanque'              },
          { title: 'Piano',                      value: 'piano'                 },
          { title: 'Pickleball Court',           value: 'pickleball-court'      },
          { title: 'Ping Pong Table',            value: 'ping-pong'             },
          { title: 'Pool Table',                 value: 'pool-table'            },
          { title: 'Putting Green',              value: 'putting-green'         },
          { title: 'Satellite & Cable TV',       value: 'satellite-cable-tv'    },
          { title: 'Shuffleboard Table',         value: 'shuffleboard'          },
          { title: 'Smart TV',                   value: 'smart-tv'              },
          { title: 'SONOS Sound System',         value: 'sonos'                 },
          { title: 'Sound System',               value: 'sound-system'          },
          { title: 'Tennis Court',               value: 'tennis-court'          },
          { title: 'Video Games',                value: 'video-games'           },
          { title: 'Yoga Room',                  value: 'yoga-room'             },
          // ── Outdoor Features ────────────────────────────────
          { title: 'Beach Chairs',               value: 'beach-chairs'          },
          { title: 'Bicycles',                   value: 'bicycles'              },
          { title: 'Boat / Yacht',               value: 'boat-yacht'            },
          { title: 'Boogie Boards',              value: 'boogie-boards'         },
          { title: 'Cornhole',                   value: 'cornhole'              },
          { title: 'Croquet',                    value: 'croquet'               },
          { title: 'Kayaks',                     value: 'kayaks'                },
          { title: 'Paddle Boards',              value: 'paddle-boards'         },
          { title: 'Snorkel Equipment',          value: 'snorkel-equipment'     },
          { title: 'Surf Boards',                value: 'surf-boards'           },
          // ── Pool & Spa Facilities ───────────────────────────
          { title: 'Alfresco Dining',            value: 'alfresco-dining'       },
          { title: 'Alfresco Palapa Roof',       value: 'palapa-roof'           },
          { title: 'BBQ / Grill',                value: 'bbq-grill'             },
          { title: 'Firepit',                    value: 'firepit'               },
          { title: 'Heated Infinity Pool',       value: 'heated-infinity-pool'  },
          { title: 'Heated Pool',                value: 'heated-pool'           },
          { title: 'Hot Tub',                    value: 'hot-tub'               },
          { title: 'Jacuzzi',                    value: 'jacuzzi'               },
          { title: 'Private Spa',                value: 'private-spa'           },
          { title: 'Sauna',                      value: 'sauna'                 },
          { title: 'Steam Room',                 value: 'steam-room'            },
          { title: 'Sun Loungers',               value: 'sun-loungers'          },
          { title: 'Volleyball Pool',            value: 'volleyball-pool'       },
          { title: 'Wet Bar',                    value: 'wet-bar'               },
          // ── Office ──────────────────────────────────────────
          { title: 'Computer Monitor',           value: 'computer-monitor'      },
          { title: 'Desk',                       value: 'desk'                  },
          { title: 'Desk Chair',                 value: 'desk-chair'            },
          { title: 'Printer',                    value: 'printer'               },
          // ── Community Amenities ─────────────────────────────
          { title: 'Communal Heated Pool',       value: 'communal-heated-pool'  },
          { title: 'Foosball Table (Shared)',    value: 'community-foosball'    },
          { title: 'Ping Pong Table (Shared)',   value: 'community-ping-pong'   },
          { title: 'Shared Gym',                 value: 'shared-gym'            },
          // ── Accessibility ───────────────────────────────────
          { title: 'Elevator',                   value: 'elevator'              },
          { title: 'Ground Floor Bedroom',       value: 'ground-floor-bedroom'  },
          { title: 'Wheelchair Accessible',      value: 'wheelchair-accessible' },
        ],
        layout: 'grid',
      },
      validation: (Rule) =>
        Rule.custom((amenities, context) => {
          if (context.document?.status === 'published') {
            const count = amenities?.length || 0
            if (count < 10)
              return `Select at least 10 amenities to publish. Currently ${count} selected.`
          }
          return true
        }),
    },

    // ═══════════════════════════════════════════════════════════════
    // SECTION 7 — STAFF & SERVICES
    // ═══════════════════════════════════════════════════════════════

    {
      name: 'staffServices',
      title: 'Staff & Services',
      type: 'array',
      group: 'staff',
      initialValue: [
        {
          _type: 'staffMember',
          _key:  'concierge',
          role:  'concierge',
          services: ['activity-bookings', 'restaurant-reservations', 'transportation-arrangements'],
        },
        {
          _type: 'staffMember',
          _key:  'housekeeper',
          role:  'housekeeper',
          services: ['daily-cleaning'],
        },
      ],
      of: [
        {
          type: 'object',
          name: 'staffMember',
          fields: [
            { name: 'role',     title: 'Role',     type: 'string'                           },
            { name: 'services', title: 'Services', type: 'array', of: [{ type: 'string' }] },
          ],
        },
      ],
      components: {
        input: StaffServicesInput,
      },
      description: 'Check each staff member included with this property. Their default services will be auto-selected. Uncheck any services that do not apply.',
    },

    // ═══════════════════════════════════════════════════════════════
    // SECTION 8 — RULES & POLICIES
    // ═══════════════════════════════════════════════════════════════
    // Note: Check-in/out times, house rules, and cancellation policy are
    // the same for all properties and are hardcoded on the website.

    {
      name: 'policies',
      title: 'Policies',
      type: 'object',
      group: 'rules',
      components: { input: PoliciesInput },
      fields: [
        { name: 'noPets',    title: 'Pets are not allowed',              type: 'boolean', initialValue: true },
        { name: 'noEvents',  title: 'Events & Parties are not allowed', type: 'boolean', initialValue: true },
        { name: 'noSmoking', title: 'No Smoking',                       type: 'boolean', initialValue: true },
      ],
    },

    // ═══════════════════════════════════════════════════════════════
    // SECTION 9 — SEO & SOCIAL
    // ═══════════════════════════════════════════════════════════════

    {
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description: 'Optional override. Defaults to the property Title if left blank.',
      components: { input: SeoTitleInput },
      hidden: true,
    },
    {
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      rows: 3,
      group: 'seo',
      description: 'Optional override. Defaults to the Short Description if left blank.',
      components: { input: SeoDescriptionInput },
      hidden: true,
    },
    {
      name: 'ogImage',
      title: 'Social Share Image',
      type: 'image',
      group: 'seo',
      options: { hotspot: true },
      description: 'Optional override. Defaults to the Hero Image if left blank.',
      hidden: true,
    },

    // ═══════════════════════════════════════════════════════════════
    // SECTION 10 — INTERNAL / OPERATIONS  (not shown publicly)
    // ═══════════════════════════════════════════════════════════════

    {
      name: 'createdBy',
      title: 'Created By',
      type: 'string',
      group: 'internal',
      components: { input: CreatedByInput },
      description: 'Auto-captured from the Sanity account that clicked "Create new document".',
      initialValue: (_, context) => {
        const user = context?.currentUser
        return (
          user?.displayName ||
          [user?.givenName, user?.familyName].filter(Boolean).join(' ') ||
          user?.email ||
          'Unknown'
        )
      },
    },
    {
      name: 'lastModifiedBy',
      title: 'Last Modified By',
      type: 'object',
      group: 'internal',
      readOnly: true,
      components: { input: LastModifiedByInput },
      description: 'Auto-tracked — updated whenever any field is changed.',
      fields: [
        { name: 'user', title: 'User', type: 'string'   },
        { name: 'at',   title: 'At',   type: 'datetime' },
      ],
    },
    {
      name: 'internalNotes',
      title: 'Internal Notes',
      type: 'text',
      rows: 3,
      group: 'internal',
      description: 'Not visible to guests. Notes for your team only.',
    },

    // ─── Private contact & calendar — restricted to creator + authorized viewers ─
    {
      // Stores Sanity user ID — set automatically by LockedFormWrapper on first load.
      // Used to determine who "owns" this property for access-control purposes.
      name: 'createdByUserId',
      title: 'Created By User ID',
      type: 'string',
      group: 'internal',
      hidden: true,  // never shown in the form UI — set programmatically
      readOnly: true,
    },
    {
      // Admins can add contributor email addresses here to grant them access
      // to the Owner/Manager and Calendar fields for this property.
      name: 'authorizedViewers',
      title: 'Authorized Viewers',
      type: 'array',
      group: 'internal',
      of: [{ type: 'string' }],
      description: 'Email addresses of contributors who may see Owner/Manager and Calendar info for this property.',
      hidden:   ({ currentUser }) => !currentUser?.roles?.some(r => r.name === 'administrator'),
      readOnly: ({ currentUser }) => !currentUser?.roles?.some(r => r.name === 'administrator'),
    },
    {
      name: 'ownerManager',
      title: 'Owner / Manager',
      type: 'object',
      group: 'internal',
      hidden: PRIVATE_HIDDEN,
      components: { input: OwnerManagerInput },
      fields: [
        { name: 'ownerType', title: 'Owner Type', type: 'string' },  // 'owner' | 'agency'
        { name: 'name',      title: 'Name',        type: 'string' },
        { name: 'phone',     title: 'Phone',       type: 'string' },
        { name: 'email',     title: 'Email',       type: 'string' },
        { name: 'agencyRef', title: 'Agency',      type: 'reference', to: [{ type: 'agency' }] },
      ],
    },
    {
      name: 'commissionRate',
      title: 'Commission Rate (%)',
      type: 'number',
      group: 'internal',
      hidden: PRIVATE_HIDDEN,
      description: 'Select the agreed commission percentage for this property.',
      components: { input: CommissionRateInput },
    },
    {
      name: 'calendarUrl',
      title: 'Booking Calendar URL',
      type: 'url',
      group: 'internal',
      hidden: PRIVATE_HIDDEN,
      description: 'Link to the official booking calendar for this property.',
    },
    // ─── Promotions — hidden from property form; managed via Promotions dashboard ─
    {
      name: 'promotions',
      title: 'Promotions & Deals',
      type: 'object',
      hidden: true,
      group: 'internal',
      components: { input: PromotionsPanelInput },
      fields: [
        {
          name: 'limitedTimePromotion',
          title: 'Limited Time Promotion',
          type: 'object',
          fields: [
            { name: 'active', title: 'Active', type: 'boolean', initialValue: false },
            {
              name: 'offerType',
              title: 'Offer Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Percentage discount', value: 'percentage' },
                  { title: 'Free nights (e.g. Pay 3, Stay 4)', value: 'free-nights' },
                ],
              },
            },
            // Only meaningful when offerType === 'percentage'
            { name: 'percentageOff', title: 'Percentage Off', type: 'number' },
            // Only meaningful when offerType === 'free-nights'
            { name: 'payNights',  title: 'Pay (nights)',  type: 'number' },
            { name: 'stayNights', title: 'Stay (nights)', type: 'number' },
            { name: 'expiryDate', title: 'Expiry Date',   type: 'date'   },
            { name: 'note',       title: 'Note',          type: 'string' },
          ],
        },
        {
          name: 'propertyOfTheMonth',
          title: 'Property of the Month',
          type: 'object',
          fields: [
            { name: 'active', title: 'Active', type: 'boolean', initialValue: false },
            { name: 'month',  title: 'Month',  type: 'number'  },
            { name: 'year',   title: 'Year',   type: 'number'  },
          ],
        },
        {
          name: 'lastMinuteDeal',
          title: 'Last Minute Deal',
          type: 'object',
          fields: [
            { name: 'active',         title: 'Active',          type: 'boolean', initialValue: false },
            { name: 'availableDates', title: 'Available Dates', type: 'string'  },
            // Same two offer types as Limited Time Promotion, so both
            // structured discounts are entered and displayed consistently.
            {
              name: 'offerType',
              title: 'Offer Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Percentage discount', value: 'percentage' },
                  { title: 'Free nights (e.g. Pay 3, Stay 4)', value: 'free-nights' },
                ],
              },
            },
            { name: 'percentageOff', title: 'Percentage Off', type: 'number' },
            { name: 'payNights',  title: 'Pay (nights)',  type: 'number' },
            { name: 'stayNights', title: 'Stay (nights)', type: 'number' },
            { name: 'note',           title: 'Note',            type: 'string'  },
          ],
        },
      ],
    },

    // ─── Status moved here from Identity ─────────────────────────────────────────
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'internal',
      options: {
        list: [
          { title: '🔒  Draft',     value: 'draft'     },
          { title: '✅  Published', value: 'published' },
          { title: '📦  Archived',  value: 'archived'  },
        ],
      },
      initialValue: 'draft',
      components: { input: StatusInput },
      validation: (Rule) => Rule.required(),
    },

    {
      name: 'adminLocked',
      title: 'Admin Lock',
      type: 'boolean',
      group: 'internal',
      description: 'When enabled, Contributors cannot edit this property — only Administrators can.',
      initialValue: true,
      // Completely hidden from non-admins — they see the locked overlay via LockedFormWrapper instead
      hidden:   ({ currentUser }) => !currentUser?.roles?.some(r => r.name === 'administrator'),
      readOnly: ({ currentUser }) => !currentUser?.roles?.some(r => r.name === 'administrator'),
      components: { input: AdminLockInput },
    },

    // ── Section navigation buttons (one per tab, always last in their group) ──
    { name: 'navIdentity',  title: ' ', type: 'string', group: 'identity',  readOnly: true, components: { input: SectionNavInput }, options: { current: 'identity'  } },
    { name: 'navLocation',  title: ' ', type: 'string', group: 'location',  readOnly: true, components: { input: SectionNavInput }, options: { current: 'location'  } },
    { name: 'navSpecs',     title: ' ', type: 'string', group: 'specs',     readOnly: true, components: { input: SectionNavInput }, options: { current: 'specs'     } },
    { name: 'navPricing',   title: ' ', type: 'string', group: 'pricing',   readOnly: true, components: { input: SectionNavInput }, options: { current: 'pricing'   } },
    { name: 'navMedia',     title: ' ', type: 'string', group: 'media',     readOnly: true, components: { input: SectionNavInput }, options: { current: 'media'     } },
    { name: 'navAmenities', title: ' ', type: 'string', group: 'amenities', readOnly: true, components: { input: SectionNavInput }, options: { current: 'amenities' } },
    { name: 'navStaff',     title: ' ', type: 'string', group: 'staff',     readOnly: true, components: { input: SectionNavInput }, options: { current: 'staff'     } },
    { name: 'navRules',     title: ' ', type: 'string', group: 'rules',     readOnly: true, components: { input: SectionNavInput }, options: { current: 'rules'     } },
    { name: 'navSeo',       title: ' ', type: 'string', group: 'seo',       readOnly: true, components: { input: SectionNavInput }, options: { current: 'seo'       }, hidden: true },
    { name: 'navInternal',  title: ' ', type: 'string', group: 'internal',  readOnly: true, components: { input: SectionNavInput }, options: { current: 'internal'  } },

  ],

  // ─── Preview card in the Studio property list ────────────────────────────────
  preview: {
    select: {
      title:    'title',
      location: 'locationLabel',
      media:    'heroImage',
      status:   'status',
    },
    prepare({ title, location, media, status }) {
      const locationMap = {
        'punta-mita':         'Punta Mita',
        'punta-de-mita-area': 'Punta de Mita Area',
        'puerto-vallarta':    'Puerto Vallarta',
      }
      const statusMap = {
        draft:     '🔒 Draft',
        published: '✅ Published',
        archived:  '📦 Archived',
      }
      return {
        title:    title || 'Untitled Property',
        subtitle: [locationMap[location], statusMap[status]].filter(Boolean).join(' · '),
        media,
      }
    },
  },
}
