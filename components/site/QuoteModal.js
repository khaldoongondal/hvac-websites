// Leadder quote-modal iframe + open/close helpers. Any button on any page can
// call openQuoteModal() to pop the widget. Toggled via DOM id so it works
// without threading state through every component.

export function openQuoteModal() {
  const m = document.getElementById('quote-modal')
  if (m) m.style.display = 'flex'
}

export function closeQuoteModal() {
  const m = document.getElementById('quote-modal')
  if (m) m.style.display = 'none'
}

export default function QuoteModal() {
  return (
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
  )
}
