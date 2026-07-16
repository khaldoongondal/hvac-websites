import { useState } from 'react'
import { deriveLead, findService, strongLocations } from '../../../lib/lead'
import { getLeadProps } from '../../../lib/getLead'
import { serviceContent } from '../../../lib/serviceContent'
import { categoryOf, categorizeServices } from '../../../lib/categories'
import { SITE_ORIGIN } from '../../../lib/site'
import Layout from '../../../components/site/Layout'
import PageHero from '../../../components/site/PageHero'
import PageBottom from '../../../components/site/PageBottom'
import { openQuoteModal } from '../../../components/site/QuoteModal'

export default function ServicePage({ lead, serviceName }) {
  const [openFaq, setOpenFaq] = useState(0)
  const d = deriveLead(lead)
  const s = serviceContent(serviceName, d.businessName, d.city)
  const base = `/${d.slug}`
  const locations = strongLocations(lead)
  const catKey = categoryOf(serviceName)
  const related = categorizeServices(lead)[catKey].filter(x => x.name !== serviceName).slice(0, 4)
  const canonical = `${SITE_ORIGIN}${base}/services/${lead.serviceSlug}`

  const serviceLd = {
    '@context': 'https://schema.org', '@type': 'Service', serviceType: serviceName,
    provider: { '@type': 'HVACBusiness', '@id': `${SITE_ORIGIN}${base}/#business`, name: d.businessName, telephone: d.rawPhone },
    areaServed: d.city, url: canonical,
  }
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: s.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <Layout lead={lead}
      title={`${serviceName} in ${d.city}, ${stateAbbr(d)} | ${d.businessName}`}
      description={`${d.businessName} offers professional ${serviceName.toLowerCase()} in ${d.city}. Licensed, insured, upfront pricing, same-day service. Call ${d.phone}.`}
      canonical={canonical}
      head={<>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      </>}>

      <PageHero d={d} title={`${serviceName} in ${d.city}`} subtitle={s.blurb} image={s.img} />

      {/* Opening + image */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-primary mb-3">{serviceName}</p>
            <h2 className="text-3xl md:text-4xl font-black mb-6">{serviceName} in {d.city}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">{s.opening}</p>
            <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">Get a Free Quote →</button>
          </div>
          <div className="relative">
            <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-primary/20 rounded-2xl z-0" aria-hidden="true" />
            <img src={s.img} alt={`${serviceName} by ${d.businessName}`} width={900} height={675} loading="lazy"
              className="relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
          </div>
        </div>
      </section>

      {/* Need / problem */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black mb-5">{s.need.h}</h2>
          <div className="space-y-4 text-slate-600 leading-relaxed">{s.need.p.map((p, i) => <p key={i}>{p}</p>)}</div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black mb-10 text-center">Our {serviceName} Process</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {s.process.map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary btn-accent-text font-black text-xl flex items-center justify-center mx-auto mb-4">{i + 1}</div>
                <p className="font-semibold text-slate-700 text-sm">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Options + Why us */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-6">Equipment &amp; Options</h2>
            <ul className="space-y-3">
              {s.options.map(o => (
                <li key={o} className="flex items-center gap-3 text-slate-700"><span className="material-symbols-outlined text-primary" aria-hidden="true">check_circle</span>{o}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black mb-6">Why {d.city} Homeowners Choose Us</h2>
            <ul className="space-y-3">
              {s.why.map(w => (
                <li key={w} className="flex items-center gap-3 text-slate-700"><span className="material-symbols-outlined text-primary" aria-hidden="true">verified</span>{w}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Local relevance */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black mb-5">{serviceName} for {d.city} Homes</h2>
          <p className="text-slate-600 leading-relaxed">{s.local}</p>
        </div>
      </section>

      {/* FAQ (answers visible → FAQ schema is valid) */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">{serviceName} FAQs</h2>
          <div className="space-y-4">
            {s.faqs.map((f, i) => {
              const isOpen = openFaq === i
              return (
                <div key={f.q} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button onClick={() => setOpenFaq(isOpen ? -1 : i)} aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    {f.q}
                    <span className={`material-symbols-outlined text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">expand_more</span>
                  </button>
                  {isOpen && <p className="px-5 pb-5 -mt-1 text-slate-600 leading-relaxed">{f.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Related services + service areas */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {related.length > 0 && (
            <>
              <h2 className="text-2xl md:text-3xl font-black mb-6 text-center">Related Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
                {related.map(r => (
                  <a key={r.slug} href={`${base}/services/${r.slug}`} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:border-primary transition-colors text-center">{r.name}</a>
                ))}
              </div>
            </>
          )}
          {locations.length > 0 && (
            <>
              <h3 className="text-xl font-black mb-6 text-center">{serviceName} Service Areas</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {locations.map(l => (
                  <a key={l.slug} href={`${base}/areas/${l.slug}`} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 hover:border-primary transition-colors">
                    <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">location_on</span>
                    <span className="text-sm font-semibold text-slate-700">{serviceName} in {l.name}</span>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <PageBottom d={d} lead={lead} />
    </Layout>
  )
}

// Best-effort state abbreviation from "City, ST" for title tags.
function stateAbbr(d) {
  const m = (d.address || '').match(/,\s*([A-Z]{2})\b/)
  return m ? m[1] : (d.city || '').match(/\b([A-Z]{2})$/)?.[1] || 'Your Area'
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const res = await getLeadProps(params.slug)
  if (res.notFound) return res
  const svc = findService(res.props.lead, params.service)
  if (!svc) return { notFound: true, revalidate: 300 }
  return { props: { ...res.props, lead: { ...res.props.lead, serviceSlug: params.service }, serviceName: svc.name }, revalidate: res.revalidate }
}
