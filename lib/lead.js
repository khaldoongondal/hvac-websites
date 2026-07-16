import { cleanCity } from './colors'
import { formatPhone, telHref } from './format'

const HEX = /^#[0-9a-f]{6}$/i
function safeHex(v, fallback) { return HEX.test(v || '') ? v : fallback }

export function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))

// Default service list (used when a lead has no `services` array yet).
const DEFAULT_SERVICE_NAMES = [
  'AC Repair', 'AC Installation', 'Heating & Furnace',
  'Heat Pumps', 'Maintenance', '24/7 Emergency HVAC',
]

// Turn a raw Supabase `leads` row into the derived values every page needs.
export function deriveLead(lead) {
  const rawPhone = lead.phone || ''
  return {
    slug:          lead.slug,
    rawPhone,
    phone:         formatPhone(rawPhone),
    tel:           telHref(rawPhone),
    email:         lead.email || null,
    city:          cleanCity(lead.city) || 'Your City',
    businessName:  lead.business_name || 'Local HVAC',
    address:       lead.address || null,
    hours:         lead.hours || null,
    gmb:           lead.gmb || null,
    rating:        lead.rating || null,
    reviews:       lead.reviews || null,
    primary:       safeHex(lead.color_primary,        '#193c71'),
    secondary:     safeHex(lead.color_secondary,      '#204988'),
    accent:        safeHex(lead.color_accent,         '#da3232'),
    primaryLight:  safeHex(lead.color_primary_light,  safeHex(lead.color_primary, '#204988')),
    textOnPrimary: safeHex(lead.color_text_on_primary, '#ffffff'),
    textOnAccent:  safeHex(lead.color_text_on_accent,  '#ffffff'),
    logoUrl:       lead.logo_url?.startsWith('http') ? lead.logo_url : null,
    heroImageUrl:  lead.hero_image_url?.startsWith('http') ? lead.hero_image_url : null,
  }
}

// ── Services (data-driven, per client) ───────────────────────────────────────
export function getServices(lead) {
  const raw = Array.isArray(lead.services) ? lead.services.filter(Boolean) : []
  const names = raw.length ? raw : DEFAULT_SERVICE_NAMES
  return names.map(name => ({ name: String(name), slug: slugify(name) }))
}

export function findService(lead, serviceSlug) {
  return getServices(lead).find(s => s.slug === serviceSlug) || null
}

// ── Service areas / location pages ───────────────────────────────────────────
export function getAreas(lead) {
  const raw = Array.isArray(lead.service_areas) ? lead.service_areas.filter(Boolean) : []
  if (raw.length) return raw.map(String)
  return lead.city ? [cleanCity(lead.city)] : []
}

// 8–12 "strong" location pages, NOT one per city.
export function strongLocations(lead) {
  const areas = getAreas(lead)
  if (!areas.length) return []
  const def = Math.min(8, areas.length)
  const max = clamp(Number(lead.max_location_pages) || def, 1, 12)
  return areas.slice(0, max).map(name => ({ name, slug: slugify(name) }))
}

export function extraAreas(lead) {
  const areas = getAreas(lead)
  const strong = strongLocations(lead).length
  return areas.slice(strong)
}

export function findLocation(lead, areaSlug) {
  return strongLocations(lead).find(a => a.slug === areaSlug) || null
}

// Legacy generic labels (still used as a soft fallback where a real area list
// is absent).
export function serviceAreas(city) {
  return [
    `Greater ${city} Area`, `Downtown ${city}`, `North ${city}`,
    `South ${city}`, `${city} Suburbs`, 'Surrounding Communities',
  ]
}

// ── Instant-quote (Leadder) config ───────────────────────────────────────────
// Toggle per client; the iframe src is always built from the slug against the
// allowlisted app.leadder.io host (never inject a raw embed string).
export function quoteConfig(lead) {
  const enabled = lead.lead_quote_enabled !== false // default ON
  return { enabled, src: `https://app.leadder.io/widget/${lead.slug}` }
}

// ── Map ──────────────────────────────────────────────────────────────────────
export function mapFor(lead) {
  const rawLoc = (lead.address || lead.city || '').trim()
  const hasLocation = rawLoc.length > 0
  return {
    hasLocation,
    mapSrc: hasLocation
      ? `https://www.google.com/maps?q=${encodeURIComponent(`${rawLoc}, USA`)}&output=embed`
      : '',
  }
}

export function reviewUrl(businessName, city) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${businessName} ${city} reviews`)}`
}

// "downtown-your-city" → "Downtown Your City"
export function titleCaseSlug(slug) {
  return String(slug || '')
    .split('-')
    .filter(Boolean)
    .map(w => w.length <= 2 ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1))
    .join(' ')
}
