import Head from 'next/head'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { rgba, cleanCity, buildColorCSS } from '../lib/colors'
import QuoteForm from '../components/QuoteForm'
import {
  TRUST_BADGES, SERVICES, PROCESS_STEPS, WHY_US,
  FAQS, TESTIMONIALS, GALLERY, FALLBACK_HERO,
} from '../lib/hvacContent'

const STARS = [1, 2, 3, 4, 5]

const NAV_LINKS = [
  { href: '#services', label: 'Services'      },
  { href: '#gallery',  label: 'Gallery'       },
  { href: '#areas',    label: 'Service Areas' },
  { href: '#quote',    label: 'Contact'       },
]

export default function LeadPage({ lead, heroImage }) {
  const [openFaq, setOpenFaq] = useState(0)

  const phone         = lead.phone            || ''
  const city          = cleanCity(lead.city)  || 'Your City'
  const businessName  = lead.business_name    || 'Local HVAC'
  const primary       = lead.color_primary          || '#1b3022'
  const secondary     = lead.color_secondary        || '#2d5a3d'
  const accent        = lead.color_accent           || '#c8a328'
  const primaryLight  = lead.color_primary_light    || primary
  const textOnPrimary = lead.color_text_on_primary  || '#ffffff'
  const textOnAccent  = lead.color_text_on_accent   || '#1a1a1a'
  const logoUrl       = lead.logo_url?.startsWith('http') ? lead.logo_url : null

  function openQuoteModal() {
    const m = document.getElementById('quote-modal')
    if (m) m.style.display = 'flex'
  }
  function closeQuoteModal() {
    const m = document.getElementById('quote-modal')
    if (m) m.style.display = 'none'
  }

  // Hero overlay uses primary (dark base) so text always reads against a dark tint.
  const heroGradient = `linear-gradient(to right, ${rgba(primary, 0.92)}, ${rgba(primary, 0.55)})`

  return (
    <>
      <Head>
        <title>{`${businessName} | ${city}'s Trusted HVAC Experts`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{buildColorCSS(primary, secondary, accent, primaryLight, textOnPrimary, textOnAccent)}</style>
      </Head>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <a href="#" className="flex items-center gap-3 text-2xl font-black tracking-tighter text-slate-900">
              {logoUrl ? (
                <>
                  <img
                    src={logoUrl} alt={businessName}
                    className="h-14 w-auto object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline' }}
                  />
                  <span style={{ display: 'none' }}>{businessName}</span>
                </>
              ) : businessName}
            </a>

            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map(({ href, label }) => (
                <a key={href} href={href} className="text-slate-700 font-semibold hover:text-primary transition-colors">{label}</a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <a href={`tel:${phone}`} className="hidden md:flex items-center gap-2 text-slate-700 font-bold">
                <span className="material-symbols-outlined text-primary">call</span> {phone}
              </a>
              <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-6 py-2.5 rounded-lg font-bold text-sm transition-all">
                Get a Free Quote →
              </button>
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
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6" style={{ color: 'var(--color-text-on-primary)' }}>
                {city}&apos;s Trusted <span className="text-primary">HVAC Experts</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: 'var(--color-text-on-primary)', opacity: 0.9 }}>
                Professional heating and cooling for {city} and surrounding areas.
                Reliable, energy-efficient comfort — done right the first time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href={`tel:${phone}`} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/30 px-8 py-4 rounded-lg font-black text-lg transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">call</span> Call {phone}
                </a>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {TRUST_BADGES.map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2" style={{ color: 'var(--color-text-on-primary)' }}>
                    <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
                    <span className="text-sm font-bold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div id="quote" className="scroll-mt-24">
              <QuoteForm leadSlug={lead.slug} businessName={businessName} variant="card" />
            </div>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-6">About {businessName}</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-lg text-slate-600 leading-relaxed">
            {businessName} is a locally owned and operated HVAC company proudly serving {city} and the surrounding
            communities. From emergency repairs to full system installations, our licensed technicians deliver honest
            pricing, quality workmanship, and comfort you can count on — every season, every time.
          </p>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────── */}
      <section id="services" className="py-24 scroll-mt-20" style={{ backgroundColor: 'var(--color-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--color-text-on-primary)' }}>Complete HVAC Solutions</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map(({ icon, title, desc }) => (
              <div key={title} className="group bg-white p-8 rounded-xl shadow-lg border-t-4 border-primary transition-all hover:-translate-y-2">
                <span className="material-symbols-outlined text-primary text-5xl mb-6">{icon}</span>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Simple Process</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Getting comfortable again takes just a few simple steps.</p>
            <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {PROCESS_STEPS.map(({ icon, title, desc }, i) => (
              <div key={title} className="text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-5">
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

      {/* ── Gallery ──────────────────────────────────────────────────── */}
      <section id="gallery" className="py-24 bg-slate-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Our Recent Work</h2>
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

      {/* ── Why choose us ────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-lg -z-10" />
                <img alt="Professional HVAC technician" width={800} height={600} loading="lazy"
                  className="rounded-2xl shadow-2xl border-4 border-white w-full object-cover"
                  src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800" />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
                Why {city} Homeowners Trust {businessName}
              </h2>
              <ul className="space-y-6">
                {WHY_US.map(({ title, body }) => (
                  <li key={title} className="flex gap-4">
                    <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full h-fit">check</span>
                    <div>
                      <h4 className="font-bold text-lg">{title}</h4>
                      <p className="text-slate-600">{body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">See Why Our Customers Love Us</h2>
            {lead.rating && (
              <p className="text-slate-600 mt-2">
                <span className="font-bold">{lead.rating} ★</span>{lead.reviews ? ` · ${lead.reviews} Google Reviews` : ''}
              </p>
            )}
            <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map(({ quote, author }) => (
              <div key={author} className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex text-primary mb-4">
                  {STARS.map(i => <span key={i} className="material-symbols-outlined">star</span>)}
                </div>
                <p className="text-slate-600 italic mb-6 leading-relaxed">&ldquo;{quote}&rdquo;</p>
                <p className="font-bold">— {author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Frequently Asked Questions</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }, i) => {
              const isOpen = openFaq === i
              return (
                <div key={q} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left font-bold text-lg"
                  >
                    {q}
                    <span className={`material-symbols-outlined text-primary transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {isOpen && <p className="px-6 pb-6 -mt-2 text-slate-600 leading-relaxed">{a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Service areas ────────────────────────────────────────────── */}
      <section id="areas" className="py-20 scroll-mt-20" style={{ backgroundColor: 'var(--color-secondary)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4" style={{ color: 'var(--color-text-on-primary)' }}>Areas We Serve</h2>
          <div className="h-1.5 w-24 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-lg leading-relaxed" style={{ color: 'var(--color-text-on-primary)', opacity: 0.9 }}>
            Proudly serving <span className="font-black text-primary">{city}</span> and all surrounding communities.
            Not sure if we cover your neighborhood? Give us a call — we&apos;re happy to help.
          </p>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-forest-green rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-6">Ready for Reliable Home Comfort?</h2>
              <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto">
                Get your free, no-obligation quote today. Our {city} HVAC experts are standing by.
              </p>
              <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-10 py-4 rounded-lg font-black text-xl transition-transform hover:scale-105 inline-block">
                Get a Free Quote →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-deep-green text-white py-20 pb-28 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-black tracking-tighter mb-6">{businessName}</h3>
              <p className="text-white/60 leading-relaxed">
                Keeping {city} comfortable with expert HVAC services. Licensed, insured, and locally operated.
              </p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Contact</h4>
              <ul className="space-y-4 text-white/60">
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">location_on</span> {lead.address || city}
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">call</span>
                  <a href={`tel:${phone}`} className="hover:text-primary transition-colors">{phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">schedule</span> 24/7 Emergency Support
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Hours</h4>
              <ul className="space-y-2 text-white/60">
                <li>Mon–Fri: 8:00am – 8:00pm</li>
                <li>Sat: 9:00am – 5:00pm</li>
                <li>Sun: Emergency only</li>
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
        <a href={`tel:${phone}`} className="flex-1 bg-slate-100 text-slate-900 flex items-center justify-center gap-2 font-bold py-3 rounded-lg">
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
            width="100%"
            height="100%"
            frameBorder="0"
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
