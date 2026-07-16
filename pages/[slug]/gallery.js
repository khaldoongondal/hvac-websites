import { deriveLead } from '../../lib/lead'
import { getLeadProps } from '../../lib/getLead'
import { GALLERY, FALLBACK_HERO } from '../../lib/hvacContent'
import { SERVICE_DETAILS, SERVICE_ORDER } from '../../lib/pagesContent'
import { SITE_ORIGIN } from '../../lib/site'
import Layout from '../../components/site/Layout'
import PageHero from '../../components/site/PageHero'
import PageBottom from '../../components/site/PageBottom'

// Combine the base gallery with every service image for a fuller grid.
const ALL_PHOTOS = [
  ...GALLERY,
  ...SERVICE_ORDER.map(slug => SERVICE_DETAILS[slug].img),
  ...SERVICE_ORDER.flatMap(slug => SERVICE_DETAILS[slug].gallery),
]
// De-dupe while preserving order.
const PHOTOS = [...new Set(ALL_PHOTOS)]

export default function GalleryPage({ lead }) {
  const d = deriveLead(lead)
  return (
    <Layout lead={lead} title="Gallery"
      description={`Photo gallery of recent HVAC work by ${d.businessName} in ${d.city} and surrounding areas.`}
      canonical={`${SITE_ORIGIN}/${d.slug}/gallery`}>
      <PageHero d={d} title="Our Work" subtitle="See for yourself why our customers love us." image={FALLBACK_HERO} />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PHOTOS.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl shadow-md group">
                <img src={src} alt={`${d.businessName} project ${i + 1}`} width={600} height={600} loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageBottom d={d} lead={lead} />
    </Layout>
  )
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  return await getLeadProps(params.slug)
}
