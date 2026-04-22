# HVAC Lead Preview — Next.js App

Dynamic preview pages for HVAC leads, branded with each business's colors.

## Local Development

```bash
cd nextjs-app
npm install
npm run dev
# → http://localhost:3000/{slug}
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only, bypasses RLS) |

## Supabase Setup

The app reads from a `leads` table. Ensure the table exists (see `sheet_to_supabase.py`).

If using RLS, either:
- Add a policy: `allow select for anon` on `leads`  
- Or set `SUPABASE_SERVICE_ROLE_KEY` (recommended — already in `.env.local`)

## Deploy to Vercel

```bash
npm i -g vercel
vercel
# Add env vars in Vercel dashboard → Settings → Environment Variables
```

## How It Works

- `GET /{slug}` → fetches lead from Supabase → renders branded HVAC page
- If slug not found or `expires_at` is past → shows 404 page
- Colors from `color_primary/secondary/accent` are injected as CSS variables
- Logo shown in nav if `logo_url` is present
- All CTAs link to `tel:{phone}`
- `noindex, nofollow` prevents Google indexing of preview pages
