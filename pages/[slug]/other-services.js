import CategoryHub from '../../components/site/CategoryHub'
import { getLeadProps } from '../../lib/getLead'
import { categoryServices } from '../../lib/categories'

export default function OtherServicesPage({ lead }) {
  return <CategoryHub lead={lead} slug="other-services" />
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const res = await getLeadProps(params.slug)
  if (res.notFound) return res
  if (!categoryServices(res.props.lead, 'other-services')) return { notFound: true, revalidate: 300 }
  return res
}
