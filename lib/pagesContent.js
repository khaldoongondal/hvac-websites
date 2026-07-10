// Content for the additional page types (service, blog, legal, area). Business
// name / city are interpolated at render time via the `fill` helpers so the same
// copy works for every client.

const IMG = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`

// ── Service pages (/[slug]/services/[service]) ────────────────────────────────
export const SERVICE_DETAILS = {
  'ac-repair': {
    title: 'AC Repair',
    blurb: 'Fast, reliable air-conditioning repair to get your home cool and comfortable again.',
    img: IMG('1718203862467-c33159fdc504', 1200),
    paragraphs: [
      'When your air conditioner quits in the middle of summer, you need a team that shows up fast and fixes it right. Our licensed technicians diagnose the problem quickly and give you honest, upfront pricing before any work begins.',
      'From refrigerant leaks and frozen coils to failed compressors and thermostat issues, we repair every make and model. We carry common parts on the truck so most repairs are done in a single visit.',
      'No surprise fees, no pushy upsells — just dependable AC repair that restores your comfort and keeps your energy bills in check.',
    ],
    bullets: ['Same-day & emergency service', 'All makes & models', 'Upfront flat-rate pricing', 'Licensed & insured technicians'],
    gallery: [IMG('1581094794329-c8112a89af12'), IMG('1757219525975-03b5984bc6e8'), IMG('1615309662243-70f6df917b59')],
  },
  'ac-installation': {
    title: 'AC Installation',
    blurb: 'Expert installation of energy-efficient cooling systems sized right for your home.',
    img: IMG('1757219525975-03b5984bc6e8', 1200),
    paragraphs: [
      'A new air conditioner is a big investment — sizing and installation quality make all the difference in comfort, efficiency, and lifespan. We help you choose the right system for your home and budget, then install it to manufacturer spec.',
      'Our team handles everything: load calculations, old-unit removal, ductwork checks, and a full commissioning so your new system runs at peak efficiency from day one.',
      'Enjoy lower energy bills, quieter operation, and years of reliable cooling — backed by our satisfaction guarantee.',
    ],
    bullets: ['Free in-home estimates', 'Energy-efficient systems', 'Proper load-sizing', 'Manufacturer-backed warranties'],
    gallery: [IMG('1776860150250-757406c52438'), IMG('1700124113583-81aa99ea2aa2'), IMG('1621905251189-08b45d6a269e')],
  },
  'heating-furnace': {
    title: 'Heating & Furnace',
    blurb: 'Furnace repair, replacement, and tune-ups for dependable warmth all winter long.',
    img: IMG('1650551182991-b07558247564', 1200),
    paragraphs: [
      'Cold nights are no time for a furnace to fail. We repair, replace, and maintain gas and electric furnaces so your family stays warm and safe all season.',
      'Our technicians check every safety component — heat exchangers, igniters, gas valves, and airflow — to keep your system running efficiently and prevent carbon-monoxide risks.',
      'Whether you need a quick repair or a full replacement, we deliver reliable heat and honest advice.',
    ],
    bullets: ['Gas & electric furnaces', 'Safety inspections included', 'Same-day repairs', 'High-efficiency upgrades'],
    gallery: [IMG('1607400201889-565b1ee75f8e'), IMG('1615309662243-70f6df917b59'), IMG('1642749776312-aa42ce20c9f5')],
  },
  'heat-pumps': {
    title: 'Heat Pumps',
    blurb: 'Eco-friendly heat pumps that heat and cool efficiently for year-round comfort.',
    img: IMG('1776860150305-108ed577d7d4', 1200),
    paragraphs: [
      'Heat pumps are one of the most efficient ways to heat and cool your home — a single system that keeps you comfortable in every season while cutting energy costs.',
      'We install and service modern, high-efficiency heat pumps sized precisely for your space, so you get consistent temperatures and quiet operation year-round.',
      'Ask us about available rebates and incentives that make upgrading to a heat pump more affordable than ever.',
    ],
    bullets: ['Year-round heating & cooling', 'High-efficiency inverter systems', 'Rebate & incentive guidance', 'Quiet, consistent comfort'],
    gallery: [IMG('1700124113583-81aa99ea2aa2'), IMG('1757219525975-03b5984bc6e8'), IMG('1776860150250-757406c52438')],
  },
  'maintenance': {
    title: 'Maintenance',
    blurb: 'Seasonal tune-ups that extend equipment life and prevent costly breakdowns.',
    img: IMG('1642749776312-aa42ce20c9f5', 1200),
    paragraphs: [
      'The best repair is the one you never need. Regular maintenance keeps your HVAC system running efficiently, catches small problems before they become expensive, and protects your manufacturer warranty.',
      'Our multi-point tune-ups cover cleaning, calibration, safety checks, and performance testing for both your heating and cooling equipment.',
      'Ask about our maintenance plans — priority scheduling, discounted repairs, and peace of mind all year.',
    ],
    bullets: ['Multi-point inspections', 'Priority scheduling plans', 'Lower energy bills', 'Extends equipment life'],
    gallery: [IMG('1615309662243-70f6df917b59'), IMG('1621905251189-08b45d6a269e'), IMG('1581094794329-c8112a89af12')],
  },
  'emergency-hvac': {
    title: '24/7 Emergency HVAC',
    blurb: 'Round-the-clock priority service for when your heating or cooling fails.',
    img: IMG('1621905251918-48416bd8575a', 1200),
    paragraphs: [
      'HVAC emergencies do not wait for business hours — and neither do we. When your heating or cooling fails, our team is on call around the clock to get you comfortable again fast.',
      'We prioritize emergency calls, arrive prepared, and carry common parts so most urgent repairs are handled on the spot.',
      'One call and help is on the way — day or night, weekends and holidays included.',
    ],
    bullets: ['Available 24/7', 'Rapid response times', 'Fully-stocked service trucks', 'Upfront emergency pricing'],
    gallery: [IMG('1621905251918-48416bd8575a'), IMG('1642749776312-aa42ce20c9f5'), IMG('1700124113583-81aa99ea2aa2')],
  },
}

export const SERVICE_ORDER = [
  'ac-repair', 'ac-installation', 'heating-furnace', 'heat-pumps', 'maintenance', 'emergency-hvac',
]

// ── Blog (/[slug]/blog and /[slug]/blog/[post]) ───────────────────────────────
export const BLOG_POSTS = [
  {
    slug: 'why-seasonal-hvac-maintenance-matters',
    title: 'Why Seasonal HVAC Maintenance Matters More Than You Think',
    date: 'Spring 2026',
    image: IMG('1642749776312-aa42ce20c9f5', 1200),
    excerpt: 'A little upkeep goes a long way. Here is how seasonal tune-ups save you money and prevent breakdowns.',
    body: [
      'Most homeowners only think about their HVAC system when something goes wrong. But by then, a small, cheap-to-fix issue has often grown into a costly repair — or a full breakdown on the hottest or coldest day of the year.',
      'Seasonal maintenance changes that. A twice-a-year tune-up keeps your system running at peak efficiency, which means lower energy bills and fewer surprise repairs. Technicians clean coils, check refrigerant levels, test safety controls, and calibrate your thermostat so everything runs the way the manufacturer intended.',
      'Maintenance also protects your warranty. Many manufacturers require documented annual service to keep coverage valid — skipping it can leave you paying full price for a repair that should have been covered.',
      'The bottom line: a modest maintenance plan pays for itself in lower bills, longer equipment life, and the peace of mind that your system will not quit when you need it most.',
    ],
  },
  {
    slug: 'signs-your-ac-needs-repair',
    title: '7 Signs Your AC Needs Repair Before It Fails Completely',
    date: 'Summer 2026',
    image: IMG('1581094794329-c8112a89af12', 1200),
    excerpt: 'Warm air, strange noises, rising bills — the early warning signs that your air conditioner needs attention.',
    body: [
      'Your air conditioner usually gives you warning signs before it fails completely. Catching them early means a smaller repair bill and no sweating through a summer breakdown.',
      'Watch for warm air coming from the vents, weak airflow, or rooms that never quite reach the set temperature. These often point to refrigerant or compressor issues that get worse — and more expensive — over time.',
      'Strange noises (grinding, squealing, rattling) and odd smells are also red flags, as is a sudden spike in your energy bill without a change in usage. Short-cycling — the system turning on and off rapidly — is another common warning.',
      'If you notice any of these, call for a diagnostic sooner rather than later. A quick fix today is almost always cheaper than an emergency replacement tomorrow.',
    ],
  },
  {
    slug: 'how-to-lower-your-energy-bills',
    title: 'How to Lower Your Energy Bills Without Sacrificing Comfort',
    date: 'Summer 2026',
    image: IMG('1607400201889-565b1ee75f8e', 1200),
    excerpt: 'Practical ways to cut heating and cooling costs while keeping your home comfortable year-round.',
    body: [
      'Heating and cooling is the biggest slice of most home energy bills — but a few smart moves can shrink that number without making you uncomfortable.',
      'Start with the basics: change your air filter regularly, seal leaky ducts, and program your thermostat to ease off while you are away. A smart thermostat can do this automatically and often pays for itself within a year.',
      'Upgrading to a high-efficiency system or a heat pump can dramatically cut costs, especially if your current unit is more than 10–15 years old. Modern systems use a fraction of the energy for the same comfort.',
      'Finally, do not underestimate maintenance. A clean, well-tuned system simply uses less energy to do the same job. Combine these steps and most homeowners see a noticeable drop on their next bill.',
    ],
  },
  {
    slug: 'choosing-the-right-hvac-system',
    title: 'Choosing the Right HVAC System for Your Home',
    date: 'Fall 2026',
    image: IMG('1776860150305-108ed577d7d4', 1200),
    excerpt: 'Central AC, heat pump, or furnace? A clear guide to picking the system that fits your home and budget.',
    body: [
      'Buying a new HVAC system is a decision you live with for a decade or more, so it pays to get it right. The best choice depends on your climate, home size, and budget.',
      'Heat pumps are increasingly popular because a single system handles both heating and cooling efficiently — ideal for moderate climates and homeowners who want lower year-round bills. Traditional central AC paired with a furnace remains a strong choice in areas with harsh winters.',
      'Sizing matters just as much as the type. An oversized system short-cycles and wastes energy; an undersized one runs constantly and never quite keeps up. A proper load calculation ensures the system fits your home.',
      'The right move is to have a licensed technician assess your home and walk you through the options. We help you weigh efficiency, upfront cost, and available rebates so you make a confident, informed decision.',
    ],
  },
]

// ── Legal (/[slug]/privacy and /[slug]/terms) ─────────────────────────────────
export function privacyContent(businessName) {
  return [
    { h: 'Introduction', p: [`This Privacy Policy describes how ${businessName} ("we", "us") collects, uses, and protects the information you provide when you use this website or request our services.`] },
    { h: 'Information We Collect', p: ['We collect information you voluntarily provide — such as your name, phone number, email, and message — when you submit a quote request or contact form. We may also collect basic, non-identifying analytics about how visitors use the site.'] },
    { h: 'How We Use Your Information', p: ['We use your information solely to respond to your request, schedule services, and communicate with you about your inquiry. With your consent, we may send occasional updates or promotions. We never sell your personal information.'] },
    { h: 'SMS & Communications Consent', p: ['If you opt in, we may contact you by phone, SMS, or email regarding your request. Message and data rates may apply. You can opt out at any time by replying STOP or contacting us directly.'] },
    { h: 'Data Protection', p: ['We take reasonable measures to protect your information from unauthorized access or disclosure. However, no method of transmission over the internet is completely secure.'] },
    { h: 'Contact Us', p: [`If you have questions about this policy, please contact ${businessName} using the phone number listed on this website.`] },
  ]
}

export function termsContent(businessName) {
  return [
    { h: 'Acceptance of Terms', p: [`By accessing and using this website, you agree to these Terms of Service. If you do not agree, please do not use the site. ${businessName} may update these terms at any time.`] },
    { h: 'Services', p: [`${businessName} provides heating, ventilation, and air-conditioning services. Any quotes provided through this site are estimates and subject to an in-person assessment. Final pricing is confirmed before work begins.`] },
    { h: 'Use of the Website', p: ['You agree to use this website only for lawful purposes and not to interfere with its operation or attempt to access it in an unauthorized manner.'] },
    { h: 'Limitation of Liability', p: [`${businessName} is not liable for any indirect or consequential damages arising from the use of this website or the information it contains. Content is provided "as is" without warranties of any kind.`] },
    { h: 'Intellectual Property', p: ['All content on this website, including text, images, and branding, is the property of its respective owner and may not be reproduced without permission.'] },
    { h: 'Contact', p: [`Questions about these terms can be directed to ${businessName} via the contact details on this website.`] },
  ]
}

// ── Service-area pages (/[slug]/areas/[area]) ─────────────────────────────────
// SEO-style content generated from the area label + business + city.
export function areaSections(areaLabel, businessName, city) {
  return [
    {
      h: `Trusted HVAC Services in ${areaLabel}`,
      p: [
        `${businessName} proudly serves homeowners throughout ${areaLabel} with dependable heating and cooling services. From emergency repairs to full system installations, our licensed technicians deliver honest pricing and quality workmanship on every job.`,
        `As a locally owned company rooted in ${city}, we understand the specific comfort needs of ${areaLabel} homes and respond quickly when you need us most.`,
      ],
    },
    {
      h: `AC & Heating Repair in ${areaLabel}`,
      p: [
        `When your system fails, every hour counts. Our ${areaLabel} technicians diagnose the problem fast and fix it right the first time, carrying common parts so most repairs are done in a single visit.`,
      ],
    },
    {
      h: `Installations & Replacements in ${areaLabel}`,
      p: [
        `Upgrading your system? We help ${areaLabel} homeowners choose energy-efficient equipment sized precisely for their home, then install it to manufacturer spec for years of reliable, lower-cost comfort.`,
      ],
    },
    {
      h: `Why ${areaLabel} Homeowners Choose Us`,
      p: [
        `Licensed and insured technicians, transparent flat-rate pricing, and a 100% satisfaction guarantee. We treat every ${areaLabel} home like our own — no subcontractors, no surprises.`,
      ],
    },
  ]
}
