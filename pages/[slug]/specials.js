import { deriveLead } from '../../lib/lead'
import { getLeadProps } from '../../lib/getLead'
import { specialsOffers } from '../../lib/pagesContent'
import { FALLBACK_HERO } from '../../lib/hvacContent'
import { SITE_ORIGIN } from '../../lib/site'
import Layout from '../../components/site/Layout'
import PageHero from '../../components/site/PageHero'
import PageBottom from '../../components/site/PageBottom'
import { openQuoteModal } from '../../components/site/QuoteModal'

export default function SpecialsPage({ lead }) {
  const d = deriveLead(lead)
  const offers = specialsOffers()

  return (
    <Layout lead={lead} title="Specials & Offers"
      description={`Current HVAC specials and offers from ${d.businessName} in ${d.city}. Save on tune-ups, installations, and more.`}
      canonical={`${SITE_ORIGIN}/${d.slug}/specials`}>

      <PageHero d={d} title="Specials & Offers" subtitle={`Save on heating & cooling service in ${d.city}.`} image={FALLBACK_HERO} />

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          {offers.map(({ badge, title, detail }) => (
            <div key={title} className="bg-white rounded-xl shadow-lg border border-slate-100 p-8 border-t-4 border-primary">
              <span className="inline-block bg-primary/10 text-primary text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4">{badge}</span>
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{detail}</p>
              <button onClick={openQuoteModal} className="text-primary font-bold text-sm inline-flex items-center gap-1 hover:gap-2 transition-all">
                Claim This Offer <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-slate-500 text-sm mt-10">Offers subject to change. Call {d.phone} for current details.</p>
      </section>

      <PageBottom d={d} lead={lead} />
    </Layout>
  )
}

export async function getStaticPaths() { return { paths: [], fallback: 'blocking' } }
export async function getStaticProps({ params }) { return await getLeadProps(params.slug) }
