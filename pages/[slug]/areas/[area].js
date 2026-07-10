import { deriveLead, titleCaseSlug } from '../../../lib/lead'
import { getLeadProps } from '../../../lib/getLead'
import { FALLBACK_HERO } from '../../../lib/hvacContent'
import { areaSections } from '../../../lib/pagesContent'
import Layout from '../../../components/site/Layout'
import PageHero from '../../../components/site/PageHero'
import PageBottom from '../../../components/site/PageBottom'

export default function AreaPage({ lead, areaLabel }) {
  const d = deriveLead(lead)
  const sections = areaSections(areaLabel, d.businessName, d.city)

  return (
    <Layout lead={lead} title={`HVAC Services in ${areaLabel}`}>
      <PageHero d={d}
        title={`${areaLabel} HVAC Services`}
        subtitle={`Dependable heating & cooling for ${areaLabel} homeowners.`}
        image={FALLBACK_HERO} />

      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map(({ h, p }) => (
              <div key={h}>
                <h2 className="text-2xl md:text-3xl font-black mb-4">{h}</h2>
                <div className="space-y-4 text-slate-600 leading-relaxed">
                  {p.map((para, i) => <p key={i}>{para}</p>)}
                </div>
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
  const res = await getLeadProps(params.slug)
  if (res.notFound) return res
  return { props: { ...res.props, areaLabel: titleCaseSlug(params.area) }, revalidate: res.revalidate }
}
