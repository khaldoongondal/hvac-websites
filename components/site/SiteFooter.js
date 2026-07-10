import { HOURS } from '../../lib/hvacContent'
import { SERVICE_DETAILS, SERVICE_ORDER } from '../../lib/pagesContent'

// Shared footer. Service links point at the individual service pages; quick
// links cover the other page types + legal.
export default function SiteFooter({ d }) {
  const base = `/${d.slug}`
  const quickLinks = [
    { href: base,             label: 'Home'    },
    { href: `${base}/gallery`, label: 'Gallery' },
    { href: `${base}/blog`,    label: 'Blog'    },
    { href: `${base}/contact`, label: 'Contact' },
  ]
  return (
    <footer className="bg-deep-green text-white py-20 pb-28 md:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-black tracking-tighter mb-6">{d.businessName}</h3>
            <p className="text-white/60 leading-relaxed">
              Keeping {d.city} comfortable with expert HVAC services. Licensed, insured, and locally operated.
            </p>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6">Services</h4>
            <ul className="space-y-3 text-white/60">
              {SERVICE_ORDER.map(slug => (
                <li key={slug}>
                  <a href={`${base}/services/${slug}`} className="hover:text-primary transition-colors">{SERVICE_DETAILS[slug].title}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6">Company</h4>
            <ul className="space-y-3 text-white/60">
              {quickLinks.map(({ href, label }) => (
                <li key={label}><a href={href} className="hover:text-primary transition-colors">{label}</a></li>
              ))}
              <li><a href={`${base}/privacy`} className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href={`${base}/terms`} className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6">Contact & Hours</h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">call</span>
                <a href={d.tel} className="hover:text-primary transition-colors">{d.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">location_on</span> {d.address || d.city}
              </li>
              {HOURS.map(({ day, time }) => (
                <li key={day} className="flex justify-between gap-4"><span>{day}</span><span>{time}</span></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm space-y-2">
          <p>© {new Date().getFullYear()} {d.businessName}. All rights reserved.</p>
          <p>
            Preview by{' '}
            <a href="https://localgrowthstudio.com" className="underline hover:text-white transition-colors">Local Growth Studio</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
