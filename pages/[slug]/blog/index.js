import { deriveLead } from '../../../lib/lead'
import { getLeadProps } from '../../../lib/getLead'
import { FALLBACK_HERO } from '../../../lib/hvacContent'
import { BLOG_POSTS } from '../../../lib/pagesContent'
import Layout from '../../../components/site/Layout'
import PageHero from '../../../components/site/PageHero'
import PageBottom from '../../../components/site/PageBottom'

export default function BlogIndex({ lead }) {
  const d = deriveLead(lead)
  const base = `/${d.slug}`

  return (
    <Layout lead={lead} title="Blog">
      <PageHero d={d} title="Check Out Our Blog" subtitle="Tips, guides, and news to keep your home comfortable." image={FALLBACK_HERO} />

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map(post => (
              <a key={post.slug} href={`${base}/blog/${post.slug}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 transition-all hover:-translate-y-2 flex flex-col">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={post.image} alt={post.title} width={800} height={500} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-primary mb-2">{post.date}</p>
                  <h3 className="text-lg font-bold mb-3 leading-snug">{post.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1">{post.excerpt}</p>
                  <span className="text-primary font-bold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read More <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </span>
                </div>
              </a>
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
