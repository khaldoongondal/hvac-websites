import { SITE_ORIGIN } from './site'
import { getAreas } from './lead'

// One HVACBusiness entity shared by Home + Contact (same @id) so the pages don't
// declare competing business entities.
export function businessJsonLd(d, lead) {
  const base = `${SITE_ORIGIN}/${d.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    '@id': `${base}/#business`,
    name: d.businessName,
    telephone: d.rawPhone,
    url: base,
    ...(d.email ? { email: d.email } : {}),
    ...(d.logoUrl ? { image: d.logoUrl } : {}),
    address: { '@type': 'PostalAddress', addressLocality: d.city, ...(lead.address ? { streetAddress: lead.address } : {}) },
    areaServed: getAreas(lead),
    ...(d.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: d.rating, reviewCount: d.reviews || 1 } } : {}),
  }
}
