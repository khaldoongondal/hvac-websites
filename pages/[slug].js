import Head from 'next/head'
import { createClient } from '@supabase/supabase-js'

// ── Colour helpers ────────────────────────────────────────────────────────────

function rgba(hex, alpha) {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

// Returns '#111827' (dark text) for light backgrounds, '#ffffff' for dark ones.
// "New York NY" → "New York", "Los Angeles, CA" → "Los Angeles"
function cleanCity(city) {
  if (!city) return city
  return city.replace(/,?\s+[A-Z]{2}$/, '').trim()
}

function contrastText(hex) {
  if (!hex || hex.length < 7) return '#ffffff'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#111827' : '#ffffff'
}

// Generates CSS vars + !important overrides for every Tailwind class used in the template.
// Injected in <Head> — beats whatever Tailwind CDN generates.
function buildColorCSS(primary, secondary, accent, primaryLight, textOnPrimary, textOnAccent) {
  const p  = primary      || '#1b3022'
  const s  = secondary    || '#2d5a3d'
  const a  = accent       || '#c8a328'
  const pl = primaryLight || '#2d5a3d'
  const tp = textOnPrimary || '#ffffff'   // text on primary-bg surfaces (hero, footer)
  const ta = textOnAccent  || '#1a1a1a'  // text on accent-bg surfaces (buttons)

  // Footer bg = primary. Use pre-computed tp for readability.
  const footerMuted  = tp === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(17,24,39,0.55)'
  const footerBorder = tp === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.15)'

  // CTA banner (bg-forest-green = secondary)
  const ctaText  = contrastText(s)
  const ctaMuted = ctaText === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(17,24,39,0.7)'

  return `
    :root {
      --color-primary:         ${p};
      --color-secondary:       ${s};
      --color-accent:          ${a};
      --color-primary-light:   ${pl};
      --color-text-on-primary: ${tp};
      --color-text-on-accent:  ${ta};
    }

    /* Accent = buttons, icons, highlights, borders */
    .text-primary                         { color: ${a} !important; }
    .bg-primary                           { background-color: ${a} !important; }
    .bg-primary\\/90,
    .hover\\:bg-primary\\/90:hover         { background-color: ${rgba(a, 0.9)} !important; }
    .bg-primary\\/10                       { background-color: ${rgba(a, 0.1)} !important; }
    .bg-primary\\/20                       { background-color: ${rgba(a, 0.2)} !important; }
    .border-primary                        { border-color: ${a} !important; }

    /* Section backgrounds */
    .bg-forest-green                       { background-color: ${s} !important; }
    .bg-deep-green                         { background-color: ${p} !important; }

    /* Button text using derived contrast colour */
    .btn-accent-text                       { color: ${ta} !important; }

    /* Footer contrast (bg = primary) */
    footer.bg-deep-green,
    footer.bg-deep-green .text-white       { color: ${tp} !important; }
    footer.bg-deep-green .text-white\\/60,
    footer.bg-deep-green .text-white\\/40  { color: ${footerMuted} !important; }
    footer.bg-deep-green .border-white\\/10{ border-color: ${footerBorder} !important; }
    footer.bg-deep-green .text-primary     { color: ${a} !important; }
    footer.bg-deep-green .hover\\:text-primary:hover { color: ${a} !important; }

    /* CTA banner contrast (bg = secondary) */
    .bg-forest-green .text-white           { color: ${ctaText} !important; }
    .bg-forest-green .text-white\\/80      { color: ${ctaMuted} !important; }
    .bg-forest-green .text-primary         { color: ${a} !important; }
  `.trim()
}

const STARS = [1, 2, 3, 4, 5]
const FALLBACK_HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJYetKR0-DBpixzwcxNUT0bLD7cil2GmuK139iO3HD-W8cJV_Z39j_HFZVRPbh4Xrbas1gO6ohIN2iUX6ElBpVmWtyS-gy3MI1lQO1wcCk-cKmWol9deOz9qqclq1ntN1kfDztBJD4NLG5BomC486ygdnwDtyZPzEX6ubkpxx2bVtE-WVT0YtKup4Q7ZN0M-jnSp23ZL_I3ftHb9Y-M0Rb2zu94u-PwZf01cIcX4zU3YO7IMY_wG_6RdIs0BkAM9oEhLV2jcsBttAZ'

export default function LeadPage({ lead, heroImage }) {
  const phone        = lead.phone         || ''
  const city         = cleanCity(lead.city) || 'Your City'
  const businessName = lead.business_name || 'Local HVAC'
  const primary       = lead.color_primary          || '#1b3022'
  const secondary     = lead.color_secondary         || '#2d5a3d'
  const accent        = lead.color_accent            || '#c8a328'
  const primaryLight  = lead.color_primary_light     || primary
  const textOnPrimary = lead.color_text_on_primary   || '#ffffff'
  const textOnAccent  = lead.color_text_on_accent    || '#1a1a1a'
  const logoUrl       = lead.logo_url?.startsWith('http') ? lead.logo_url : null

  // Hero overlay uses primary (dark base) so text always reads against a dark tint
  const heroGradient = `linear-gradient(to right, ${rgba(primary, 0.9)}, ${rgba(primary, 0.4)})`

  return (
    <>
      <Head>
        <title>{`${businessName} | ${city}'s Trusted HVAC Experts`}</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>{buildColorCSS(primary, secondary, accent, primaryLight, textOnPrimary, textOnAccent)}</style>
      </Head>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            <div className="flex items-center gap-8">
              <a href="#" className="flex items-center gap-3 text-2xl font-black tracking-tighter text-slate-900">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={businessName}
                    className="h-10 w-auto object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block' }}
                  />
                ) : (
                  businessName
                )}
              </a>
              <div className="hidden md:flex items-center gap-6">
                <a href="#"             className="text-sm font-semibold hover:text-primary transition-colors">Home</a>
                <a href="#"             className="text-sm font-semibold hover:text-primary transition-colors">Services</a>
                <a href="#"             className="text-sm font-semibold hover:text-primary transition-colors">Service Areas</a>
                <a href="#quote-section" className="text-sm font-semibold hover:text-primary transition-colors">Contact</a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a href={`tel:${phone}`} className="hidden lg:flex items-center gap-2 text-slate-700 font-bold">
                <span className="material-symbols-outlined text-primary">call</span> {phone}
              </a>
              <a href={`tel:${phone}`} className="bg-primary hover:bg-primary/90 btn-accent-text px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center justify-center">
                Get Your Free Quote
              </a>
              <button className="md:hidden text-slate-900">
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[600px] flex items-center pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Inline gradient — uses actual lead colours, not Tailwind class */}
          <div className="absolute inset-0 z-10" style={{ backgroundImage: heroGradient }} />
          <img
            alt={`${city} Skyline`}
            className="w-full h-full object-cover"
            src={heroImage || FALLBACK_HERO}
          />
        </div>
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6" style={{ color: 'var(--color-text-on-primary)' }}>
              {city}&apos;s Trusted <br /><span className="text-primary">HVAC Experts</span>
            </h1>
            <p className="text-lg md:text-xl mb-10 leading-relaxed" style={{ color: 'var(--color-text-on-primary)', opacity: 0.9 }}>
              Professional heating and cooling solutions for {city} and surrounding areas.
              Reliable, energy-efficient comfort for your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href={`tel:${phone}`} className="bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105 text-center">
                Get Your Free Quote
              </a>
              <a href={`tel:${phone}`} className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/30 px-8 py-4 rounded-lg font-black text-lg transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">call</span> Call {phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ────────────────────────────────────────────────── */}
      <div className="relative z-30 -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-xl shadow-2xl border border-slate-100">
          {[
            { icon: 'verified_user', label: 'Licensed & Insured' },
            { icon: 'bolt',          label: 'Same-Day Service'   },
            { icon: 'star',          label: '5-Star Rated'       },
            { icon: 'payments',      label: 'Upfront Pricing'    },
          ].map(({ icon, label }) => {
            const isRating = icon === 'star'
            return (
              <div key={icon} className="flex flex-col items-center text-center gap-2">
                <span className="material-symbols-outlined text-primary text-4xl">{icon}</span>
                {isRating && lead.rating ? (
                  <>
                    <span className="text-sm font-bold uppercase tracking-wider">{lead.rating} ★</span>
                    {lead.reviews && <span className="text-xs text-slate-500">{lead.reviews} Google Reviews</span>}
                  </>
                ) : (
                  <span className="text-sm font-bold uppercase tracking-wider">{label}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Services ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Complete HVAC Solutions</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'mode_fan',       title: 'Furnace',    desc: 'Expert heating repair and installation for reliable winter warmth.'    },
              { icon: 'ac_unit',        title: 'AC Units',   desc: 'Keep your home cool and dry with our expert AC cooling solutions.'     },
              { icon: 'thermostat',     title: 'Heat Pumps', desc: 'Eco-friendly and efficient hybrid solutions for year-round comfort.'   },
              { icon: 'emergency_home', title: 'Emergency',  desc: '24/7 priority service when you need home repairs most.'               },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="group bg-white p-8 rounded-xl shadow-lg border-t-4 border-primary transition-all hover:-translate-y-2">
                <span className="material-symbols-outlined text-primary text-5xl mb-6">{icon}</span>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">{desc}</p>
                <a href="#" className="text-primary font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Choose Us ────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-lg -z-10" />
                <img
                  alt="Professional HVAC Technician"
                  className="rounded-2xl shadow-2xl border-4 border-white"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxEOaGs0KqQmhLnYjoG0XTMBTdXqn8cWH_RPuss9AAVbxgqdyCls05ViasLji-XUW1ce2w3Y2vYPJB2QlIcTY5hP8fo6-geyPiRJe7ByYsPmYp2GmFII94XTd_7TALAMnmUU4mqsfqIBKLE1ehpJqlmHoiyLuSy4mEREBcgayshy711nDKuC1Pu0YLRwlhFKX5yHTLDqrXvCDZ7NsuNi2ho0bzjuWTd50uMYUchGkDNT984aX9RDuTBHrji8qHI7wTseXc_TG9fIXC"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight">
                Why {city} Homeowners Trust {businessName}
              </h2>
              <ul className="space-y-6">
                {[
                  { title: 'Licensed & Bonded Technicians',  body: 'Our team consists of fully certified HVAC professionals only.'  },
                  { title: 'Transparent Flat-Rate Pricing',  body: 'No hidden fees or surprise charges. You know the cost upfront.' },
                  { title: '100% Satisfaction Guarantee',    body: "If you're not happy with our service, we'll make it right."     },
                ].map(({ title, body }) => (
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

      {/* ── Quote Section ────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 scroll-mt-20" id="quote-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Get Your Free HVAC Quote</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Ready to get started? Call us now for a free, no-obligation quote.
            </p>
            <div className="h-1.5 w-24 bg-primary mx-auto mt-6 rounded-full" />
          </div>
          <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center">
            <span className="material-symbols-outlined text-primary text-6xl mb-4 block">call</span>
            <h3 className="text-2xl font-black mb-3">Call Us Today</h3>
            <p className="text-slate-600 mb-8">
              Our HVAC experts in {city} are ready to help you find the best solution for your home.
            </p>
            <a href={`tel:${phone}`} className="bg-primary hover:bg-primary/90 btn-accent-text px-10 py-5 rounded-lg font-black text-2xl transition-transform hover:scale-105 inline-block">
              {phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">What Our Clients Say</h2>
            <div className="h-1.5 w-24 bg-primary mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { quote: 'Fast response time! Our furnace quit in the middle of a cold snap, and they had it running in hours.',      author: 'Sarah M.'         },
              { quote: 'Professional, clean, and honest. The installation of our new AC was seamless. Highly recommend!',          author: 'David & Linda K.' },
              { quote: "The most transparent pricing I've encountered. No pushy sales, just expert advice and great work.",        author: 'Michael T.'       },
            ].map(({ quote, author }) => (
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

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-forest-green rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-6">Ready for Reliable Home Comfort?</h2>
              <p className="text-xl mb-10 text-white/80 max-w-2xl mx-auto">
                Get your free, no-obligation quote today. Our {city} HVAC experts are standing by.
              </p>
              <a href={`tel:${phone}`} className="bg-primary hover:bg-primary/90 btn-accent-text px-10 py-4 rounded-lg font-black text-xl transition-transform hover:scale-105 inline-block">
                Call {phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="bg-deep-green text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <h3 className="text-2xl font-black tracking-tighter mb-6">{businessName}</h3>
              <p className="text-white/60 leading-relaxed">
                Dedicated to keeping {city} comfortable with expert HVAC services. Licensed, insured, and locally operated.
              </p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Company</h4>
              <ul className="space-y-4 text-white/60">
                {['About Us', 'Our Team', 'Testimonials', 'Emergency Service'].map(item => (
                  <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-lg mb-6">Services</h4>
              <ul className="space-y-4 text-white/60">
                {['Furnace Installation', 'AC Repair', 'Heat Pump Service', 'Air Purification'].map(item => (
                  <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
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
                  <a href={`tel:${phone}`} className="hover:text-primary transition-colors">{phone}</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">schedule</span> 24/7 Emergency Support
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm space-y-2">
            <p>© {new Date().getFullYear()} {businessName}. All rights reserved.</p>
            <p>
              Preview by{' '}
              <a href="https://localgrowthstudio.com" className="underline hover:text-white transition-colors">
                Local Growth Studio
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ── Mobile CTA ───────────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 flex gap-4">
        <a href={`tel:${phone}`} className="flex-1 bg-slate-100 text-slate-900 flex items-center justify-center gap-2 font-bold py-3 rounded-lg">
          <span className="material-symbols-outlined">call</span> Call
        </a>
        <a href={`tel:${phone}`} className="flex-[2] bg-primary btn-accent-text font-black py-3 rounded-lg text-center flex items-center justify-center">
          Free Quote
        </a>
      </div>
    </>
  )
}

// ── Data fetching (ISR) ───────────────────────────────────────────────────────
// fallback: 'blocking' → first visit generates the page, all future visits
// are served from Vercel's edge cache (instant). No slug list needed at build time.

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
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

  console.log(`[${params.slug}] colors: primary=${lead.color_primary} secondary=${lead.color_secondary} accent=${lead.color_accent} logo=${lead.logo_url}`)

  // Fetch city skyline from Unsplash; fall back to hardcoded Toronto image on any error
  let heroImage = FALLBACK_HERO
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY
  if (unsplashKey) {
    try {
      const query = encodeURIComponent(`${cleanCity(lead.city || '')} skyline`)
      const res   = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${unsplashKey}` } }
      )
      const json = await res.json()
      if (json.results?.[0]?.urls?.regular) heroImage = json.results[0].urls.regular
    } catch (_) {
      // heroImage stays as FALLBACK_HERO
    }
  }

  return {
    props: { lead, heroImage },
    revalidate: 3600,
  }
}
