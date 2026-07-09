# HVAC Lead Website Automation

Automated pipeline that generates branded landing pages for HVAC leads. Each lead gets a live page at `www.leadder.tech/{slug}` with their logo, brand colors, phone number, and an instant quote form.

---

## Architecture

```
hvac-websites/
├── nextjs-app/          ← Next.js website (deployed on Vercel)
├── *.py                 ← Python automation scripts (run on server)
└── n8n_workflow.json    ← n8n automation workflow
```

**Stack:**
- **Frontend:** Next.js (ISR) → deployed on Vercel → live at `www.leadder.tech`
- **Database:** Supabase (PostgreSQL) — leads, colors, flagged logos, quote requests
- **Storage:** Supabase Storage (bucket: `logos`) — AI-generated PNGs
- **AI Vision:** `nvidia/nemotron-nano-12b-v2-vl:free` via OpenRouter — logo classification
- **AI Image Gen:** `bytedance-seed/seedream-4.5` via OpenRouter — logo generation ($0.04/image)
- **Color Extraction:** ColorThief + Pillow — brand palette from logo
- **Hero Images:** Unsplash API — city/state skyline per lead
- **Quote Form:** Leadder embed (`app.leadder.io/widget/...`) — popup modal on all pages

---

## How It Works

### Full Pipeline (in order)

```
1. Leads scraped → Google Sheet → Supabase (sheet_to_supabase.py)
2. Check logos for quality (check_logo_quality.py)
3. Generate AI logos for bad ones (generate_ai_logos.py)
4. Remove white background from AI logos (make_logos_transparent.py)
5. Extract brand colors from logos (recolor_ai_logos.py / extract_styles.py)
6. Pages go live automatically on Vercel via ISR
```

Or use the combined single-file pipeline:
```
fix_logos.py → does steps 2+3 in one pass
```

For new leads submitted via form (n8n integration):
```
lead_api.py → FastAPI endpoint → scrapes site → extracts colors → saves to Supabase + Sheet
```

---

## Python Scripts

| Script | Purpose |
|--------|---------|
| `sheet_to_supabase.py` | Sync leads from Google Sheet → Supabase |
| `check_logo_quality.py` | AI vision check: is this a real logo? Flags bad ones to `flagged_logos` table |
| `fix_logos.py` | Combined: checks logo quality + generates AI replacement in one pass |
| `generate_ai_logos.py` | Generates AI logos for `PENDING` rows in `flagged_logos` via Seedream |
| `make_logos_transparent.py` | BFS flood-fill to remove white background from AI logos |
| `recolor_ai_logos.py` | Extracts brand colors from AI logos → updates Supabase |
| `extract_styles.py` | Extracts brand colors from lead websites via Playwright + ColorThief |
| `lead_api.py` | FastAPI HTTP endpoint for n8n: accepts lead form submission, scrapes + saves everything |
| `update_live_urls.py` | Syncs `live_url` from Supabase back to Google Sheet |
| `flag_for_reprocess.py` | Marks leads for color re-extraction |
| `reprocess_colors.py` | Re-runs color extraction on flagged leads |
| `deduplicate.py` | Removes duplicate leads from Supabase |
| `pipeline.py` | End-to-end pipeline runner |
| `process_failed_leads.py` | Retries failed leads |
| `process_no_website_leads.py` | Handles leads without a website |
| `check_headers.py` | Checks HTTP headers of lead websites |
| `migrate_domain.py` | Updates live URLs after domain change |

---

## Supabase Tables

| Table | Purpose |
|-------|---------|
| `leads` | All lead data — name, phone, city, colors, logo, live URL |
| `flagged_logos` | Logos flagged for AI replacement — tracks PENDING/GENERATING/SUCCESS/FAILED |
| `quote_requests` | Form submissions from the "Get Your Instant Quote" button |

**Supabase Storage:** bucket `logos` — AI-generated transparent PNGs at `{slug}.png`

---

## Next.js App (`nextjs-app/`)

Single dynamic route `pages/[slug].js` generates a branded page per lead using ISR (revalidates every hour).

**Features:**
- Brand colors injected as CSS variables from Supabase
- Logo displayed in navbar (transparent background)
- Hero image from Unsplash (searches city → state fallback)
- Per-slug hero image overrides (pinned photos)
- "Get Your Instant Quote" button opens Leadder quote modal
- Mobile-responsive with sticky bottom CTA bar
- 5-star reviews + rating from Google

**Deploy:** Vercel auto-deploys on every push to `main`.

---

## Environment Variables

### Python scripts (`.env` in root)
```
OPENROUTER_API_KEY=sk-or-...
LEAD_API_KEY=your-secret-key
```

### Next.js (`nextjs-app/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
UNSPLASH_ACCESS_KEY=your-key
UNSPLASH_SECRET_KEY=your-key
REVALIDATE_SECRET=your-secret
OPENROUTER_API_KEY=sk-or-...
```

---

## Running the Scripts

```bash
# Setup (first time)
python3 -m venv venv
venv/bin/pip install fastapi uvicorn colorthief pillow requests supabase openai python-dotenv gspread google-auth google-auth-oauthlib playwright numpy

# Check + fix logos (combined)
venv/bin/python fix_logos.py

# Make AI logos transparent
venv/bin/python make_logos_transparent.py

# Extract colors from AI logos
venv/bin/python recolor_ai_logos.py

# Start the lead API (for n8n)
venv/bin/uvicorn lead_api:app --host 0.0.0.0 --port 8000
```

---

## Adding a New Lead Manually

1. Insert into Supabase `leads` table with `slug`, `business_name`, `phone`, `city`, `logo_url`, `website`
2. Run color extraction: `venv/bin/python recolor_ai_logos.py` (if AI logo) or `extract_styles.py`
3. Page goes live at `www.leadder.tech/{slug}` on next visit

---

## Lead API (n8n Integration)

```
POST http://your-server:8000/process-lead
Header: X-API-Key: your-key
Form fields: business_name, phone, website, city, logo (optional file)
```

Returns:
```json
{
  "slug": "company-name",
  "live_url": "https://www.leadder.tech/company-name",
  "status": "SUCCESS",
  "color_primary": "#1b3022",
  "color_secondary": "#2d5a3d",
  "color_accent": "#c8a328",
  "logo_url": "https://..."
}
```
