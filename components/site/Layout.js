import Head from 'next/head'
import { buildColorCSS } from '../../lib/colors'
import { deriveLead } from '../../lib/lead'
import SiteNav from './SiteNav'
import SiteFooter from './SiteFooter'
import QuoteModal, { openQuoteModal } from './QuoteModal'

// Shared page shell: injects per-lead colours, renders the nav/footer/modal and
// the mobile sticky CTA. Every page passes its unique middle as `children`.
export default function Layout({ lead, title, children }) {
  const d = deriveLead(lead)
  const pageTitle = title
    ? `${title} | ${d.businessName}`
    : `${d.businessName} | ${d.city}'s Trusted HVAC Experts`

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{buildColorCSS(d.primary, d.secondary, d.accent, d.primaryLight, d.textOnPrimary, d.textOnAccent)}</style>
      </Head>

      <span id="top" />
      <SiteNav d={d} />

      <main>{children}</main>

      <SiteFooter d={d} />

      {/* Mobile sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 flex gap-4">
        <a href={d.tel} className="flex-1 bg-slate-100 text-slate-900 flex items-center justify-center gap-2 font-bold py-3 rounded-lg">
          <span className="material-symbols-outlined">call</span> Call
        </a>
        <button onClick={openQuoteModal} className="flex-[2] bg-primary btn-accent-text font-black py-3 rounded-lg text-center flex items-center justify-center">
          Free Quote →
        </button>
      </div>

      <QuoteModal />
    </>
  )
}
