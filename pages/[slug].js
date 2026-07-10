import { useState } from 'react'
import { rgba } from '../lib/colors'
import { deriveLead, serviceAreas, mapFor, reviewUrl } from '../lib/lead'
import { getLeadProps } from '../lib/getLead'
import { SERVICE_ORDER } from '../lib/pagesContent'
import Layout from '../components/site/Layout'
import QuoteForm from '../components/QuoteForm'
import { openQuoteModal } from '../components/site/QuoteModal'
import {
  TRUST_BADGES, SERVICES, PROCESS_STEPS, FAQS,
  GALLERY, REVIEW_BG, ABOUT_ITEMS, ABOUT_IMG,
} from '../lib/hvacContent'

const STARS = [1, 2, 3, 4, 5]

export default function LeadPage({ lead, heroImage }) {
  const [openFaq, setOpenFaq] = useState(0)
  const d = deriveLead(lead)
  const base = `/${d.slug}`
  const areas = serviceAreas(d.city)
  const { hasLocation, mapSrc } = mapFor(lead)
  const heroGradient = `linear-gradient(to right, ${rgba(d.primary, 0.94)}, ${rgba(d.primary, 0.6)})`

  return (
    <Layout lead={lead}>
      {/* ── Hero + inline form ─────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10" style={{ backgroundImage: heroGradient }} />
          <img alt={`${d.city} skyline`} className="w-full h-full object-cover" src={heroImage} />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6 uppercase" style={{ color: d.textOnPrimary }}>
                {d.businessName}
              </h1>
              <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: d.textOnPrimary, opacity: 0.9 }}>
                {d.city}&apos;s trusted HVAC experts. Professional heating and cooling for {d.city} and surrounding
                areas — reliable, energy-efficient comfort done right the first time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
                  Get a Free Quote →
                </button>
                <a href={d.tel} className="backdrop-blur-sm border px-8 py-4 rounded-lg font-black text-lg transition-all flex items-center justify-center gap-2"
                  style={{ color: d.textOnPrimary, borderColor: rgba(d.textOnPrimary, 0.3), backgroundColor: rgba(d.textOnPrimary, 0.08) }}>
                  <span className="material-symbols-outlined">call</span> {d.phone}
                </a>
              </div>
            </div>
            <div id="quote" className="scroll-mt-24">
              <QuoteForm leadSlug={d.slug} businessName={d.businessName} heading="Get a Free Quote" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust badge bar ────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {TRUST_BADGES.map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">{icon}</span>
                <span className="text-sm font-bold uppercase tracking-wide text-slate-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── About (image + key items) ──────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: 'var(--color-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-primary/25 rounded-2xl z-0" />
              <img src={ABOUT_IMG} alt={`${d.businessName} HVAC technician`} width={900} height={675} loading="lazy"
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
              {d.logoUrl && (
                <div className="absolute z-20 -top-5 -left-5 bg-white rounded-xl shadow-xl p-4 hidden sm:block">
                  <img src={d.logoUrl} alt={d.businessName} className="h-14 w-auto object-contain" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-3">About Us</p>
              <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: d.textOnPrimary }}>
                Your Trusted HVAC Team in {d.city}
              </h2>
              <div className="space-y-4 mb-8 leading-relaxed" style={{ color: d.textOnPrimary, opacity: 0.9 }}>
                <p>
                  {d.businessName} is a locally owned and operated HVAC company proudly serving {d.city} and the
                  surrounding communities. We built our reputation on honest pricing, quality workmanship, and
                  treating every home like our own.
                </p>
                <p>
                  From emergency repairs to full system installations, our licensed and insured technicians deliver
                  reliable, energy-efficient comfort — every season, every time. No subcontractors, no surprises.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {ABOUT_ITEMS.map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-2xl shrink-0">{icon}</span>
                    <span className="font-bold text-sm" style={{ color: d.textOnPrimary }}>{label}</span>
                  </div>
                ))}
              </div>
              <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
                Get a Free Quote →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Services (image cards → service pages) ─────────────── */}
      <section id="services" className="py-24 scroll-mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Services</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(({ icon, title, desc, img }, i) => (
              <a key={title} href={`${base}/services/${SERVICE_ORDER[i]}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 transition-all hover:-translate-y-2 block">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={img} alt={title} width={800} height={500} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to top, ${rgba(d.primary, 0.55)}, transparent)` }} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                    <h3 className="text-xl font-bold">{title}</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{desc}</p>
                  <span className="text-primary font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Process ────────────────────────────────────────────── */}
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

      {/* ── See Our Work (gallery) ─────────────────────────────────── */}
      <section id="gallery" className="py-24 scroll-mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">See Our Work</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {GALLERY.map((src, i) => (
              <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl shadow-md group">
                <img src={src} alt={`HVAC project ${i + 1}`} width={800} height={600} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href={`${base}/gallery`} className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black transition-transform hover:scale-105">
              See All Photos →
            </a>
          </div>
        </div>
      </section>

      {/* ── Reviews (Google CTA band) ──────────────────────────────── */}
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

      {/* ── FAQ ────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 scroll-mt-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Frequently Asked Questions</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }, i) => {
              const isOpen = openFaq === i
              return (
                <div key={q} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold">
                    {q}
                    <span className={`material-symbols-outlined text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {isOpen && <p className="px-5 pb-5 -mt-1 text-slate-600 leading-relaxed">{a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Proudly Serving Areas + map ────────────────────────────── */}
      <section id="areas" className="py-24 scroll-mt-20 bg-slate-50">
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
                <div key={area} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-3">
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

      {/* ── Final CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
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
    </Layout>
  )
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  return await getLeadProps(params.slug, { withHero: true })
}
