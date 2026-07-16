import { getLeadProps } from '../../lib/getLead'
import { sitePages } from '../../lib/pages'
import { SITE_ORIGIN } from '../../lib/site'

export default function Sitemap() { return null }

export async function getServerSideProps({ params, res }) {
  const r = await getLeadProps(params.slug)
  if (r.notFound) { res.statusCode = 404; res.setHeader('Content-Type', 'text/plain'); res.end('Not found'); return { props: {} } }

  const { pages } = sitePages(r.props.lead)
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map(p => `  <url><loc>${SITE_ORIGIN}${p.path}</loc></url>`).join('\n') +
    `\n</urlset>\n`

  res.setHeader('Content-Type', 'application/xml')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.write(xml)
  res.end()
  return { props: {} }
}
