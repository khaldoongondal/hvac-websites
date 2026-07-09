import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, phone, email, service, message, lead_slug, business_name } = req.body

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
    await supabase.from('quote_requests').insert({
      name,
      phone,
      email:         email         || null,
      service:       service       || null,
      message:       message       || null,
      lead_slug:     lead_slug     || null,
      business_name: business_name || null,
    })
  } catch (_) {
    // Still return 200 — don't block the thank-you state if DB isn't ready
  }

  return res.status(200).json({ ok: true })
}
