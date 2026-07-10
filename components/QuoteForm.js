import { useState } from 'react'

// Native "Get a Free Quote" lead form. Mirrors the fields used across the
// canonical GoHighLevel service sites (name, phone, short message + SMS/
// marketing consent). Posts to /api/quote which writes the Supabase
// `quote_requests` table. Degrades gracefully — a DB hiccup still shows the
// thank-you state so the visitor is never left hanging.

const INITIAL = { name: '', phone: '', message: '', smsConsent: false, marketingConsent: false }

const FIELD =
  'w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-900 ' +
  'focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition'

export default function QuoteForm({ leadSlug, businessName, heading = 'Get a Free Quote' }) {
  const [form, setForm]     = useState(INITIAL)
  const [status, setStatus] = useState('idle') // idle | submitting | done | error

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'submitting') return
    setStatus('submitting')

    try {
      const res = await fetch('/api/quote', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:              form.name,
          phone:             form.phone,
          message:           form.message,
          sms_consent:       form.smsConsent,
          marketing_consent: form.marketingConsent,
          lead_slug:         leadSlug,
          business_name:     businessName,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('done')
      setForm(INITIAL)
    } catch (_) {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-10 text-center">
        <span className="material-symbols-outlined text-primary text-6xl mb-4 block">check_circle</span>
        <h3 className="text-2xl font-black mb-2 text-slate-900">Thank You!</h3>
        <p className="text-slate-600">We&apos;ve received your request and will reach out shortly.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8">
      <h3 className="text-3xl font-black mb-6 text-center text-slate-900">{heading}</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Full Name *</label>
          <input type="text" required placeholder="John Smith" className={FIELD}
            value={form.name} onChange={e => update('name', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Phone *</label>
          <input type="tel" required placeholder="Example: (555) 555-1234" className={FIELD}
            value={form.phone} onChange={e => update('phone', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Short message about your needs *</label>
          <textarea required rows={3} placeholder="Your message goes straight to us — we'll get back to you as soon as we can."
            className={`${FIELD} resize-none`}
            value={form.message} onChange={e => update('message', e.target.value)} />
        </div>

        <label className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
          <input type="checkbox" required className="mt-0.5"
            checked={form.smsConsent} onChange={e => update('smsConsent', e.target.checked)} />
          <span>I consent to receive SMS notifications and alerts. Message frequency varies; message &amp; data rates may apply. Reply STOP to unsubscribe at any time.</span>
        </label>
        <label className="flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
          <input type="checkbox" className="mt-0.5"
            checked={form.marketingConsent} onChange={e => update('marketingConsent', e.target.checked)} />
          <span>I agree to receive occasional marketing messages. I can opt out at any time.</span>
        </label>

        <button type="submit" disabled={status === 'submitting'}
          className="w-full bg-primary hover:bg-primary/90 btn-accent-text font-black py-4 rounded-lg text-lg transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100">
          {status === 'submitting' ? 'Sending…' : 'SUBMIT'}
        </button>

        {status === 'error' && (
          <p className="text-sm text-red-600 text-center">Something went wrong. Please call us instead.</p>
        )}
      </div>
    </form>
  )
}
