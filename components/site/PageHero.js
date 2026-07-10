import { rgba } from '../../lib/colors'
import { openQuoteModal } from './QuoteModal'

// Dark, centred page-title hero used by every non-home page (service, gallery,
// area, blog, blog post, contact, legal).
export default function PageHero({ d, title, subtitle, image }) {
  const gradient = `linear-gradient(to right, ${rgba(d.primary, 0.92)}, ${rgba(d.primary, 0.78)})`
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 z-10" style={{ backgroundImage: gradient }} />
        {image && <img alt="" className="w-full h-full object-cover" src={image} />}
        {!image && <div className="w-full h-full" style={{ backgroundColor: d.primary }} />}
      </div>
      <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
        <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight mb-5 uppercase" style={{ color: d.textOnPrimary }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl mb-8 leading-relaxed max-w-2xl mx-auto" style={{ color: d.textOnPrimary, opacity: 0.9 }}>
            {subtitle}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={openQuoteModal} className="bg-primary hover:bg-primary/90 btn-accent-text px-8 py-4 rounded-lg font-black text-lg transition-transform hover:scale-105">
            Get a Free Quote →
          </button>
          <a href={d.tel} className="backdrop-blur-sm border px-8 py-4 rounded-lg font-black text-lg transition-all flex items-center justify-center gap-2"
            style={{ color: d.textOnPrimary, borderColor: rgba(d.textOnPrimary, 0.3), backgroundColor: rgba(d.textOnPrimary, 0.08) }}>
            <span className="material-symbols-outlined">call</span> {d.phone}
          </a>
        </div>
      </div>
    </section>
  )
}
