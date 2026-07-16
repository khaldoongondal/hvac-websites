import { SITE_ORIGIN } from '../../lib/site'

export default function Robots() { return null }

export async function getServerSideProps({ params, res }) {
  const body =
    `User-agent: *\n` +
    `Allow: /\n` +
    `Sitemap: ${SITE_ORIGIN}/${params.slug}/sitemap.xml\n`
  res.setHeader('Content-Type', 'text/plain')
  res.setHeader('Cache-Control', 'public, max-age=3600')
  res.write(body)
  res.end()
  return { props: {} }
}
