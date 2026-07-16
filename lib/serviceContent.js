// Generate rich, intent-specific service-page content from a service name so each
// page is meaningfully different (not a keyword/city swap). Content varies by
// intent (repair / installation / replacement / maintenance) and by equipment
// category (AC / furnace / heat pump / boiler / mini-split / IAQ).

const IMG = (id, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`

function meta(name) {
  const n = name.toLowerCase()
  if (/boiler/.test(n))               return { img: '1650551182991-b07558247564', icon: 'water_heater',  subject: 'boiler',        family: 'heating' }
  if (/mini.?split|ductless/.test(n)) return { img: '1757219525975-03b5984bc6e8', icon: 'ac_unit',       subject: 'ductless mini-split', family: 'cooling' }
  if (/heat.?pump/.test(n))           return { img: '1776860150305-108ed577d7d4', icon: 'thermostat',    subject: 'heat pump',     family: 'heating' }
  if (/furnace/.test(n))              return { img: '1650551182991-b07558247564', icon: 'mode_fan',      subject: 'furnace',       family: 'heating' }
  if (/duct clean/.test(n))           return { img: '1615309662243-70f6df917b59', icon: 'air',           subject: 'ductwork',      family: 'other' }
  if (/air qual|purif|filtrat|iaq/.test(n)) return { img: '1615309662243-70f6df917b59', icon: 'air',    subject: 'indoor air quality system', family: 'other' }
  if (/air.?condition|\bac\b|cool/.test(n)) return { img: '1718203862467-c33159fdc504', icon: 'ac_unit', subject: 'air conditioner', family: 'cooling' }
  return { img: '1615309662243-70f6df917b59', icon: 'hvac', subject: 'HVAC system', family: 'other' }
}

function intentOf(name) {
  const n = name.toLowerCase()
  if (/replace/.test(n)) return 'replacement'
  if (/install/.test(n)) return 'installation'
  if (/repair|fix/.test(n)) return 'repair'
  if (/maint|tune/.test(n)) return 'maintenance'
  return 'service'
}

export function serviceMeta(name) { return meta(name) }

// Equipment options by family.
const OPTIONS = {
  cooling: ['Central air-conditioning systems', 'High-efficiency (SEER2) units', 'Ductless mini-split systems', 'Smart thermostats', 'Indoor air quality add-ons'],
  heating: ['High-efficiency gas furnaces', 'Electric furnaces', 'Heat pumps (all-season)', 'Boilers & radiant systems', 'Smart thermostats'],
  other:   ['Duct cleaning & sealing', 'Whole-home air purifiers', 'Humidifiers & dehumidifiers', 'High-efficiency filtration', 'Ventilation upgrades'],
}

function needSection(intent, subject) {
  switch (intent) {
    case 'repair': return {
      h: `Signs Your ${cap(subject)} Needs Repair`,
      p: [
        `Not sure if you need a repair? Common warning signs include weak or uneven airflow, strange noises, short-cycling, rising energy bills, and a ${subject} that can't hold the set temperature.`,
        `Catching these early keeps a small fix from turning into a full breakdown. Our technicians diagnose the real cause fast and give you honest, upfront pricing before any work begins.`,
      ],
    }
    case 'installation': return {
      h: `Is It Time for a New ${cap(subject)}?`,
      p: [
        `A new ${subject} makes sense when your current equipment is aging, inefficient, or no longer keeps you comfortable. Proper sizing and professional installation are what determine long-term comfort, efficiency, and lifespan.`,
        `We start with a load calculation and a clear written estimate, then install to manufacturer spec so your new system runs at peak efficiency from day one.`,
      ],
    }
    case 'replacement': return {
      h: `Repair or Replace Your ${cap(subject)}?`,
      p: [
        `If your ${subject} is more than 10–15 years old, needs frequent repairs, or a major component has failed, replacement is often the smarter long-term investment than another costly repair.`,
        `We'll give you an honest assessment — sometimes a repair is the right call, and we'll tell you when it is. When replacement makes sense, we handle removal, proper sizing, and installation end to end.`,
      ],
    }
    case 'maintenance': return {
      h: `Why ${cap(subject)} Maintenance Matters`,
      p: [
        `Regular maintenance keeps your ${subject} running efficiently, prevents surprise breakdowns, protects your manufacturer warranty, and extends equipment life — the best repair is the one you never need.`,
        `Our multi-point tune-up covers cleaning, calibration, safety checks, and performance testing so small issues are caught before they become expensive.`,
      ],
    }
    default: return {
      h: `${cap(subject)} Service You Can Trust`,
      p: [`Our licensed technicians handle every aspect of ${subject} service with honest pricing and quality workmanship, so your home stays comfortable year-round.`],
    }
  }
}

function processFor(intent) {
  const base = {
    repair:       ['Book your appointment', 'Full diagnostic inspection', 'Upfront repair estimate', 'Repair & test the system', 'Confirm everything works'],
    installation: ['In-home assessment', 'Load & sizing calculation', 'Written estimate & options', 'Professional installation', 'Testing & walkthrough'],
    replacement:  ['System assessment', 'Repair-vs-replace guidance', 'Equipment recommendations', 'Removal & installation', 'Testing & homeowner walkthrough'],
    maintenance:  ['Schedule your tune-up', 'Multi-point inspection', 'Cleaning & calibration', 'Safety & performance test', 'Report & recommendations'],
  }
  return (base[intent] || ['Contact us', 'Assessment', 'Written estimate', 'Complete the work', 'Testing & walkthrough'])
}

function faqsFor(intent, subject, city) {
  const common = [
    { q: 'Are your technicians licensed and insured?', a: 'Yes — every technician is fully licensed, background-checked, and insured for your peace of mind.' },
    { q: `Do you serve my area near ${city}?`, a: `We serve ${city} and the surrounding communities. Give us a call and we'll confirm we cover your neighborhood.` },
    { q: 'Do you offer financing?', a: 'Yes, we offer flexible financing options on qualifying work so comfort fits your budget.' },
  ]
  const byIntent = {
    repair: [
      { q: `How fast can you repair my ${subject}?`, a: 'We offer same-day and emergency service on most repairs, and carry common parts so many are fixed in a single visit.' },
      { q: 'Will you tell me if repair is not worth it?', a: `Absolutely. If your ${subject} is better replaced than repaired, we'll show you the numbers and let you decide.` },
    ],
    installation: [
      { q: `How long does a ${subject} installation take?`, a: 'Most residential installations are completed in a single day, depending on the system and any ductwork involved.' },
      { q: 'What size system do I need?', a: 'We perform a proper load calculation — an oversized or undersized system wastes energy and money, so correct sizing matters.' },
    ],
    replacement: [
      { q: `Can I replace just part of my ${subject}?`, a: 'Sometimes — but matching components matters for efficiency and warranty. We\'ll advise what makes sense for your situation.' },
      { q: 'Are rebates available?', a: 'High-efficiency equipment often qualifies for manufacturer or utility rebates. We\'ll point you to what\'s available.' },
    ],
    maintenance: [
      { q: 'How often should I service my system?', a: 'Twice a year is ideal — once before cooling season and once before heating season — to keep efficiency high and prevent breakdowns.' },
      { q: 'Do you offer maintenance plans?', a: 'Yes — our plans include priority scheduling, discounted repairs, and regular tune-ups for year-round peace of mind.' },
    ],
  }
  return [...(byIntent[intent] || []), ...common]
}

function cap(s) { return String(s).replace(/\b\w/g, c => c.toUpperCase()) }

export function serviceContent(name, businessName, city) {
  const m = meta(name)
  const intent = intentOf(name)
  const low = name.toLowerCase()
  const need = needSection(intent, m.subject)

  return {
    title: name,
    icon: m.icon,
    img: IMG(m.img),
    blurb: `Professional ${low} for ${city} homeowners — reliable, efficient, and done right.`,
    opening:
      `${businessName} provides expert ${low} throughout ${city} and the surrounding areas. As a locally owned, ` +
      `licensed and insured team, we deliver honest pricing, quality workmanship, and comfort you can count on. ` +
      `Call us or request service online and we'll take care of the rest.`,
    need,
    process: processFor(intent),
    options: OPTIONS[m.family],
    why: [
      'Licensed & insured technicians — no subcontractors',
      'Upfront, flat-rate pricing with no surprises',
      'Same-day & emergency availability',
      'Proper load sizing & permit handling',
      '100% satisfaction guarantee',
    ],
    local:
      `${city} homes range from older builds with aging ductwork to newer, tighter constructions — each with its own ` +
      `comfort challenges. Our technicians know the local climate and housing stock, so we recommend the right ${m.subject} ` +
      `solution for your home, not a one-size-fits-all fix.`,
    faqs: faqsFor(intent, m.subject, city),
    gallery: [IMG('1615309662243-70f6df917b59', 800), IMG(m.img, 800), IMG('1621905251189-08b45d6a269e', 800)],
  }
}
