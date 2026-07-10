import { rgba } from '../../lib/colors'
import { openQuoteModal } from './QuoteModal'

// Sticky dark nav shared by every page. Links are absolute to the client's own
// pages so they work from any depth.
export default function SiteNav({ d }) {
  const base = `/${d.slug}`
  const links = [
    { href: base,               label: 'Home'         },
    { href: `${base}#services`,  label: 'Services'     },
    { href: `${base}/gallery`,   label: 'Gallery'      },
    { href: `${base}#areas`,     label: 'Service Areas' },
    { href: `${base}/blog`,      label: 'Blog'         },
    { href: `${base}/contact`,   label: 'Contact'      },
  ]
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b"
      style={{ backgroundColor: rgba(d.primary, 0.96), borderColor: rgba(d.textOnPrimary, 0.12) }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          <a href={base} className="flex items-center gap-3 text-xl font-black tracking-tighter shrink-0" style={{ color: d.textOnPrimary }}>
            {d.logoUrl ? (
              <>
                <img src={d.logoUrl} alt={d.businessName} className="h-12 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline' }} />
                <span style={{ display: 'none' }}>{d.businessName}</span>
              </>
            ) : d.businessName}
          </a>

          <div className="hidden lg:flex items-center gap-7">
            {links.map(({ href, label }) => (
              <a key={label} href={href} className="text-sm font-bold uppercase tracking-wide transition-colors hover:text-primary" style={{ color: d.textOnPrimary }}>
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button onClick={openQuoteModal} className="hidden sm:inline-block bg-primary hover:bg-primary/90 btn-accent-text px-5 py-2.5 rounded-lg font-bold text-sm transition-all">
              Get a Free Quote
            </button>
            <a href={d.tel} className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-sm border transition-colors hover:bg-primary hover:btn-accent-text"
              style={{ color: d.textOnPrimary, borderColor: rgba(d.textOnPrimary, 0.3) }}>
              <span className="material-symbols-outlined text-primary text-lg">call</span>
              <span className="hidden md:inline">{d.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
