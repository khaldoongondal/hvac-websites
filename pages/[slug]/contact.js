import { deriveLead, mapFor } from '../../lib/lead'
import { getLeadProps } from '../../lib/getLead'
import { FALLBACK_HERO, HOURS } from '../../lib/hvacContent'
import Layout from '../../components/site/Layout'
import PageHero from '../../components/site/PageHero'
import PageBottom from '../../components/site/PageBottom'
import QuoteForm from '../../components/QuoteForm'

export default function ContactPage({ lead }) {
  const d = deriveLead(lead)
  const { hasLocation, mapSrc } = mapFor(lead)

  return (
    <Layout lead={lead} title="Contact Us">
      <PageHero d={d} title="Contact Us" subtitle={`Get in touch with ${d.businessName} for fast, friendly service.`} image={FALLBACK_HERO} />

      {/* Contact info + form */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-3">Get in Touch</p>
              <h2 className="text-3xl md:text-4xl font-black mb-6">Contact Us for a Free Quote</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Have a question or ready to book service? Call us, or fill out the form and our {d.city} HVAC
                team will get back to you right away.
              </p>
              <ul className="space-y-5">
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-full">call</span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Phone</p>
                    <a href={d.tel} className="font-black text-lg hover:text-primary transition-colors">{d.phone}</a>
                  </div>
                </li>
                <li className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-full">location_on</span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-bold">Service Area</p>
                    <p className="font-bold">{d.address || `${d.city} & surrounding areas`}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary bg-primary/10 p-3 rounded-full">schedule</span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500 font-bold mb-1">Hours</p>
                    <ul className="text-sm text-slate-600 space-y-0.5">
                      {HOURS.map(({ day, time }) => (
                        <li key={day} className="flex justify-between gap-6"><span>{day}</span><span>{time}</span></li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
            <QuoteForm leadSlug={d.slug} businessName={d.businessName} heading="Send Us a Message" />
          </div>

          {hasLocation && (
            <div className="mt-16 rounded-2xl overflow-hidden shadow-lg border border-slate-200 h-[380px]">
              <iframe title={`${d.businessName} location map`} src={mapSrc}
                width="100%" height="100%" loading="lazy"
                style={{ border: 0, display: 'block', width: '100%', height: '100%' }}
                referrerPolicy="no-referrer-when-downgrade" />
            </div>
          )}
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
  return await getLeadProps(params.slug)
}
