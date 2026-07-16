import { useState } from 'react'
import { deriveLead, findLocation, getServices, strongLocations } from '../../../lib/lead'
import { getLeadProps } from '../../../lib/getLead'
import { areaSections, areaFaqs } from '../../../lib/pagesContent'
import { FALLBACK_HERO } from '../../../lib/hvacContent'
import { SITE_ORIGIN } from '../../../lib/site'
import Layout from '../../../components/site/Layout'
import PageHero from '../../../components/site/PageHero'
import PageBottom from '../../../components/site/PageBottom'

export default function AreaPage({ lead, areaName }) {
  const [openFaq, setOpenFaq] = useState(0)
  const d = deriveLead(lead)
  const base = `/${d.slug}`
  const sections = areaSections(areaName, d.businessName, d.city)
  const faqs = areaFaqs(areaName, d.city)
  const services = getServices(lead)
  const others = strongLocations(lead).filter(l => l.name !== areaName)
  const canonical = `${SITE_ORIGIN}${base}/areas/${lead.areaSlug}`

  const serviceLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `HVAC Services in ${areaName}`,
    provider: { '@type': 'HVACBusiness', '@id': `${SITE_ORIGIN}${base}/#business`, name: d.businessName, telephone: d.rawPhone },
    areaServed: areaName,
    url: canonical,
  }
  const faqLd = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  }

  return (
    <Layout lead={lead}
      title={`HVAC Services in ${areaName} | ${d.businessName}`}
      description={`${d.businessName} — trusted HVAC repair, installation & maintenance in ${areaName}. Licensed, insured, same-day service. Call ${d.phone}.`}
      canonical={canonical}
      head={<>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      </>}>

      <PageHero d={d} title={`${areaName} HVAC Services`} subtitle={`Dependable heating & cooling for ${areaName} homeowners.`} image={FALLBACK_HERO} />

      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {sections.map(({ h, p }) => (
            <div key={h}>
              <h2 className="text-2xl md:text-3xl font-black mb-4">{h}</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                {p.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services in this area */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">Our Services in {areaName}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {services.map(({ name, slug }) => (
              <a key={slug} href={`${base}/services/${slug}`}
                className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-primary transition-colors">
                <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">build</span>
                <span className="text-sm font-semibold text-slate-700">{name} in {areaName}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Other areas */}
      {others.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">Other Areas We Serve</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {others.map(({ name, slug }) => (
                <a key={slug} href={`${base}/areas/${slug}`}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">location_on</span>
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location FAQs (visible → schema valid) */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">{areaName} HVAC FAQs</h2>
          <div className="space-y-4">
            {faqs.map((f, i) => {
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

      <PageBottom d={d} lead={lead} />
    </Layout>
  )
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const res = await getLeadProps(params.slug)
  if (res.notFound) return res
  const loc = findLocation(res.props.lead, params.area)
  if (!loc) return { notFound: true, revalidate: 300 }
  return {
    props: { ...res.props, lead: { ...res.props.lead, areaSlug: params.area }, areaName: loc.name },
    revalidate: res.revalidate,
  }
}
