import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const {
    name, phone, email, service, message,
    lead_slug, business_name, sms_consent, marketing_consent,
  } = req.body

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  // Columns guaranteed to exist on `quote_requests`.
  const base = {
    name,
    phone,
    email:         email         || null,
    service:       service       || null,
    message:       message       || null,
    lead_slug:     lead_slug     || null,
    business_name: business_name || null,
  }

  try {
    // Try the richer insert first (consent columns may not exist yet).
    const { error } = await supabase.from('quote_requests').insert({
      ...base,
      sms_consent:       sms_consent       ?? null,
      marketing_consent: marketing_consent ?? null,
    })
    // Fall back to guaranteed columns so a missing column never drops a lead.
    if (error) await supabase.from('quote_requests').insert(base)
  } catch (_) {
    // Still return 200 — don't block the thank-you state if the DB isn't ready.
  }

  return res.status(200).json({ ok: true })
}
