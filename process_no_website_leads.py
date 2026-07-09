"""
process_no_website_leads.py

Reads leads from Google Sheet where has_website=FALSE (or blank) and
color_primary is empty. Assigns curated professional color palettes,
generates slugs, sets live_url, writes colors + slug back to the sheet,
and upserts everything to Supabase.

Run: venv/bin/python process_no_website_leads.py
"""

import os
import re
from datetime import datetime, timezone, timedelta

import gspread
from google.oauth2.credentials import Credentials as OAuthCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from supabase import create_client

# ── CONFIG ────────────────────────────────────────────────────────────────────
SPREADSHEET_NAME  = "HVAC Leads"
WORKSHEET_NAME    = "USA"
OAUTH_CLIENT_FILE = "oauth_client.json"
OAUTH_TOKEN_FILE  = "oauth_token.json"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

BASE_URL        = "https://www.leadder.tech/"
SUPABASE_URL    = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
EXPIRES_IN_DAYS = 30
BATCH_SIZE      = 100
# ─────────────────────────────────────────────────────────────────────────────


# ── 8 CURATED PALETTES ────────────────────────────────────────────────────────
# All primaries are dark (L<40%), all accents pass 4.5:1 contrast vs primary.
# text_on_accent computed from accent lightness.
PALETTES = [
    {   # 1 · Deep Navy + Gold — trust & professionalism
        "color_primary":         "#0f2744",
        "color_secondary":       "#1e4080",
        "color_accent":          "#e8a020",
        "color_primary_light":   "#1e3a5f",
        "color_text_on_primary": "#ffffff",
        "color_text_on_accent":  "#1a1a1a",
    },
    {   # 2 · Forest Green + Amber — natural & reliable
        "color_primary":         "#1b3a2d",
        "color_secondary":       "#2d5a3d",
        "color_accent":          "#d4901a",
        "color_primary_light":   "#2d5040",
        "color_text_on_primary": "#ffffff",
        "color_text_on_accent":  "#1a1a1a",
    },
    {   # 3 · Dark Teal + Gold — sophisticated & calm
        "color_primary":         "#0d3333",
        "color_secondary":       "#1a5555",
        "color_accent":          "#d4a820",
        "color_primary_light":   "#1a4444",
        "color_text_on_primary": "#ffffff",
        "color_text_on_accent":  "#1a1a1a",
    },
    {   # 4 · Slate Blue + Burnt Orange — modern & energetic
        "color_primary":         "#1a2a4a",
        "color_secondary":       "#2d4a7a",
        "color_accent":          "#e87020",
        "color_primary_light":   "#2d3f6b",
        "color_text_on_primary": "#ffffff",
        "color_text_on_accent":  "#ffffff",
    },
    {   # 5 · Charcoal + Sky Blue — clean & corporate
        "color_primary":         "#1e2530",
        "color_secondary":       "#2d3a4a",
        "color_accent":          "#3aa8d8",
        "color_primary_light":   "#2d3a50",
        "color_text_on_primary": "#ffffff",
        "color_text_on_accent":  "#1a1a1a",
    },
    {   # 6 · Deep Burgundy + Gold — premium & warm
        "color_primary":         "#3d1a1a",
        "color_secondary":       "#6b2e2e",
        "color_accent":          "#e8c058",
        "color_primary_light":   "#5a2a2a",
        "color_text_on_primary": "#ffffff",
        "color_text_on_accent":  "#1a1a1a",
    },
    {   # 7 · Dark Olive + Copper — earthy & trustworthy
        "color_primary":         "#2a3020",
        "color_secondary":       "#3d4a2d",
        "color_accent":          "#c87830",
        "color_primary_light":   "#3d4a30",
        "color_text_on_primary": "#ffffff",
        "color_text_on_accent":  "#ffffff",
    },
    {   # 8 · Deep Purple + Bright Yellow — bold & distinctive
        "color_primary":         "#2a1a4a",
        "color_secondary":       "#3d2a6b",
        "color_accent":          "#e8d030",
        "color_primary_light":   "#3a2a65",
        "color_text_on_primary": "#ffffff",
        "color_text_on_accent":  "#1a1a1a",
    },
]
# ─────────────────────────────────────────────────────────────────────────────


# ── AUTH ─────────────────────────────────────────────────────────────────────

def get_credentials():
    creds = None
    if os.path.exists(OAUTH_TOKEN_FILE):
        creds = OAuthCredentials.from_authorized_user_file(OAUTH_TOKEN_FILE, SCOPES)
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        creds.refresh(Request())
        _save_token(creds)
        return creds
    if not os.path.exists(OAUTH_CLIENT_FILE):
        raise SystemExit(f"No credentials found. Place '{OAUTH_CLIENT_FILE}' here and re-run.")
    flow = InstalledAppFlow.from_client_secrets_file(OAUTH_CLIENT_FILE, SCOPES)
    flow.redirect_uri = "http://localhost:8080"
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    print(f"\nOpen this URL to authorise:\n  {auth_url}\n")
    redirect_url = input("Paste the full redirect URL: ").strip()
    flow.fetch_token(authorization_response=redirect_url)
    creds = flow.credentials
    _save_token(creds)
    return creds


def _save_token(creds):
    with open(OAUTH_TOKEN_FILE, "w") as f:
        f.write(creds.to_json())


# ── HELPERS ───────────────────────────────────────────────────────────────────

def make_slug(name):
    slug = name.lower()
    slug = re.sub(r"[\s\W]+", "-", slug)
    slug = re.sub(r"[^a-z0-9-]", "", slug)
    return slug.strip("-")[:50]


def get_or_create_col(ws, headers, name):
    clean = [h.strip().lower() for h in headers]
    try:
        return clean.index(name.lower()) + 1
    except ValueError:
        new_idx = len(headers) + 1
        ws.update_cell(1, new_idx, name)
        headers.append(name)
        return new_idx


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("Connecting to Google Sheets...")
    client = gspread.authorize(get_credentials())
    ws     = client.open(SPREADSHEET_NAME).worksheet(WORKSHEET_NAME)

    all_values  = ws.get_all_values()
    raw_headers = all_values[0]
    headers     = [h.strip().lower() for h in raw_headers]
    data_rows   = all_values[1:]

    def col(name):
        try:
            return headers.index(name.lower())
        except ValueError:
            return None

    def cell(row, name):
        i = col(name)
        return row[i].strip() if (i is not None and i < len(row)) else ""

    # Output columns (create if missing)
    mutable_headers = list(raw_headers)
    out_primary       = get_or_create_col(ws, mutable_headers, "color_primary")
    out_secondary     = get_or_create_col(ws, mutable_headers, "color_secondary")
    out_accent        = get_or_create_col(ws, mutable_headers, "color_accent")
    out_primary_light = get_or_create_col(ws, mutable_headers, "color_primary_light")
    out_text_primary  = get_or_create_col(ws, mutable_headers, "color_text_on_primary")
    out_text_accent   = get_or_create_col(ws, mutable_headers, "color_text_on_accent")
    out_slug          = get_or_create_col(ws, mutable_headers, "slug")
    out_live_url      = get_or_create_col(ws, mutable_headers, "live_url")
    out_status        = get_or_create_col(ws, mutable_headers, "style_status")

    # Eligible: no website, not yet processed
    eligible = [
        (i + 2, row)
        for i, row in enumerate(data_rows)
        if cell(row, "has_website").upper() in ("FALSE", "")
        and not cell(row, "color_primary")
        and cell(row, "business_name")
    ]

    total = len(eligible)
    print(f"Found {total} no-website leads to process.\n")
    if total == 0:
        print("Nothing to do.")
        return

    expires_at = (datetime.now(timezone.utc) + timedelta(days=EXPIRES_IN_DAYS)).isoformat()

    # Build records + sheet updates
    supabase_rows   = []
    sheet_updates   = []
    seen_slugs      = {}
    palette_counter = 0

    for sheet_row, row in eligible:
        business_name = cell(row, "business_name")
        base_slug = make_slug(business_name)

        # Deduplicate slugs within this batch
        if base_slug in seen_slugs:
            seen_slugs[base_slug] += 1
            slug = f"{base_slug}-{seen_slugs[base_slug]}"
        else:
            seen_slugs[base_slug] = 0
            slug = base_slug

        palette  = PALETTES[palette_counter % len(PALETTES)]
        palette_counter += 1
        live_url = BASE_URL + slug

        try:
            rating = float(cell(row, "rating")) if cell(row, "rating") else None
        except ValueError:
            rating = None
        try:
            reviews = int(cell(row, "reviews")) if cell(row, "reviews") else None
        except ValueError:
            reviews = None

        hw = cell(row, "has_website").upper()
        has_website = True if hw == "TRUE" else (False if hw == "FALSE" else None)

        supabase_rows.append({
            "slug":                  slug,
            "scrape_code":           cell(row, "scrape_code") or None,
            "business_name":         business_name or None,
            "phone":                 cell(row, "phone") or None,
            "website":               cell(row, "website") or None,
            "address":               cell(row, "address") or None,
            "category":              cell(row, "category") or None,
            "city":                  cell(row, "city") or None,
            "country":               cell(row, "country") or None,
            "keyword":               cell(row, "keyword") or None,
            "rating":                rating,
            "reviews":               reviews,
            "has_website":           has_website,
            "reason":                cell(row, "reason") or None,
            "color_primary":         palette["color_primary"],
            "color_secondary":       palette["color_secondary"],
            "color_accent":          palette["color_accent"],
            "color_primary_light":   palette["color_primary_light"],
            "color_text_on_primary": palette["color_text_on_primary"],
            "color_text_on_accent":  palette["color_text_on_accent"],
            "logo_url":              None,
            "style_status":          "SUCCESS",
            "live_url":              live_url,
            "expires_at":            expires_at,
        })

        sheet_updates += [
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_primary),       "values": [[palette["color_primary"]]]},
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_secondary),     "values": [[palette["color_secondary"]]]},
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_accent),        "values": [[palette["color_accent"]]]},
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_primary_light), "values": [[palette["color_primary_light"]]]},
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_text_primary),  "values": [[palette["color_text_on_primary"]]]},
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_text_accent),   "values": [[palette["color_text_on_accent"]]]},
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_slug),          "values": [[slug]]},
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_live_url),      "values": [[live_url]]},
            {"range": gspread.utils.rowcol_to_a1(sheet_row, out_status),        "values": [["SUCCESS"]]},
        ]

    # Deduplicate Supabase rows by slug (keep last)
    deduped = list({r["slug"]: r for r in supabase_rows}.values())
    dupes = len(supabase_rows) - len(deduped)
    if dupes:
        print(f"  Deduplicated {dupes} repeated slugs.\n")

    # Upsert to Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    batches  = [deduped[i:i + BATCH_SIZE] for i in range(0, len(deduped), BATCH_SIZE)]
    print(f"Upserting {len(deduped)} rows to Supabase...")
    ok = fail = 0
    for batch_num, batch in enumerate(batches, 1):
        print(f"  Batch {batch_num}/{len(batches)} ({len(batch)} rows)...", end=" ", flush=True)
        try:
            supabase.table("leads").upsert(batch, on_conflict="slug").execute()
            ok += len(batch)
            print("ok")
        except Exception as e:
            print(f"batch failed, retrying row-by-row: {e}")
            for r in batch:
                try:
                    supabase.table("leads").upsert([r], on_conflict="slug").execute()
                    ok += 1
                except Exception as re_:
                    fail += 1
                    print(f"  FAILED slug={r['slug']}: {re_}")

    # Write back to Google Sheet in chunks of 500
    print(f"\nWriting colors + slugs + live URLs to Google Sheet...")
    for i in range(0, len(sheet_updates), 500):
        ws.batch_update(sheet_updates[i:i + 500])
    print("  Sheet updated.")

    print(f"\nDone. {ok} leads inserted, {fail} failed.")


if __name__ == "__main__":
    main()
