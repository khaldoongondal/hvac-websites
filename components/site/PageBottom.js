import { rgba } from '../../lib/colors'
import { serviceAreas, mapFor, reviewUrl } from '../../lib/lead'
import { PROCESS_STEPS, REVIEW_BG } from '../../lib/hvacContent'
import { openQuoteModal } from './QuoteModal'

const STARS = [1, 2, 3, 4, 5]

// The shared tail every non-home page ends with: Reviews band → Our Process →
// Proudly Serving Areas → final CTA. Matches the reference sub-pages exactly.
export default function PageBottom({ d, lead }) {
  const areas = serviceAreas(d.city)
  const { hasLocation, mapSrc } = mapFor(lead)

  return (
    <>
      {/* Reviews band */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10" style={{ backgroundColor: rgba(d.primary, 0.88) }} />
          <img src={REVIEW_BG} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: d.textOnPrimary }}>See Why Our Customers Love Us</h2>
          <div className="flex justify-center text-primary mb-6">
            {STARS.map(i => <span key={i} className="material-symbols-outlined text-4xl">star</span>)}
          </div>
          {d.rating && (
            <p className="mb-8 text-lg" style={{ color: d.textOnPrimary, opacity: 0.9 }}>
              Rated <span className="font-black">{d.rating} ★</span>{d.reviews ? ` from ${d.reviews} Google reviews` : ''}
            </p>
          )}
          <a href={reviewUrl(d.businessName, d.city)} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
            <span className="material-symbols-outlined">reviews</span> Review Us on Google
          </a>
        </div>
      </section>

      {/* Our Process */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Process</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Getting comfortable again takes just a few simple steps.</p>
            <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full" />
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] border-t-2 border-dashed border-primary/40 -z-0" />
            {PROCESS_STEPS.map(({ icon, title, desc }, i) => (
              <div key={title} className="relative z-10 text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md border-2 border-primary mb-5">
                  <span className="material-symbols-outlined text-primary text-4xl">{icon}</span>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary btn-accent-text text-sm font-black flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Proudly Serving Areas + map */}
      <section id="areas" className="py-24 scroll-mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Proudly Serving {d.city}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Serving <span className="font-black text-primary">{d.city}</span> and all surrounding communities.
              Not sure if we cover your area? Give us a call.
            </p>
            <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full" />
          </div>
          <div className={`grid gap-10 items-stretch ${hasLocation ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="grid grid-cols-2 gap-3 content-start">
              {areas.map(area => (
                <div key={area} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                  <span className="text-sm font-semibold text-slate-700">{area}</span>
                </div>
              ))}
            </div>
            {hasLocation && (
              <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 min-h-[340px]">
                <iframe title={`${d.businessName} service area map`} src={mapSrc}
                  width="100%" height="100%" loading="lazy"
                  style={{ border: 0, display: 'block', width: '100%', height: '100%', minHeight: '340px' }}
                  referrerPolicy="no-referrer-when-downgrade" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-forest-green rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-3">Ready to take the next step?</p>
              <h2 className="text-4xl font-black mb-6">Get a Free Quote Today!</h2>
              <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto">
                Our {d.city} HVAC experts are standing by. No obligation, no pressure — just honest help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-10 py-4 rounded-lg font-black text-xl transition-transform hover:scale-105">
                  Get a Free Quote →
                </button>
                <a href={d.tel} className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-10 py-4 rounded-lg font-black text-xl transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">call</span> {d.phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
