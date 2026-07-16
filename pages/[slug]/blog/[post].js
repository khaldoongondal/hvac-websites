import { deriveLead } from '../../../lib/lead'
import { getLeadProps } from '../../../lib/getLead'
import { BLOG_POSTS } from '../../../lib/pagesContent'
import { SITE_ORIGIN } from '../../../lib/site'
import Layout from '../../../components/site/Layout'
import PageHero from '../../../components/site/PageHero'
import PageBottom from '../../../components/site/PageBottom'

export default function BlogPost({ lead, postSlug }) {
  const d = deriveLead(lead)
  const post = BLOG_POSTS.find(p => p.slug === postSlug)
  const base = `/${d.slug}`

  return (
    <Layout lead={lead} title={post.title}
      description={post.excerpt}
      canonical={`${SITE_ORIGIN}${base}/blog/${post.slug}`}>
      <PageHero d={d} title={post.title} subtitle={post.date} image={post.image} />

      <article className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
            {post.body.map((para, i) => <p key={i}>{para}</p>)}
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200">
            <a href={`${base}/blog`} className="text-primary font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
              <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Blog
            </a>
          </div>
        </div>
      </article>

      <PageBottom d={d} lead={lead} />
    </Layout>
  )
}

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  if (!BLOG_POSTS.some(p => p.slug === params.post)) return { notFound: true, revalidate: 300 }
  const res = await getLeadProps(params.slug)
  if (res.notFound) return res
  return { props: { ...res.props, postSlug: params.post }, revalidate: res.revalidate }
}
