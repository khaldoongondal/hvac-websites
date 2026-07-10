import { deriveLead } from '../../../lib/lead'
import { getLeadProps } from '../../../lib/getLead'
import { SERVICE_DETAILS } from '../../../lib/pagesContent'
import Layout from '../../../components/site/Layout'
import PageHero from '../../../components/site/PageHero'
import PageBottom from '../../../components/site/PageBottom'
import { openQuoteModal } from '../../../components/site/QuoteModal'

export default function ServicePage({ lead, serviceSlug }) {
  const d = deriveLead(lead)
  const s = SERVICE_DETAILS[serviceSlug]

  return (
    <Layout lead={lead} title={`${s.title} in ${d.city}`}>
      <PageHero d={d} title={s.title} subtitle={`${s.blurb} Serving ${d.city} and surrounding areas.`} image={s.img} />

      {/* Intro: copy + key bullets + image */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-3">{s.title}</p>
              <h2 className="text-3xl md:text-4xl font-black mb-6">{s.title} You Can Rely On</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed mb-8">
                {s.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {s.bullets.map(b => (
                  <div key={b} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-1.5 rounded-full">check</span>
                    <span className="font-semibold text-slate-700 text-sm">{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
                Get a Free Quote →
              </button>
            </div>
            <div className="relative">
              <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-primary/20 rounded-2xl z-0" />
              <img src={s.img} alt={s.title} width={900} height={675} loading="lazy"
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery strip */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {s.gallery.map((src, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl shadow-md group">
                <img src={src} alt={`${s.title} project ${i + 1}`} width={800} height={600} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            ))}
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
  if (!SERVICE_DETAILS[params.service]) return { notFound: true, revalidate: 300 }
  const res = await getLeadProps(params.slug)
  if (res.notFound) return res
  return { props: { ...res.props, serviceSlug: params.service }, revalidate: res.revalidate }
}
