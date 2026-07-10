import { cleanCity } from './colors'
import { formatPhone, telHref } from './format'

// Turn a raw Supabase `leads` row into the derived values every page/component
// needs (formatted phone, colours with fallbacks, safe logo url, etc.).
export function deriveLead(lead) {
  const rawPhone = lead.phone || ''
  return {
    slug:          lead.slug,
    rawPhone,
    phone:         formatPhone(rawPhone),
    tel:           telHref(rawPhone),
    city:          cleanCity(lead.city) || 'Your City',
    businessName:  lead.business_name || 'Local HVAC',
    address:       lead.address || null,
    rating:        lead.rating || null,
    reviews:       lead.reviews || null,
    primary:       lead.color_primary         || '#1b3022',
    secondary:     lead.color_secondary        || '#2d5a3d',
    accent:        lead.color_accent           || '#c8a328',
    primaryLight:  lead.color_primary_light    || lead.color_primary || '#1b3022',
    textOnPrimary: lead.color_text_on_primary  || '#ffffff',
    textOnAccent:  lead.color_text_on_accent   || '#1a1a1a',
    logoUrl:       lead.logo_url?.startsWith('http') ? lead.logo_url : null,
  }
}

export function serviceAreas(city) {
  return [
    `Greater ${city} Area`, `Downtown ${city}`, `North ${city}`,
    `South ${city}`, `${city} Suburbs`, 'Surrounding Communities',
  ]
}

// Only embed a map when we actually have a location, and bias to the US so a
// vague query never drops a pin in another country.
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
