import { deriveLead, reviewUrl } from '../../lib/lead'
import { getLeadProps } from '../../lib/getLead'
import { TESTIMONIALS, FALLBACK_HERO } from '../../lib/hvacContent'
import { SITE_ORIGIN } from '../../lib/site'
import Layout from '../../components/site/Layout'
import PageHero from '../../components/site/PageHero'
import PageBottom from '../../components/site/PageBottom'

const STARS = [1, 2, 3, 4, 5]

export default function ReviewsPage({ lead }) {
  const d = deriveLead(lead)

  return (
    <Layout lead={lead} title="Reviews"
      description={`See what ${d.city} homeowners say about ${d.businessName}. ${d.rating ? `Rated ${d.rating}★.` : ''} Read our reviews and leave your own.`}
      canonical={`${SITE_ORIGIN}/${d.slug}/reviews`}>

      <PageHero d={d} title="Customer Reviews" subtitle={`See why ${d.city} homeowners trust ${d.businessName}.`} image={FALLBACK_HERO} />

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <div className="flex justify-center text-primary mb-4" aria-hidden="true">
            {STARS.map(i => <span key={i} className="material-symbols-outlined text-4xl">star</span>)}
          </div>
          {d.rating && (
            <p className="text-lg text-slate-600 mb-6">Rated <span className="font-black">{d.rating} ★</span>{d.reviews ? ` from ${d.reviews} Google reviews` : ''}.</p>
          )}
          <a href={reviewUrl(d.businessName, d.city)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
            <span className="material-symbols-outlined" aria-hidden="true">reviews</span> Review Us on Google
          </a>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map(({ quote, author }) => (
            <div key={author} className="bg-white p-8 rounded-xl shadow-md border border-slate-100">
              <div className="flex text-primary mb-4" aria-hidden="true">
                {STARS.map(i => <span key={i} className="material-symbols-outlined">star</span>)}
              </div>
              <p className="text-slate-600 italic mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
              <p className="font-bold">— {author}</p>
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
