// Static HVAC content for the lead template. Per-lead data (name, phone, city,
// colours, logo) comes from Supabase; everything here is niche content shared by
// every generated page. Mirrors the canonical GoHighLevel service-site layout.

export const TRUST_BADGES = [
  { icon: 'location_on',   label: '100% Local'     },
  { icon: 'family_home',   label: 'Family Business' },
  { icon: 'workspace_premium', label: '10+ Years'  },
  { icon: 'verified_user', label: 'Insured'        },
  { icon: 'badge',         label: 'Fully Licensed' },
]

export const SERVICES = [
  { icon: 'ac_unit',        title: 'AC Repair',        desc: 'Fast, reliable air-conditioning repair to get your home cool and comfortable again.' },
  { icon: 'hvac',           title: 'AC Installation',  desc: 'Expert installation of energy-efficient cooling systems sized right for your home.' },
  { icon: 'mode_fan',       title: 'Heating & Furnace', desc: 'Furnace repair, replacement, and tune-ups for dependable warmth all winter long.' },
  { icon: 'thermostat',     title: 'Heat Pumps',       desc: 'Eco-friendly heat pumps that heat and cool efficiently for year-round comfort.' },
  { icon: 'build',          title: 'Maintenance',      desc: 'Seasonal tune-ups that extend equipment life and prevent costly breakdowns.' },
  { icon: 'emergency_home', title: '24/7 Emergency',   desc: 'Round-the-clock priority service for when your heating or cooling fails.' },
]

export const PROCESS_STEPS = [
  { icon: 'call',          title: 'Contact Us',     desc: 'Call or request a free quote online. We respond fast.' },
  { icon: 'search',        title: 'Free Estimate',  desc: 'We assess your system and give honest, upfront pricing.' },
  { icon: 'event',         title: 'Schedule',       desc: 'Pick a time that works — including same-day service.' },
  { icon: 'handyman',      title: 'We Fix It',      desc: 'Licensed technicians complete the job right the first time.' },
  { icon: 'thumb_up',      title: 'Enjoy Comfort',  desc: 'Sit back and enjoy reliable, energy-efficient comfort.' },
]

export const WHY_US = [
  { title: 'Licensed & Insured Technicians', body: 'Our team is fully certified — no subcontractors, no cutting corners.' },
  { title: 'Transparent Flat-Rate Pricing',  body: 'No hidden fees or surprise charges. You know the cost before we start.' },
  { title: '100% Satisfaction Guarantee',    body: "If you're not happy with our work, we'll make it right." },
]

export const FAQS = [
  {
    q: 'Do you offer free estimates?',
    a: 'Yes — we provide free, no-obligation quotes on installations and replacements so you know exactly what to expect.',
  },
  {
    q: 'Are your technicians licensed and insured?',
    a: 'Absolutely. Every technician is fully licensed, background-checked, and insured for your peace of mind.',
  },
  {
    q: 'Do you offer emergency HVAC service?',
    a: 'We offer 24/7 emergency repair. When your heating or cooling fails, we prioritize getting you comfortable again fast.',
  },
  {
    q: 'What areas do you service?',
    a: 'We proudly serve homeowners throughout the local area and surrounding communities. Call us to confirm we cover your neighborhood.',
  },
]

export const TESTIMONIALS = [
  { quote: 'Fast response time! Our furnace quit in the middle of a cold snap, and they had it running in hours.', author: 'Sarah M.' },
  { quote: 'Professional, clean, and honest. The installation of our new AC was seamless. Highly recommend!',      author: 'David & Linda K.' },
  { quote: "The most transparent pricing I've encountered. No pushy sales, just expert advice and great work.",    author: 'Michael T.' },
]

// Stock HVAC gallery imagery (Unsplash). Explicit sizes keep CLS low.
export const GALLERY = [
  'https://images.unsplash.com/photo-1631545806609-24b7e2c1f5f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
]

export const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600'
