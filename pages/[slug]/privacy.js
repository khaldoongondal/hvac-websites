import { deriveLead } from '../../lib/lead'
import { getLeadProps } from '../../lib/getLead'
import { privacyContent } from '../../lib/pagesContent'
import { SITE_ORIGIN } from '../../lib/site'
import Layout from '../../components/site/Layout'
import PageHero from '../../components/site/PageHero'

export default function PrivacyPage({ lead }) {
  const d = deriveLead(lead)
  const sections = privacyContent(d.businessName)

  return (
    <Layout lead={lead} title="Privacy Policy"
      description={`Privacy policy for ${d.businessName}.`}
      canonical={`${SITE_ORIGIN}/${d.slug}/privacy`}>
      <PageHero d={d} title="Privacy Policy" subtitle={`How ${d.businessName} handles your information.`} />
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {sections.map(({ h, p }) => (
            <div key={h}>
              <h2 className="text-2xl font-black mb-3">{h}</h2>
              <div className="space-y-3 text-slate-600 leading-relaxed">
                {p.map((para, i) => <p key={i}>{para}</p>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  )
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  return await getLeadProps(params.slug)
}
