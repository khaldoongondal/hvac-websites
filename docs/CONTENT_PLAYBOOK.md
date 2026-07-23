# Content Playbook — Leadder (and every client site built on this template)

How to generate the copy for every section of every page type, so a new client site can be
filled in without guessing. One section per row: what it is, where the source material comes
from, how to write it, and how we check it before it ships.

**Inputs collected once per client (the intake pack):**

| Input | Used by | Who supplies |
|---|---|---|
| Legal business name, phone, address, hours | header, footer, contact, schema | client |
| Licence / association numbers (TSSA, HRAI, etc.) | footer, trust bar | client |
| Year founded, owner story, team size | home About, about page | client |
| Service list + which ones they actually sell | nav, service pages, cull decisions | client |
| City list + priority order | location pages, sitemap | client + keyword data |
| Real project photos (with permission) | gallery, See Our Work, location proof | client |
| Google Business Profile / GHL review feed | every reviews block | GHL sub-account |
| Brands installed / serviced | service pages, FAQs | client |
| Financing partner, rebate programs | financing, service pages | client |
| Warranty terms | service pages, TOS | client |

> **Hard rule:** never invent a licence number, a review, an address, a founding year, or an award.
> If the intake pack does not have it, the section ships without it or does not ship.

---

## Global writing rules

- **Read like the technician, not the brochure.** Name specific failures, parts, and neighbourhoods.
  "A failed run capacitor" beats "a component issue."
- **One primary keyword per page**, used naturally in the H1, the first 100 words, one H2, and the
  meta title. Never repeat it into every heading.
- **Local specificity is the moat.** Every service and location page must contain at least two
  details a generic national page could not contain (housing stock, climate, street/area names,
  permit or rebate realities).
- **Answer the objection.** Price, timing, and "is it worth repairing" are the three questions every
  visitor has. Address all three somewhere on the page.
- **No filler.** If a sentence would be true for any contractor in any city, cut it.
- **Reading level:** plain English, short sentences, no jargon without a plain-language gloss.
- **Length targets:** service page 550–800 words visible + FAQ; location page 220–320 words intro +
  FAQ; blog post 700–1,200 words.

---

## Home page

| Section | What it needs | How to generate | Ship check |
|---|---|---|---|
| Hero | Company name + city + years in business, one CTA | Straight from intake. No cleverness — the H1 states who and where. | City and year match the intake pack |
| Local services intro | 1 paragraph: what they do, for whom, why they are trusted | Combine service list + differentiators from intake. Expand into the Read More groups from the real service list only. | Every "Read More" link points at a page that exists |
| Trust bar | 5 short proof points | Pull only claims the client can evidence (local, family-run, years, insured, licensed) | Each claim verifiable |
| About Us | 2 short paragraphs, owner-voice | Interview note from intake: why they started, how they treat a job. Rewrite in second person to the homeowner. | No stock "we are passionate about service" lines |
| Our Services | 3 category cards | One card per top-level category, one sentence each naming the actual services underneath | Cards link to real category/service pages |
| See Our Work | 8 project photos | Client photos only. If none exist yet, keep the placeholder tiles — do **not** use stock. | No competitor-branded or stock photography |
| Reviews | Live Google reviews | GHL Google-reviews widget, sub-account connected to the client GBP | Not hardcoded once GHL is wired |
| FAQ | 5 questions | The five questions the client's office actually gets asked most. Ask them. Mirror answers into FAQPage schema. | Visible text == schema text |
| Proudly serving | City list + map | City list from intake, ordered by priority | Every named city has (or will have) a page |
| Bottom CTA | One line + Instant Quote | Fixed template | Button opens the quote modal |

## Service page (`/services/<slug>/`)

| Section | What it needs | How to generate | Ship check |
|---|---|---|---|
| Eyebrow + H1 | Category + `<Service> in <City>, <Province>` | Template. Keyword goes here once. | H1 unique across the site |
| Hero subline | One sentence naming the outcome and the speed | Answer: what does the customer get, how fast | Under 25 words |
| Lead copy (4 paragraphs) | ¶1 the promise and scope · ¶2 the technical reality (name real failure modes / real options) · ¶3 local specificity (housing stock, climate, permits) · ¶4 the honest close (repair vs replace, pricing posture, warranty) | Interview the lead technician for ¶2 and ¶3 — that is where the non-generic material lives. Draft, then cut every sentence that would be true anywhere. | ≥2 details unique to this city; no claim the client cannot back |
| See our work | 4 photos of *this* service | Client photos tagged by service | No cross-service reuse if avoidable |
| Reviews | GHL Google reviews | Same widget as home | Live feed once GHL is wired |
| Areas we serve | Max 6 chips per row | Top cities + "View all areas" | Every chip resolves |
| FAQ accordion | 8–11 entries carrying the deep SEO content: signs/symptoms, our process, options we handle, local relevance, why us, then 4–6 real customer questions | This is where long-form detail lives (Adam's call: fold the paragraphs into collapsible FAQs so Google crawls them without cluttering the page). Each answer 40–150 words. | Visible text == FAQPage schema text |
| Related services | 4–5 internal links | Nearest services + financing | Descriptive anchors, no "click here" |
| Bottom CTA | Fixed template | — | Instant Quote modal opens |

## Service location page (`/service-areas/<city>/`)

| Section | What it needs | How to generate | Ship check |
|---|---|---|---|
| Eyebrow + H1 | `Air Conditioning & Heating Services in <City>, <Prov>` | Template | Wraps to ≤3 lines on desktop |
| Hero subline | One sentence naming a real local characteristic | Neighbourhood or climate detail | Not swappable with another city |
| Intro block (2 paragraphs) | ¶1 the housing stock and what it demands of an HVAC system · ¶2 the local climate reality + what we offer there | Research the city's actual build eras and neighbourhoods. Two paragraphs only — the Regal example is too long. | Named neighbourhoods are real and correctly spelled |
| Reviews | GHL Google reviews, filtered to that city where possible | GHL widget | Live once wired |
| FAQ | 5 city-scoped questions | Same five questions, answered with local specifics | Matches FAQPage schema |
| Services we offer | 6 service chips | Top 6 services for that market | All chips resolve |
| Bottom CTA | Fixed template | — | Modal opens |

## Gallery

Photos are the content. Requirements: client-owned or licensed, before/after pairs where possible,
captioned by service + city, no visible competitor branding, no faces without written consent.
Reviews block sits above the closing CTA. Placeholder tiles stay until real photos land.

## Blog

| Step | Detail |
|---|---|
| Topic selection | Pull from three sources: questions the office actually gets, seasonal demand (furnace pre-winter, AC pre-summer), and rebate/regulation changes |
| Angle | Homeowner decision support, never a press release |
| Structure | H1 = the question · intro that answers it in 2 sentences · 3–5 H2 sections · a short "what we'd do" close |
| Internal linking | Every post links to at least one service page and one location page with a descriptive anchor |
| Cadence | 2 posts/month minimum to keep the blog credible |
| Ship check | Title ≤3 lines on desktop; no eyebrow label above the title; author = Leadder Team unless a real byline exists |

## Contact

Real phone, address, and hours from intake. The form is the GHL widget so submissions land in the
sub-account and fire the new-lead workflow (instant text-back). Reviews block + Instant Quote CTA
close the page. No careers block, no logo strip.

## Legal (Privacy Policy / Terms of Service)

Built from the template in `/privacy-policy/` and `/terms-of-service/`. Per client, swap: legal
entity name, address, phone, province/state for governing law, and the SMS consent wording to match
what the client's forms actually say. **Both pages must be reviewed by the client's counsel before
launch** — the shipped versions carry a note saying exactly that. Link them from the footer bar and
from every form consent checkbox.

---

## Per-page QA gate (run before any page ships)

1. H1 present, unique, contains the target keyword once.
2. Meta title ≤60 chars, meta description 140–160 chars, both unique.
3. Canonical points at the live folder URL with a trailing slash.
4. Every visible FAQ question/answer matches the FAQPage schema exactly.
5. No placeholder text, no lorem, no `href="#"` outside intentional anchors.
6. All internal links resolve (no 404s) and use descriptive anchors.
7. Images have real alt text and explicit dimensions; no stock photos posing as project work.
8. Instant Quote CTA opens the modal on desktop and mobile.
9. No horizontal scroll at 320/375/390/768/1024/1440.
10. No claim on the page that the intake pack cannot evidence.
