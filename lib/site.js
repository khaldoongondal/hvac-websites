// Canonical origin for absolute URLs (canonical tags, JSON-LD @id/url).
export const SITE_ORIGIN = 'https://www.leadder.tech'

export function baseUrl(slug) {
  return `${SITE_ORIGIN}/${slug}`
}

// Default hero: an HVAC-style service van in a residential driveway. Overridable
// per client via the `hero_image_url` column.
export const DEFAULT_HERO =
  'https://images.unsplash.com/photo-1619389136796-ebf6a39d507c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600'
