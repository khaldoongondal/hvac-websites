import { deriveLead } from '../../lib/lead'
import { getLeadProps } from '../../lib/getLead'
import { financingBlocks } from '../../lib/pagesContent'
import { FALLBACK_HERO } from '../../lib/hvacContent'
import { SITE_ORIGIN } from '../../lib/site'
import Layout from '../../components/site/Layout'
import PageHero from '../../components/site/PageHero'
import PageBottom from '../../components/site/PageBottom'
import { openQuoteModal } from '../../components/site/QuoteModal'

export default function FinancingPage({ lead }) {
  const d = deriveLead(lead)
  const blocks = financingBlocks()

  return (
    <Layout lead={lead} title="HVAC Financing"
      description={`Flexible HVAC financing from ${d.businessName} in ${d.city}. Low & 0% APR options on approved credit. Comfort that fits your budget.`}
      canonical={`${SITE_ORIGIN}/${d.slug}/financing`}>

      <PageHero d={d} title="HVAC Financing Options" subtitle={`Comfort that fits your budget — flexible financing for ${d.city} homeowners.`} image={FALLBACK_HERO} />

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Affordable Comfort, Made Simple</h2>
          <p className="text-slate-600 leading-relaxed">A new heating or cooling system is a big investment — financing lets you get the comfort and efficiency you need now and pay over time. {d.businessName} offers flexible options on approved credit.</p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {blocks.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 text-center">
              <span className="material-symbols-outlined text-primary text-5xl mb-4" aria-hidden="true">{icon}</span>
              <h3 className="text-lg font-bold mb-2">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-14">
          <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-10 py-4 rounded-lg font-black text-xl transition-transform hover:scale-105">Ask About Financing →</button>
        </div>
      </section>

      <PageBottom d={d} lead={lead} />
    </Layout>
  )
}

export async function getStaticPaths() { return { paths: [], fallback: 'blocking' } }
export async function getStaticProps({ params }) { return await getLeadProps(params.slug) }
