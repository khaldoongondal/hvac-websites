// Static HVAC content for the lead template. Per-lead data (name, phone, city,
// colours, logo) comes from Supabase; everything here is niche content shared by
// every generated page. Mirrors the canonical GoHighLevel service-site layout
// used across our other client sites (GC Legacy, Save Aqua, Canvas, etc.).

export const TRUST_BADGES = [
  { icon: 'location_on',       label: '100% Local'      },
  { icon: 'family_home',       label: 'Family Business' },
  { icon: 'workspace_premium', label: '10+ Years'       },
  { icon: 'verified_user',     label: 'Insured'         },
  { icon: 'badge',             label: 'Fully Licensed'  },
]

// Services render as image cards (matches "Our Services" in the reference sites).
export const SERVICES = [
  {
    icon: 'ac_unit', title: 'AC Repair',
    desc: 'Fast, reliable air-conditioning repair to get your home cool and comfortable again.',
    img: 'https://images.unsplash.com/photo-1718203862467-c33159fdc504?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  },
  {
    icon: 'hvac', title: 'AC Installation',
    desc: 'Expert installation of energy-efficient cooling systems sized right for your home.',
    img: 'https://images.unsplash.com/photo-1757219525975-03b5984bc6e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  },
  {
    icon: 'mode_fan', title: 'Heating & Furnace',
    desc: 'Furnace repair, replacement, and tune-ups for dependable warmth all winter long.',
    img: 'https://images.unsplash.com/photo-1650551182991-b07558247564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  },
  {
    icon: 'thermostat', title: 'Heat Pumps',
    desc: 'Eco-friendly heat pumps that heat and cool efficiently for year-round comfort.',
    img: 'https://images.unsplash.com/photo-1776860150305-108ed577d7d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  },
  {
    icon: 'build', title: 'Maintenance',
    desc: 'Seasonal tune-ups that extend equipment life and prevent costly breakdowns.',
    img: 'https://images.unsplash.com/photo-1642749776312-aa42ce20c9f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  },
  {
    icon: 'emergency_home', title: '24/7 Emergency',
    desc: 'Round-the-clock priority service for when your heating or cooling fails.',
    img: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  },
]

export const PROCESS_STEPS = [
  { icon: 'call',     title: 'Contact Us',    desc: 'Call or request a free quote online. We respond fast.' },
  { icon: 'search',   title: 'Free Estimate', desc: 'We assess your system and give honest, upfront pricing.' },
  { icon: 'event',    title: 'Schedule',      desc: 'Pick a time that works — including same-day service.' },
  { icon: 'handyman', title: 'We Fix It',     desc: 'Licensed technicians complete the job right the first time.' },
  { icon: 'thumb_up', title: 'Enjoy Comfort', desc: 'Sit back and enjoy reliable, energy-efficient comfort.' },
]

// "About Us — Key Items" feature blocks (matches the reference About layout).
export const ABOUT_ITEMS = [
  { icon: 'verified_user',     label: 'Licensed & Insured'      },
  { icon: 'workspace_premium', label: '10+ Years Experience'    },
  { icon: 'family_home',       label: 'Locally Owned & Operated' },
  { icon: 'thumb_up',          label: 'Satisfaction Guaranteed'  },
]

export const ABOUT_IMG =
  'https://images.unsplash.com/photo-1642749776312-aa42ce20c9f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900'

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
    q: 'What makes you different from other HVAC companies?',
    a: 'Local ownership, honest flat-rate pricing, and a 100% satisfaction guarantee. We treat your home like our own.',
  },
]

// Stock HVAC gallery imagery (Unsplash). Explicit sizes keep CLS low.
export const GALLERY = [
  'https://images.unsplash.com/photo-1776860150250-757406c52438?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1615309662243-70f6df917b59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1700124113583-81aa99ea2aa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
  'https://images.unsplash.com/photo-1635604866833-70844856de75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
]

export const HOURS = [
  { day: 'Monday',    time: '8:00am – 8:00pm' },
  { day: 'Tuesday',   time: '8:00am – 8:00pm' },
  { day: 'Wednesday', time: '8:00am – 8:00pm' },
  { day: 'Thursday',  time: '8:00am – 8:00pm' },
  { day: 'Friday',    time: '8:00am – 8:00pm' },
  { day: 'Saturday',  time: '9:00am – 5:00pm' },
  { day: 'Sunday',    time: 'Emergency only'  },
]

export const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600'

// Background for the "Review us on Google" band.
export const REVIEW_BG =
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600'
