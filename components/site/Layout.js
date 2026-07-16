import Head from 'next/head'
import { buildColorCSS } from '../../lib/colors'
import { deriveLead, quoteConfig } from '../../lib/lead'
import SiteNav from './SiteNav'
import SiteFooter from './SiteFooter'
import QuoteModal, { openQuoteModal } from './QuoteModal'

// Shared page shell: injects per-lead colours, renders nav/footer/modal + mobile
// sticky CTA. Pages pass their unique middle as `children`, plus optional <head>
// extras (canonical, meta description, JSON-LD) via `head`.
export default function Layout({ lead, title, description, canonical, head, children }) {
  const d = deriveLead(lead)
  const q = quoteConfig(lead)
  const pageTitle = title
    ? `${title} | ${d.businessName}`
    : `${d.businessName} | ${d.city} HVAC Repair, Installation & Maintenance`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {canonical && <link rel="canonical" href={canonical} />}
        <style>{buildColorCSS(d.primary, d.secondary, d.accent, d.primaryLight, d.textOnPrimary, d.textOnAccent)}</style>
        {head}
      </Head>

      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:top-2 focus:left-2 focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg">
        Skip to content
      </a>

      <span id="top" />
      <SiteNav d={d} lead={lead} />

      <main id="main">{children}</main>

      <SiteFooter d={d} lead={lead} />

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 flex gap-4">
        <a href={d.tel} className="flex-1 bg-slate-100 text-slate-900 flex items-center justify-center gap-2 font-bold py-3 rounded-lg">
          <span className="material-symbols-outlined" aria-hidden="true">call</span> Call
        </a>
        <button onClick={openQuoteModal} className="flex-[2] bg-primary btn-accent-text font-black py-3 rounded-lg text-center flex items-center justify-center">
          Free Quote →
        </button>
      </div>

      <QuoteModal enabled={q.enabled} src={q.src} />
    </>
  )
}
