import { deriveLead, getServices, strongLocations } from './lead'
import { categoriesWithServices } from './categories'

// Canonical list of every indexable page for a client. Used by sitemap.xml and
// the VA manifest. `file` is a recommended HTML filename for GHL uploads.
export function sitePages(lead) {
  const d = deriveLead(lead)
  const base = `/${d.slug}`
  const services = getServices(lead)
  const cats = categoriesWithServices(lead)
  const locations = strongLocations(lead)

  const pages = []
  const add = (name, path, type, file, title, description) =>
    pages.push({ name, path, type, file, title, description })

  add('Home', base, 'home', 'index.html',
    `${d.businessName} | ${d.city} HVAC Repair, Installation & Maintenance`,
    `${d.businessName} — trusted HVAC repair, installation & maintenance in ${d.city}. Licensed, insured, same-day service.`)

  cats.forEach(c => add(`${c.label} (category)`, `${base}/${c.slug}`, 'category', `${c.slug}.html`,
    `${c.h1(d.city)} | ${d.businessName}`, c.blurb(d.city)))

  services.forEach(s => add(s.name, `${base}/services/${s.slug}`, 'service', `services-${s.slug}.html`,
    `${s.name} in ${d.city} | ${d.businessName}`,
    `${d.businessName} offers professional ${s.name.toLowerCase()} in ${d.city}. Licensed, insured, upfront pricing.`))

  locations.forEach(l => add(`HVAC in ${l.name}`, `${base}/areas/${l.slug}`, 'location', `areas-${l.slug}.html`,
    `HVAC Services in ${l.name} | ${d.businessName}`,
    `Trusted HVAC repair, installation & maintenance in ${l.name}. Same-day service.`))

  add('About', `${base}/about`, 'about', 'about.html', `About ${d.businessName}`,
    `Learn about ${d.businessName}, a locally owned HVAC company serving ${d.city}.`)
  add('Financing', `${base}/financing`, 'financing', 'financing.html', `HVAC Financing | ${d.businessName}`,
    `Flexible HVAC financing in ${d.city}. Low & 0% APR options on approved credit.`)
  add('Specials', `${base}/specials`, 'specials', 'specials.html', `Specials & Offers | ${d.businessName}`,
    `Current HVAC specials and offers in ${d.city}.`)
  add('Reviews', `${base}/reviews`, 'reviews', 'reviews.html', `Reviews | ${d.businessName}`,
    `See what ${d.city} homeowners say about ${d.businessName}.`)
  add('Gallery', `${base}/gallery`, 'gallery', 'gallery.html', `Gallery | ${d.businessName}`,
    `Photo gallery of recent HVAC work in ${d.city}.`)
  add('Contact', `${base}/contact`, 'contact', 'contact.html', `Contact Us | ${d.businessName}`,
    `Contact ${d.businessName} in ${d.city} for HVAC service.`)
  add('Blog', `${base}/blog`, 'blog', 'blog.html', `Blog | ${d.businessName}`,
    `HVAC tips and guides from ${d.businessName}.`)
  add('Privacy Policy', `${base}/privacy`, 'legal', 'privacy.html', `Privacy Policy | ${d.businessName}`,
    `Privacy policy for ${d.businessName}.`)
  add('Terms of Service', `${base}/terms`, 'legal', 'terms.html', `Terms of Service | ${d.businessName}`,
    `Terms of service for ${d.businessName}.`)

  return { d, pages }
}
