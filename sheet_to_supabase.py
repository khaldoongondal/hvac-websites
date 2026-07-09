"""
sheet_to_supabase.py

Reads rows with style_status=SUCCESS from Google Sheets (HVAC Leads / USA)
and upserts them into the Supabase 'leads' table.

On conflict of slug, all fields are updated — safe to re-run.

Run: venv/bin/python sheet_to_supabase.py
"""

import os
from datetime import datetime, timezone, timedelta

import gspread
from google.oauth2.credentials import Credentials as OAuthCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from supabase import create_client

# ── CONFIG ───────────────────────────────────────────────────────────────────
SPREADSHEET_NAME  = "HVAC Leads"
WORKSHEET_NAME    = "USA"
OAUTH_CLIENT_FILE = "oauth_client.json"
OAUTH_TOKEN_FILE  = "oauth_token.json"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

SUPABASE_URL = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"

BATCH_SIZE       = 50
EXPIRES_IN_DAYS  = 30
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

    print("\n" + "=" * 70)
    print("GOOGLE AUTHORIZATION REQUIRED")
    print("=" * 70)
    print(f"\n  {auth_url}\n")
    print("Open the URL, authorize, paste the redirect URL below.")
    print("=" * 70 + "\n")

    redirect_url = input("Paste the full redirect URL: ").strip()
    flow.fetch_token(authorization_response=redirect_url)
    creds = flow.credentials
    _save_token(creds)
    return creds


def _save_token(creds):
    with open(OAUTH_TOKEN_FILE, "w") as f:
        f.write(creds.to_json())


# ── SHEET ─────────────────────────────────────────────────────────────────────

def load_sheet_rows():
    client = gspread.authorize(get_credentials())
    ws     = client.open(SPREADSHEET_NAME).worksheet(WORKSHEET_NAME)

    all_values = ws.get_all_values()
    if not all_values:
        raise SystemExit("Sheet is empty.")

    raw_headers = all_values[0]
    headers     = [h.strip().lower() for h in raw_headers]
    data_rows   = all_values[1:]

    def col(name):
        try:
            return headers.index(name.lower())
        except ValueError:
            return None   # optional columns may not exist

    # Input column indices
    idx = {
        "scrape_code":       col("scrape_code"),
        "business_name":     col("business_name"),
        "phone":             col("phone"),
        "website":           col("website"),
        "address":           col("address"),
        "category":          col("category"),
        "city":              col("city"),
        "country":           col("country"),
        "keyword":           col("keyword"),
        "rating":            col("rating"),
        "reviews":           col("reviews"),
        "has_website":       col("has_website"),
        "reason":            col("reason"),
        "color_primary":         col("color_primary"),
        "color_secondary":       col("color_secondary"),
        "color_accent":          col("color_accent"),
        "color_primary_light":   col("color_primary_light"),
        "color_text_on_primary": col("color_text_on_primary"),
        "color_text_on_accent":  col("color_text_on_accent"),
        "logo_url":              col("logo_url"),
        "slug":              col("slug"),
        "style_status":      col("style_status"),
        "style_extracted_at":col("style_extracted_at"),
    }

    required = ["business_name", "website", "slug", "style_status"]
    for r in required:
        if idx[r] is None:
            raise SystemExit(f"Required column '{r}' not found in sheet.")

    def cell(row, key):
        i = idx[key]
        return row[i].strip() if (i is not None and i < len(row)) else ""

    expires_at = (datetime.now(timezone.utc) + timedelta(days=EXPIRES_IN_DAYS)).isoformat()

    rows = []
    for row in data_rows:
        status = cell(row, "style_status")
        slug   = cell(row, "slug")

        if status != "SUCCESS" or not slug:
            continue

        # Type coercions
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

        rows.append({
            "slug":               slug,
            "scrape_code":        cell(row, "scrape_code") or None,
            "business_name":      cell(row, "business_name") or None,
            "phone":              cell(row, "phone") or None,
            "website":            cell(row, "website") or None,
            "address":            cell(row, "address") or None,
            "category":           cell(row, "category") or None,
            "city":               cell(row, "city") or None,
            "country":            cell(row, "country") or None,
            "keyword":            cell(row, "keyword") or None,
            "rating":             rating,
            "reviews":            reviews,
            "has_website":        has_website,
            "reason":             cell(row, "reason") or None,
            "color_primary":         cell(row, "color_primary") or None,
            "color_secondary":       cell(row, "color_secondary") or None,
            "color_accent":          cell(row, "color_accent") or None,
            "color_primary_light":   cell(row, "color_primary_light") or None,
            "color_text_on_primary": cell(row, "color_text_on_primary") or None,
            "color_text_on_accent":  cell(row, "color_text_on_accent") or None,
            "logo_url":              cell(row, "logo_url") or None,
            "style_status":       status,
            "style_extracted_at": cell(row, "style_extracted_at") or None,
            "expires_at":         expires_at,
        })

    # Deduplicate by slug — keep last occurrence (in case of re-scrapes)
    seen = {}
    for record in rows:
        seen[record["slug"]] = record
    deduped = list(seen.values())

    dupes = len(rows) - len(deduped)
    if dupes:
        print(f"  Deduplicated {dupes} rows with repeated slugs.")

    return deduped


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("Connecting to Google Sheets…")
    rows = load_sheet_rows()
    print(f"Found {len(rows)} SUCCESS rows to upsert.\n")

    if not rows:
        print("Nothing to do.")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    total_ok   = 0
    total_fail = 0
    batches    = [rows[i:i + BATCH_SIZE] for i in range(0, len(rows), BATCH_SIZE)]

    for batch_num, batch in enumerate(batches, start=1):
        print(f"Inserting batch {batch_num}/{len(batches)}  ({len(batch)} rows)…")
        try:
            supabase.table("leads").upsert(
                batch,
                on_conflict="slug"
            ).execute()
            total_ok += len(batch)
        except Exception as exc:
            # Batch failed — try rows individually to isolate bad ones
            print(f"  Batch error, retrying row-by-row: {exc}")
            for record in batch:
                try:
                    supabase.table("leads").upsert(
                        [record],
                        on_conflict="slug"
                    ).execute()
                    total_ok += 1
                except Exception as row_exc:
                    total_fail += 1
                    print(f"  FAILED slug={record.get('slug')}: {str(row_exc)[:120]}")

    print(f"\nDone. {total_ok} inserted/updated, {total_fail} failed.")


if __name__ == "__main__":
    main()
