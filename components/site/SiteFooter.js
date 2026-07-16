import { getServices, strongLocations, extraAreas } from '../../lib/lead'

// Shared footer. Services + location links are data-driven per client so they
// never point at pages that don't exist.
export default function SiteFooter({ d, lead }) {
  const base = `/${d.slug}`
  const services = getServices(lead).slice(0, 8)
  const locations = strongLocations(lead)
  const extra = extraAreas(lead)

  return (
    <footer className="bg-deep-green text-white py-20 pb-28 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-2xl font-black tracking-tighter mb-6">{d.businessName}</h3>
            <p className="text-white/60 leading-relaxed">
              Keeping {d.city} comfortable with expert HVAC services. Licensed, insured, and locally operated.
            </p>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6">Services</h4>
            <ul className="space-y-3 text-white/60">
              {services.map(({ name, slug }) => (
                <li key={slug}><a href={`${base}/services/${slug}`} className="hover:text-primary transition-colors">{name}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6">Service Areas</h4>
            <ul className="space-y-3 text-white/60">
              {locations.map(({ name, slug }) => (
                <li key={slug}><a href={`${base}/areas/${slug}`} className="hover:text-primary transition-colors">{name}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-lg mb-6">Contact</h4>
            <ul className="space-y-3 text-white/60 text-sm">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">call</span>
                <a href={d.tel} className="hover:text-primary transition-colors">{d.phone}</a>
              </li>
              {d.email && (
                <li className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">mail</span>
                  <a href={`mailto:${d.email}`} className="hover:text-primary transition-colors break-all">{d.email}</a>
                </li>
              )}
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" aria-hidden="true">location_on</span> {d.address || d.city}
              </li>
              {d.hours && (
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary" aria-hidden="true">schedule</span> {d.hours}
                </li>
              )}
              <li className="pt-2 flex gap-4">
                <a href={`${base}/privacy`} className="hover:text-primary transition-colors">Privacy</a>
                <a href={`${base}/terms`} className="hover:text-primary transition-colors">Terms</a>
              </li>
            </ul>
          </div>
        </div>

        {extra.length > 0 && (
          <p className="text-white/40 text-sm mb-8 border-t border-white/10 pt-8">
            Also serving {extra.join(', ')} and surrounding communities.
          </p>
        )}

        <div className="pt-8 border-t border-white/10 text-center text-white/40 text-sm space-y-2">
          <p>© {new Date().getFullYear()} {d.businessName}. All rights reserved.</p>
          <p>Preview by <a href="https://localgrowthstudio.com" className="underline hover:text-white transition-colors">Local Growth Studio</a></p>
        </div>
      </div>
    </footer>
  )
}
