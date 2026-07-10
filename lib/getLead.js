import { createClient } from '@supabase/supabase-js'
import { cleanCity } from './colors'
import { FALLBACK_HERO } from './hvacContent'

const STATE_NAMES = {
  AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',
  CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',
  HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',
  KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',
  MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',
  NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',
  NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',
  OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',
  SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',
  VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',
}

const HERO_OVERRIDES = {
  'grace-mechanical-services': 'https://images.unsplash.com/photo-1584385971010-71c147ba5dbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
  'baker-home-energy':         'https://images.unsplash.com/photo-1622572090318-babb0ca046de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=1080',
}

async function unsplashSearch(query, key) {
  const res  = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${key}` } }
  )
  const json = await res.json()
  return json.results?.[0]?.urls?.regular || null
}

async function resolveHero(slug, lead) {
  let heroImage = HERO_OVERRIDES[slug] || FALLBACK_HERO
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (HERO_OVERRIDES[slug] || !key) return heroImage
  try {
    const cityName  = cleanCity(lead.city || '')
    const stateCode = (lead.city || '').match(/,\s*([A-Z]{2})$/)?.[1]
    const stateName = stateCode ? STATE_NAMES[stateCode] : null
    heroImage =
      (cityName  && await unsplashSearch(`${cityName} skyline`,  key)) ||
      (stateName && await unsplashSearch(`${stateName} skyline`, key)) ||
      (stateName && await unsplashSearch(stateName,              key)) ||
      FALLBACK_HERO
  } catch (_) { /* keep fallback */ }
  return heroImage
}

// Shared getStaticProps body for every page keyed on [slug]. Returns the Next
// props/notFound shape directly. `withHero` fetches an Unsplash hero image.
export async function getLeadProps(slug, { withHero = false } = {}) {
  if (!slug || slug.includes('.')) return { notFound: true, revalidate: 300 }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const { data: lead, error } = await supabase
    .from('leads').select('*').eq('slug', slug).single()

  if (error || !lead) return { notFound: true, revalidate: 300 }
  if (lead.expires_at && new Date(lead.expires_at) < new Date()) {
    return { notFound: true, revalidate: 300 }
  }

  const heroImage = withHero ? await resolveHero(slug, lead) : null
  return { props: { lead, heroImage }, revalidate: 3600 }
}
