import { deriveLead, findService, strongLocations } from '../../../lib/lead'
import { getLeadProps } from '../../../lib/getLead'
import { serviceContent } from '../../../lib/serviceContent'
import { SITE_ORIGIN } from '../../../lib/site'
import Layout from '../../../components/site/Layout'
import PageHero from '../../../components/site/PageHero'
import PageBottom from '../../../components/site/PageBottom'
import { openQuoteModal } from '../../../components/site/QuoteModal'

export default function ServicePage({ lead, serviceName }) {
  const d = deriveLead(lead)
  const s = serviceContent(serviceName, d.businessName, d.city)
  const base = `/${d.slug}`
  const locations = strongLocations(lead)
  const canonical = `${SITE_ORIGIN}${base}/services/${lead.serviceSlug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: serviceName,
    provider: { '@type': 'HVACBusiness', '@id': `${SITE_ORIGIN}${base}/#business`, name: d.businessName, telephone: d.rawPhone },
    areaServed: d.city,
    url: canonical,
  }

  return (
    <Layout lead={lead}
      title={`${serviceName} in ${d.city}`}
      description={`${d.businessName} offers professional ${serviceName.toLowerCase()} in ${d.city} and surrounding areas. Licensed, insured, upfront pricing. Call ${d.phone}.`}
      canonical={canonical}
      head={<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}>

      <PageHero d={d} title={`${serviceName} in ${d.city}`} subtitle={s.blurb} image={s.img} />

      {/* Intro: copy + bullets + image */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-3">{serviceName}</p>
              <h2 className="text-3xl md:text-4xl font-black mb-6">{serviceName} You Can Rely On</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed mb-8">
                {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {s.bullets.map(b => (
                  <div key={b} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-full" aria-hidden="true">check</span>
                    <span className="font-semibold text-slate-700 text-sm">{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
                Get a Free Quote →
              </button>
            </div>
            <div className="relative">
              <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-primary/20 rounded-2xl z-0" aria-hidden="true" />
              <img src={s.img} alt={`${serviceName} by ${d.businessName}`} width={900} height={675} loading="lazy"
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
            </div>
          </div>
        </div>
      </section>

      {/* Service areas cross-links */}
      {locations.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-black mb-8 text-center">{serviceName} Across Our Service Areas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {locations.map(({ name, slug }) => (
                <a key={slug} href={`${base}/areas/${slug}`}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-primary text-lg" aria-hidden="true">location_on</span>
                  <span className="text-sm font-semibold text-slate-700">{serviceName} in {name}</span>
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

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const res = await getLeadProps(params.slug)
  if (res.notFound) return res
  const svc = findService(res.props.lead, params.service)
  if (!svc) return { notFound: true, revalidate: 300 }
  return {
    props: { ...res.props, lead: { ...res.props.lead, serviceSlug: params.service }, serviceName: svc.name },
    revalidate: res.revalidate,
  }
}
