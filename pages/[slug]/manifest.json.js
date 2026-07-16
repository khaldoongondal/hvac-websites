import { getLeadProps } from '../../lib/getLead'
import { sitePages } from '../../lib/pages'
import { SITE_ORIGIN } from '../../lib/site'

// Per-client page manifest for the VA: page name, URL, type, HTML filename,
// SEO title, meta description.
export default function Manifest() { return null }

export async function getServerSideProps({ params, res }) {
  const r = await getLeadProps(params.slug)
  if (r.notFound) { res.statusCode = 404; res.setHeader('Content-Type', 'application/json'); res.end('{"error":"not found"}'); return { props: {} } }

  const { d, pages } = sitePages(r.props.lead)
  const manifest = {
    business: d.businessName,
    slug: d.slug,
    origin: SITE_ORIGIN,
    page_count: pages.length,
    pages: pages.map(p => ({
      page: p.name,
      url: `${SITE_ORIGIN}${p.path}`,
      type: p.type,
      html_filename: p.file,
      seo_title: p.title,
      meta_description: p.description,
    })),
  }

  res.setHeader('Content-Type', 'application/json')
  res.write(JSON.stringify(manifest, null, 2))
  res.end()
  return { props: {} }
}
