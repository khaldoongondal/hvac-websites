import { deriveLead } from '../../lib/lead'
import { getLeadProps } from '../../lib/getLead'
import { aboutSections, ABOUT_STATS } from '../../lib/pagesContent'
import { ABOUT_IMG } from '../../lib/hvacContent'
import { SITE_ORIGIN } from '../../lib/site'
import { businessJsonLd } from '../../lib/schema'
import Layout from '../../components/site/Layout'
import PageHero from '../../components/site/PageHero'
import PageBottom from '../../components/site/PageBottom'

export default function AboutPage({ lead }) {
  const d = deriveLead(lead)
  const sections = aboutSections(d.businessName, d.city)
  const canonical = `${SITE_ORIGIN}/${d.slug}/about`

  return (
    <Layout lead={lead} title={`About ${d.businessName}`}
      description={`Learn about ${d.businessName}, a locally owned HVAC company serving ${d.city}. Licensed, insured, and committed to honest service.`}
      canonical={canonical}
      head={<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(businessJsonLd(d, lead)) }} />}>

      <PageHero d={d} title={`About ${d.businessName}`} subtitle={`Your locally owned HVAC team in ${d.city}.`} image={ABOUT_IMG} />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10">
            {sections.map(({ h, p }) => (
              <div key={h}>
                <h2 className="text-2xl md:text-3xl font-black mb-4">{h}</h2>
                <div className="space-y-4 text-slate-600 leading-relaxed">{p.map((para, i) => <p key={i}>{para}</p>)}</div>
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-primary/20 rounded-2xl z-0" aria-hidden="true" />
            <img src={ABOUT_IMG} alt={`${d.businessName} team`} width={900} height={675} loading="lazy"
              className="relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
          </div>
        </div>
      </section>

      <section className="py-16" style={{ backgroundColor: 'var(--color-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {ABOUT_STATS.map(({ n, l }) => (
            <div key={l}>
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">{n}</div>
              <div className="font-bold text-sm uppercase tracking-wide" style={{ color: d.textOnPrimary }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      <PageBottom d={d} lead={lead} />
    </Layout>
  )
}

export async function getStaticPaths() { return { paths: [], fallback: 'blocking' } }
export async function getStaticProps({ params }) { return await getLeadProps(params.slug) }
