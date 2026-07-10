import Head from 'next/head'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { rgba, cleanCity, contrastText, buildColorCSS } from '../lib/colors'
import { formatPhone, telHref } from '../lib/format'
import QuoteForm from '../components/QuoteForm'
import {
  TRUST_BADGES, SERVICES, PROCESS_STEPS, FAQS,
  GALLERY, HOURS, FALLBACK_HERO, REVIEW_BG,
  ABOUT_ITEMS, ABOUT_IMG,
} from '../lib/hvacContent'

const STARS = [1, 2, 3, 4, 5]

const NAV_LINKS = [
  { href: '#top',      label: 'Home'         },
  { href: '#services', label: 'Services'     },
  { href: '#gallery',  label: 'Gallery'      },
  { href: '#areas',    label: 'Service Areas' },
  { href: '#faq',      label: 'FAQ'          },
  { href: '#quote',    label: 'Contact'      },
]

export default function LeadPage({ lead, heroImage }) {
  const [openFaq, setOpenFaq] = useState(0)

  const rawPhone      = lead.phone || ''
  const phone         = formatPhone(rawPhone)
  const tel           = telHref(rawPhone)
  const city          = cleanCity(lead.city) || 'Your City'
  const businessName  = lead.business_name   || 'Local HVAC'
  const primary       = lead.color_primary          || '#1b3022'
  const secondary     = lead.color_secondary        || '#2d5a3d'
  const accent        = lead.color_accent           || '#c8a328'
  const primaryLight  = lead.color_primary_light    || primary
  const textOnPrimary = lead.color_text_on_primary  || '#ffffff'
  const textOnAccent  = lead.color_text_on_accent   || '#1a1a1a'
  const logoUrl       = lead.logo_url?.startsWith('http') ? lead.logo_url : null

  const reviewUrl = `https://www.google.com/search?q=${encodeURIComponent(`${businessName} ${city} reviews`)}`
  const areas = [
    `Greater ${city} Area`, `Downtown ${city}`, `North ${city}`,
    `South ${city}`, `${city} Suburbs`, 'Surrounding Communities',
  ]
  // Only embed a map when we actually have a location — otherwise a vague query
  // makes Google drop a pin somewhere random (e.g. abroad). Bias to the US.
  const rawLoc      = (lead.address || lead.city || '').trim()
  const hasLocation = rawLoc.length > 0
  const mapSrc      = hasLocation
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${rawLoc}, USA`)}&output=embed`
    : ''

  function openQuoteModal() {
    const m = document.getElementById('quote-modal')
    if (m) m.style.display = 'flex'
  }
  function closeQuoteModal() {
    const m = document.getElementById('quote-modal')
    if (m) m.style.display = 'none'
  }

  // Hero overlay uses primary (dark base) so text always reads against a dark tint.
  const heroGradient = `linear-gradient(to right, ${rgba(primary, 0.94)}, ${rgba(primary, 0.6)})`

  return (
    <>
      <Head>
        <title>{`${businessName} | ${city}'s Trusted HVAC Experts`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{buildColorCSS(primary, secondary, accent, primaryLight, textOnPrimary, textOnAccent)}</style>
      </Head>

      <span id="top" />

      {/* ── Navigation (dark, matches hero) ──────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: rgba(primary, 0.96), borderColor: rgba(textOnPrimary, 0.12) }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            <a href="#top" className="flex items-center gap-3 text-xl font-black tracking-tighter shrink-0" style={{ color: textOnPrimary }}>
              {logoUrl ? (
                <>
                  <img src={logoUrl} alt={businessName} className="h-12 w-auto object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline' }} />
                  <span style={{ display: 'none' }}>{businessName}</span>
                </>
              ) : businessName}
            </a>

            <div className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map(({ href, label }) => (
                <a key={href} href={href} className="text-sm font-bold uppercase tracking-wide transition-colors hover:text-primary" style={{ color: textOnPrimary }}>
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button onClick={openQuoteModal} className="hidden sm:inline-block bg-primary hover:bg-primary/90 btn-accent-text px-5 py-2.5 rounded-lg font-bold text-sm transition-all">
                Get a Free Quote
              </button>
              <a href={tel} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm border transition-colors hover:bg-primary hover:btn-accent-text"
                style={{ color: textOnPrimary, borderColor: rgba(textOnPrimary, 0.3) }}>
                <span className="material-symbols-outlined text-primary text-lg">call</span>
                <span className="hidden md:inline">{phone}</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero + inline form ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10" style={{ backgroundImage: heroGradient }} />
          <img alt={`${city} skyline`} className="w-full h-full object-cover" src={heroImage || FALLBACK_HERO} />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6 uppercase" style={{ color: textOnPrimary }}>
                {businessName}
              </h1>
              <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: textOnPrimary, opacity: 0.9 }}>
                {city}&apos;s trusted HVAC experts. Professional heating and cooling for {city} and surrounding
                areas — reliable, energy-efficient comfort done right the first time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
                  Get a Free Quote →
                </button>
                <a href={tel} className="backdrop-blur-sm border px-8 py-4 rounded-lg font-black text-lg transition-all flex items-center justify-center gap-2"
                  style={{ color: textOnPrimary, borderColor: rgba(textOnPrimary, 0.3), backgroundColor: rgba(textOnPrimary, 0.08) }}>
                  <span className="material-symbols-outlined">call</span> {phone}
                </a>
              </div>
            </div>
            <div id="quote" className="scroll-mt-24">
              <QuoteForm leadSlug={lead.slug} businessName={businessName} heading="Get a Free Quote" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust badge bar ──────────────────────────────────────────── */}
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

      {/* ── About (image + key items) ────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: 'var(--color-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -bottom-5 -right-5 w-32 h-32 bg-primary/25 rounded-2xl z-0" />
              <img src={ABOUT_IMG} alt={`${businessName} HVAC technician`} width={900} height={675} loading="lazy"
                className="relative z-10 rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]" />
              {logoUrl && (
                <div className="absolute z-20 -top-5 -left-5 bg-white rounded-xl shadow-xl p-4 hidden sm:block">
                  <img src={logoUrl} alt={businessName} className="h-14 w-auto object-contain" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-3">About Us</p>
              <h2 className="text-3xl md:text-4xl font-black mb-6" style={{ color: textOnPrimary }}>
                Your Trusted HVAC Team in {city}
              </h2>
              <div className="space-y-4 mb-8 leading-relaxed" style={{ color: textOnPrimary, opacity: 0.9 }}>
                <p>
                  {businessName} is a locally owned and operated HVAC company proudly serving {city} and the
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
                    <span className="font-bold text-sm" style={{ color: textOnPrimary }}>{label}</span>
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

      {/* ── Our Services (image cards) ───────────────────────────────── */}
      <section id="services" className="py-24 scroll-mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Services</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(({ icon, title, desc, img }) => (
              <div key={title} className="group bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 transition-all hover:-translate-y-2">
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img src={img} alt={title} width={800} height={500} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ backgroundImage: `linear-gradient(to top, ${rgba(primary, 0.55)}, transparent)` }} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
                    <h3 className="text-xl font-bold">{title}</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Our Process ──────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Process</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Getting comfortable again takes just a few simple steps.</p>
            <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full" />
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* connecting line */}
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

      {/* ── See Our Work (gallery) ───────────────────────────────────── */}
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
        </div>
      </section>

      {/* ── Reviews (Google CTA band) ────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-10" style={{ backgroundColor: rgba(primary, 0.88) }} />
          <img src={REVIEW_BG} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
        <div className="relative z-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: textOnPrimary }}>See Why Our Customers Love Us</h2>
          <div className="flex justify-center text-primary mb-6">
            {STARS.map(i => <span key={i} className="material-symbols-outlined text-4xl">star</span>)}
          </div>
          {lead.rating && (
            <p className="mb-8 text-lg" style={{ color: textOnPrimary, opacity: 0.9 }}>
              Rated <span className="font-black">{lead.rating} ★</span>{lead.reviews ? ` from ${lead.reviews} Google reviews` : ''}
            </p>
          )}
          <a href={reviewUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
            <span className="material-symbols-outlined">reviews</span> Review Us on Google
          </a>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
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

      {/* ── Proudly Serving Areas + map ──────────────────────────────── */}
      <section id="areas" className="py-24 scroll-mt-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Proudly Serving {city}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Serving <span className="font-black text-primary">{city}</span> and all surrounding communities.
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
                <iframe
                  title={`${businessName} service area map`}
                  src={mapSrc}
                  width="100%" height="100%" loading="lazy"
                  style={{ border: 0, display: 'block', width: '100%', height: '100%', minHeight: '340px' }}
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-forest-green rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <p className="text-sm font-black uppercase tracking-widest text-primary mb-3">Ready to take the next step?</p>
              <h2 className="text-4xl font-black mb-6">Get a Free Quote Today!</h2>
              <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto">
                Our {city} HVAC experts are standing by. No obligation, no pressure — just honest help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-10 py-4 rounded-lg font-black text-xl transition-transform hover:scale-105">
                  Get a Free Quote →
                </button>
                <a href={tel} className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-10 py-4 rounded-lg font-black text-xl transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">call</span> {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-deep-green text-white py-20 pb-28 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-black tracking-tighter mb-6">{businessName}</h3>
              <p className="text-white/60 leading-relaxed">
                Keeping {city} comfortable with expert HVAC services. Licensed, insured, and locally operated.
              </p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3 text-white/60">
                {NAV_LINKS.map(({ href, label }) => (
                  <li key={href}><a href={href} className="hover:text-primary transition-colors">{label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Contact</h4>
              <ul className="space-y-4 text-white/60">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span> {lead.address || city}
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">call</span>
                  <a href={tel} className="hover:text-primary transition-colors">{phone}</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Hours</h4>
              <ul className="space-y-1.5 text-white/60 text-sm">
                {HOURS.map(({ day, time }) => (
                  <li key={day} className="flex justify-between gap-4"><span>{day}</span><span>{time}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm space-y-2">
            <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
            <p>
              Preview by{' '}
              <a href="https://localgrowthstudio.com" className="underline hover:text-white transition-colors">Local Growth Studio</a>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Mobile sticky CTA ────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 flex gap-4">
        <a href={tel} className="flex-1 bg-slate-100 text-slate-900 flex items-center justify-center gap-2 font-bold py-3 rounded-lg">
          <span className="material-symbols-outlined">call</span> Call
        </a>
        <button onClick={openQuoteModal} className="flex-[2] bg-primary btn-accent-text font-black py-3 rounded-lg text-center flex items-center justify-center">
          Free Quote →
        </button>
      </div>

      {/* ── Quote Modal (Leadder widget) ─────────────────────────────── */}
      <div
        id="quote-modal"
        onClick={(e) => { if (e.target.id === 'quote-modal') closeQuoteModal() }}
        style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999999, alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      >
        <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '720px', height: '92vh', maxHeight: '92vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
            <strong style={{ fontSize: '16px', color: '#111827' }}>Get Your Instant Quote</strong>
            <button onClick={closeQuoteModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', color: '#9ca3af', lineHeight: 1, padding: 0 }}>×</button>
          </div>
          <iframe
            src="https://app.leadder.io/widget/local-growth-studio-demo-00wr48"
            width="100%" height="100%" frameBorder="0"
            style={{ border: 'none', display: 'block', flex: 1, width: '100%', height: '100%' }}
            loading="lazy"
          />
        </div>
      </div>
    </>
  )
}

// ── Data fetching (ISR) ───────────────────────────────────────────────────────
// fallback: 'blocking' → first visit generates the page, all future visits are
// served from Vercel's edge cache. No slug list needed at build time.

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',
  KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',
  MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',
  NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',
  NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
}

// Per-slug hero image overrides (pinned photos).
const HERO_OVERRIDES = {
  'grace-mechanical-services': 'https://images.unsplash.com/photo-1584385971010-71c147ba5dbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  'baker-home-energy':         'https://images.unsplash.com/photo-1622572090318-babb0ca046de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
}

async function unsplashSearch(query, key) {
  const res  = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${key}` } }
  )
  const json = await res.json()
  return json.results?.[0]?.urls?.regular || null
}

export async function getStaticProps({ params }) {
  if (params.slug.includes('.')) return { notFound: true }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: lead, error } = await supabase
    .from('leads')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !lead) {
    console.log(`[${params.slug}] not found:`, error?.message)
    return { notFound: true }
  }

  if (lead.expires_at && new Date(lead.expires_at) < new Date()) {
    console.log(`[${params.slug}] expired`)
    return { notFound: true }
  }

  // Hero: pinned override → city skyline → state fallback → generic HVAC image.
  let heroImage = HERO_OVERRIDES[params.slug] || FALLBACK_HERO
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
  if (!HERO_OVERRIDES[params.slug] && unsplashKey) {
    try {
      const cityName  = cleanCity(lead.city || '')
      const stateCode = (lead.city || '').match(/,\s*([A-Z]{2})$/)?.[1]
      const stateName = stateCode ? STATE_NAMES[stateCode] : null
      heroImage =
        (cityName  && await unsplashSearch(`${cityName} skyline`,  unsplashKey)) ||
        (stateName && await unsplashSearch(`${stateName} skyline`, unsplashKey)) ||
        (stateName && await unsplashSearch(stateName,              unsplashKey)) ||
        FALLBACK_HERO
    } catch (_) {
      // heroImage stays as FALLBACK_HERO
    }
  }

  return { props: { lead, heroImage }, revalidate: 3600 }
}
