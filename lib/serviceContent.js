// Generate service-page content from an arbitrary service name so the template
// works for any client's service list (not a fixed set of slugs).

const IMG = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`

function pick(name) {
  const n = name.toLowerCase()
  if (/boiler/.test(n))               return { img: '1650551182991-b07558247564', icon: 'water_heater',   cat: 'boiler' }
  if (/mini.?split|ductless/.test(n)) return { img: '1757219525975-03b5984bc6e8', icon: 'ac_unit',        cat: 'ductless mini-split' }
  if (/heat.?pump/.test(n))           return { img: '1776860150305-108ed577d7d4', icon: 'thermostat',     cat: 'heat pump' }
  if (/furnace|heat/.test(n))         return { img: '1650551182991-b07558247564', icon: 'mode_fan',       cat: 'heating' }
  if (/air|ac|cool|condition/.test(n))return { img: '1718203862467-c33159fdc504', icon: 'ac_unit',        cat: 'air conditioning' }
  if (/maint|tune/.test(n))           return { img: '1642749776312-aa42ce20c9f5', icon: 'build',          cat: 'maintenance' }
  if (/emerg/.test(n))                return { img: '1621905251918-48416bd8575a', icon: 'emergency_home',  cat: 'emergency' }
  return { img: '1615309662243-70f6df917b59', icon: 'hvac', cat: 'HVAC' }
}

export function serviceMeta(name) {
  return pick(name)
}

export function serviceContent(name, businessName, city) {
  const { img, icon } = pick(name)
  const low = name.toLowerCase()
  const verb = /repair/.test(low) ? 'repair'
    : /install/.test(low) ? 'installation'
    : /maint|tune/.test(low) ? 'maintenance'
    : 'service'
  return {
    title: name,
    icon,
    img: IMG(img),
    blurb: `Professional ${low} for ${city} homeowners — reliable, efficient, and done right.`,
    paragraphs: [
      `${businessName} provides expert ${low} throughout ${city} and the surrounding areas. Our licensed, insured technicians deliver honest pricing and quality workmanship on every job.`,
      `Whether it is a routine ${verb} or an urgent one, we show up on time, explain your options clearly, and complete the work right the first time — no surprises, no pressure.`,
      `Ready to get started? Request a free quote and our ${city} team will take care of the rest.`,
    ],
    bullets: [
      'Licensed & insured technicians',
      'Upfront flat-rate pricing',
      'Same-day & emergency availability',
      '100% satisfaction guarantee',
    ],
    gallery: [IMG('1615309662243-70f6df917b59', 800), IMG(img, 800), IMG('1621905251189-08b45d6a269e', 800)],
  }
}
