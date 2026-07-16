import { useEffect } from 'react'

// Per-client instant-quote behaviour. A module singleton lets any button on the
// page call openQuoteModal() without threading props through every component.
let _cfg = { enabled: true, src: '' }

const ALLOWED_HOST = 'https://app.leadder.io/'
const safeSrc = (src) => (typeof src === 'string' && src.startsWith(ALLOWED_HOST) ? src : '')

export function openQuoteModal() {
  if (!_cfg.enabled) {
    // Disabled → scroll to the on-page hero lead form instead of a modal.
    const q = document.getElementById('quote')
    if (q) q.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  const m = document.getElementById('quote-modal')
  if (m) { m.style.display = 'flex'; document.body.style.overflow = 'hidden' }
}

export function closeQuoteModal() {
  const m = document.getElementById('quote-modal')
  if (m) { m.style.display = 'none'; document.body.style.overflow = '' }
}

export default function QuoteModal({ enabled = true, src }) {
  const iframeSrc = safeSrc(src)

  useEffect(() => {
    _cfg = { enabled: enabled && !!iframeSrc, src: iframeSrc }
    const onKey = (e) => { if (e.key === 'Escape') closeQuoteModal() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, iframeSrc])

  if (!enabled || !iframeSrc) return null

  return (
    <div
      id="quote-modal"
      role="dialog" aria-modal="true" aria-label="Get a free quote"
      onClick={(e) => { if (e.target.id === 'quote-modal') closeQuoteModal() }}
      style={{ display: 'none', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 999999, alignItems: 'center', justifyContent: 'center', padding: '16px' }}
    >
      <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '720px', height: '92vh', maxHeight: '92vh', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.35)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          <strong style={{ fontSize: '16px', color: '#111827' }}>Get Your Instant Quote</strong>
          <button onClick={closeQuoteModal} aria-label="Close quote form"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '28px', color: '#9ca3af', lineHeight: 1, padding: 0 }}>×</button>
        </div>
        <iframe
          title="Instant quote form" src={iframeSrc}
          width="100%" height="700" frameBorder="0"
          style={{ border: 'none', display: 'block', flex: 1, width: '100%', height: '100%' }}
          loading="lazy"
        />
      </div>
    </div>
  )
}
