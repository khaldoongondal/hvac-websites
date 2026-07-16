import { getServices } from './lead'

// Group a client's flat service list into the categories the nav + hub pages use
// (Cooling / Heating / Other Services), stansac-style. Classification is by
// keyword so it works for any client's service names.
export function categoryOf(name) {
  const n = name.toLowerCase()
  if (/duct clean|air qual|purif|humid|filtrat|\biaq\b|ventilat|insulat/.test(n)) return 'other'
  if (/mini.?split|ductless/.test(n))                                            return 'cooling'
  if (/heat.?pump|furnace|boiler|heating|heater/.test(n))                        return 'heating'
  if (/air.?condition|\bac\b|a\/c|cool/.test(n))                                 return 'cooling'
  return 'other'
}

const IMG = (id) => `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600`

// Ordered category metadata. `slug` is the hub-page URL segment.
export const CATEGORIES = [
  {
    key: 'cooling', label: 'Cooling', slug: 'cooling', navLabel: 'Air Conditioning',
    h1: (city) => `Air Conditioning Services in ${city}`,
    blurb: (city) => `Keep your ${city} home cool and comfortable with expert air-conditioning repair, installation, and maintenance.`,
    hero: IMG('1718203862467-c33159fdc504'),
  },
  {
    key: 'heating', label: 'Heating', slug: 'heating', navLabel: 'Heating',
    h1: (city) => `Heating Services in ${city}`,
    blurb: (city) => `Dependable furnace, heat pump, and boiler service to keep ${city} homes warm all winter long.`,
    hero: IMG('1650551182991-b07558247564'),
  },
  {
    key: 'other', label: 'Other Services', slug: 'other-services', navLabel: 'Other Services',
    h1: (city) => `Indoor Air Quality & More in ${city}`,
    blurb: (city) => `Improve comfort and air quality in your ${city} home with duct cleaning, air purification, and more.`,
    hero: IMG('1615309662243-70f6df917b59'),
  },
]

export const CATEGORY_BY_SLUG = Object.fromEntries(CATEGORIES.map(c => [c.slug, c]))

export function categorizeServices(lead) {
  const groups = { cooling: [], heating: [], other: [] }
  getServices(lead).forEach(s => groups[categoryOf(s.name)].push(s))
  return groups
}

// Only categories that actually have services (so the nav never shows an empty
// dropdown or links to an empty hub).
export function categoriesWithServices(lead) {
  const groups = categorizeServices(lead)
  return CATEGORIES
    .filter(c => groups[c.key].length > 0)
    .map(c => ({ ...c, services: groups[c.key] }))
}

export function categoryServices(lead, slug) {
  const cat = CATEGORY_BY_SLUG[slug]
  if (!cat) return null
  const services = categorizeServices(lead)[cat.key]
  if (!services.length) return null
  return { cat, services }
}
