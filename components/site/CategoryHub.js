import { deriveLead, strongLocations } from '../../lib/lead'
import { categoryServices } from '../../lib/categories'
import { serviceMeta } from '../../lib/serviceContent'
import { SITE_ORIGIN } from '../../lib/site'
import Layout from './Layout'
import PageHero from './PageHero'
import PageBottom from './PageBottom'

// Category hub page (Cooling / Heating / Other Services). Lists every service in
// the category and cross-links to service + location pages.
export default function CategoryHub({ lead, slug }) {
  const d = deriveLead(lead)
  const base = `/${d.slug}`
  const { cat, services } = categoryServices(lead, slug)
  const locations = strongLocations(lead)
  const canonical = `${SITE_ORIGIN}${base}/${cat.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: cat.h1(d.city),
    provider: { '@type': 'HVACBusiness', '@id': `${SITE_ORIGIN}${base}/#business`, name: d.businessName, telephone: d.rawPhone },
    areaServed: d.city,
    url: canonical,
  }

  return (
    <Layout lead={lead} title={cat.h1(d.city)}
      description={`${d.businessName} — ${cat.blurb(d.city)} Licensed, insured, same-day service. Call ${d.phone}.`}
      canonical={canonical}
      head={<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}>

      <PageHero d={d} title={cat.h1(d.city)} subtitle={cat.blurb(d.city)} image={cat.hero} />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our {cat.label} Services</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(({ name, slug: sSlug }) => {
              const m = serviceMeta(name)
              return (
                <a key={sSlug} href={`${base}/services/${sSlug}`} aria-label={`${name} in ${d.city}`}
                  className="group bg-white rounded-xl shadow-lg border border-slate-100 p-8 transition-all hover:-translate-y-2 block">
                  <span className="material-symbols-outlined text-primary text-5xl mb-4" aria-hidden="true">{m.icon}</span>
                  <h3 className="text-xl font-bold mb-2">{name}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">Professional {name.toLowerCase()} for {d.city} homeowners.</p>
                  <span className="text-primary font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {locations.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">{cat.label} Service Areas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {locations.map(({ name, slug: aSlug }) => (
                <a key={aSlug} href={`${base}/areas/${aSlug}`}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">location_on</span>
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <PageBottom d={d} lead={lead} />
    </Layout>
  )
}
