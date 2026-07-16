import { useEffect, useRef, useState } from 'react'
import { rgba } from '../../lib/colors'
import { strongLocations } from '../../lib/lead'
import { categoriesWithServices } from '../../lib/categories'
import { openQuoteModal } from './QuoteModal'

const STARS = '★★★★★'

// Desktop hover/click dropdown. `items` are { label, href, lead? } — an optional
// leading "All …" hub link followed by the category's services.
function NavDropdown({ label, items, openKey, openState, setOpen }) {
  const ref = useRef(null)
  const isOpen = openState === openKey
  const id = `menu-${openKey}`

  useEffect(() => {
    if (!isOpen) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [isOpen, setOpen])

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(openKey)} onMouseLeave={() => setOpen(null)}>
      <button type="button" aria-haspopup="menu" aria-expanded={isOpen} aria-controls={id}
        onClick={() => setOpen(isOpen ? null : openKey)}
        className="flex items-center gap-1 text-sm font-bold uppercase tracking-wide text-slate-700 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1 py-2">
        {label}
        <span className={`material-symbols-outlined text-lg transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">expand_more</span>
      </button>
      {isOpen && (
        <div id={id} role="menu" className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-72 z-50">
          <ul className="bg-white rounded-xl shadow-2xl border border-slate-100 py-2 max-h-[70vh] overflow-auto">
            {items.map(({ label: l, href, lead }) => (
              <li key={href} role="none">
                <a role="menuitem" href={href}
                  className={`block px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 hover:text-primary focus-visible:outline-none focus-visible:bg-slate-50 ${lead ? 'font-black text-primary border-b border-slate-100' : 'font-semibold text-slate-700'}`}>
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function MobileAccordion({ label, items, open, onToggle }) {
  return (
    <div className="border-b border-slate-100">
      <button type="button" aria-expanded={open} onClick={onToggle}
        className="w-full flex items-center justify-between py-3 font-bold text-slate-800">
        {label}
        <span className={`material-symbols-outlined transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true">expand_more</span>
      </button>
      {open && (
        <ul className="pb-2">
          {items.map(({ label: l, href, lead }) => (
            <li key={href}><a href={href} className={`block py-2 pl-4 text-sm hover:text-primary ${lead ? 'font-bold text-primary' : 'text-slate-600'}`}>{l}</a></li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function SiteNav({ d, lead }) {
  const base = `/${d.slug}`
  const cats = categoriesWithServices(lead)
  const locations = strongLocations(lead)
  const [openDrop, setOpenDrop] = useState(null)
  const [drawer, setDrawer] = useState(false)
  const [acc, setAcc] = useState(null)

  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; return () => { document.body.style.overflow = '' } }, [drawer])

  // Build dropdown item lists: leading hub link + services / areas.
  const catItems = (c) => [
    { label: `All ${c.label} →`, href: `${base}/${c.slug}`, lead: true },
    ...c.services.map(s => ({ label: s.name, href: `${base}/services/${s.slug}` })),
  ]
  const areaItems = locations.map(a => ({ label: a.name, href: `${base}/areas/${a.slug}` }))

  return (
    <header>
      {/* 1 — utility top bar */}
      <div className="text-xs sm:text-sm" style={{ backgroundColor: d.primary, color: d.textOnPrimary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {d.rating && (
              <>
                <span className="text-primary" aria-hidden="true">{STARS}</span>
                <span className="font-semibold">{d.rating} Rated</span>
                {d.reviews ? <span className="opacity-70 hidden sm:inline">• {d.reviews} Reviews</span> : null}
              </>
            )}
          </div>
          <div className="hidden md:flex items-center gap-1.5 opacity-90">
            <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">schedule</span>
            <span className="font-semibold">24/7 Emergency Service</span>
          </div>
          <a href={d.tel} className="flex items-center gap-1.5 font-semibold hover:opacity-80">
            <span className="material-symbols-outlined text-primary text-base" aria-hidden="true">call</span>
            <span>{d.phone}</span>
          </a>
        </div>
      </div>

      {/* 2 — main header (white) */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <a href={base} className="flex items-center gap-3 shrink-0">
            {d.logoUrl ? (
              <>
                <img src={d.logoUrl} alt={d.businessName} className="h-12 w-auto object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'inline' }} />
                <span style={{ display: 'none' }} className="text-xl font-black tracking-tight text-slate-900">{d.businessName}</span>
              </>
            ) : <span className="text-xl font-black tracking-tight text-slate-900">{d.businessName}</span>}
          </a>
          <div className="flex items-center gap-3 shrink-0">
            <a href={d.tel} className="hidden lg:flex items-center gap-2 text-slate-800 font-bold">
              <span className="material-symbols-outlined text-primary" aria-hidden="true">call</span> {d.phone}
            </a>
            <button onClick={openQuoteModal}
              className="bg-primary hover:bg-primary/90 btn-accent-text px-5 py-2.5 rounded-lg font-bold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Get a Free Quote
            </button>
            <button onClick={() => setDrawer(true)} aria-label="Open menu" aria-expanded={drawer}
              className="lg:hidden text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
              <span className="material-symbols-outlined text-3xl" aria-hidden="true">menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 — sticky nav bar (light) */}
      <div className="sticky top-0 z-40 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex items-center justify-center gap-7 h-12">
            <a href={base} className="text-sm font-bold uppercase tracking-wide text-slate-700 hover:text-primary transition-colors">Home</a>
            {cats.map(c => (
              <NavDropdown key={c.key} label={c.navLabel} items={catItems(c)} openKey={c.key} openState={openDrop} setOpen={setOpenDrop} />
            ))}
            {areaItems.length > 0 && (
              <NavDropdown label="Service Areas" items={areaItems} openKey="areas" openState={openDrop} setOpen={setOpenDrop} />
            )}
            <a href={`${base}#about`} className="text-sm font-bold uppercase tracking-wide text-slate-700 hover:text-primary transition-colors">About</a>
            <a href={`${base}/contact`} className="text-sm font-bold uppercase tracking-wide text-slate-700 hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawer && (
        <div className="lg:hidden fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-black text-slate-900">{d.businessName}</span>
              <button onClick={() => setDrawer(false)} aria-label="Close menu"
                className="text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                <span className="material-symbols-outlined text-3xl" aria-hidden="true">close</span>
              </button>
            </div>
            <nav className="flex flex-col">
              <a href={base} className="py-3 font-bold text-slate-800 border-b border-slate-100">Home</a>
              {cats.map(c => (
                <MobileAccordion key={c.key} label={c.navLabel} items={catItems(c)} open={acc === c.key} onToggle={() => setAcc(acc === c.key ? null : c.key)} />
              ))}
              {areaItems.length > 0 && (
                <MobileAccordion label="Service Areas" items={areaItems} open={acc === 'areas'} onToggle={() => setAcc(acc === 'areas' ? null : 'areas')} />
              )}
              <a href={`${base}#about`} className="py-3 font-bold text-slate-800 border-b border-slate-100">About</a>
              <a href={`${base}/contact`} className="py-3 font-bold text-slate-800 border-b border-slate-100">Contact</a>
            </nav>
            <div className="mt-6 space-y-3">
              <button onClick={() => { setDrawer(false); openQuoteModal() }} className="w-full bg-primary btn-accent-text font-black py-3 rounded-lg">Get a Free Quote</button>
              <a href={d.tel} className="w-full flex items-center justify-center gap-2 border border-slate-300 text-slate-800 font-bold py-3 rounded-lg">
                <span className="material-symbols-outlined" aria-hidden="true">call</span> {d.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
