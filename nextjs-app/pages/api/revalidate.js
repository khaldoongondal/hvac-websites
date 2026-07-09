// On-demand ISR revalidation endpoint.
//
// Usage:
//   POST /api/revalidate
//   Body: { "slug": "five-star-cooling", "secret": "YOUR_SECRET" }
//
// Or GET:
//   /api/revalidate?slug=five-star-cooling&secret=YOUR_SECRET
//
// Returns: { revalidated: true, slug: "..." }

export default async function handler(req, res) {
  const secret = req.method === 'POST'
    ? req.body?.secret
    : req.query.secret

  const slug = req.method === 'POST'
    ? req.body?.slug
    : req.query.slug

  if (secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ error: 'Invalid secret' })
  }

  if (!slug) {
    return res.status(400).json({ error: 'Missing slug' })
  }

  try {
    await res.revalidate(`/${slug}`)
    return res.json({ revalidated: true, slug })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
