"""
update_live_urls.py

For every lead in Supabase with style_status='SUCCESS' and live_url=NULL:
  - Sets live_url = 'https://localgrowthstudio.com/<slug>'
  - Updates Supabase
  - Writes the URL back to the Google Sheet (matched by scrape_code)

Run: venv/bin/python update_live_urls.py
"""

import os
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

BASE_URL     = "https://www.leadder.tech/"
SUPABASE_URL = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
BATCH_SIZE   = 200
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
        raise SystemExit(
            f"No credentials found. Place '{OAUTH_CLIENT_FILE}' here and re-run."
        )

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


# ── SHEET HELPERS ─────────────────────────────────────────────────────────────

def get_or_create_col(ws, headers, name):
    key = name.strip().lower()
    for i, h in enumerate(headers):
        if h.strip().lower() == key:
            return i + 1  # 1-based
    ws.add_cols(1)
    col = len(headers) + 1
    ws.update_cell(1, col, name)
    headers.append(name)
    return col


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Fetch ALL leads that have a live_url in Supabase (paginate past 1000-row limit)
    print("Fetching all leads with live_url from Supabase...")
    rows = []
    offset = 0
    while True:
        batch = (
            supabase.table("leads")
            .select("slug,scrape_code,live_url")
            .not_.is_("live_url", "null")
            .neq("live_url", "")
            .range(offset, offset + 999)
            .execute()
            .data
        )
        rows.extend(batch)
        if len(batch) < 1000:
            break
        offset += 1000

    print(f"Found {len(rows)} leads with live_url in Supabase.\n")

    if not rows:
        print("Nothing to do.")
        return

    # Build two lookup dicts for matching sheet rows
    slug_to_url = {r["slug"]: r["live_url"] for r in rows if r.get("slug")}
    code_to_url = {r["scrape_code"]: r["live_url"] for r in rows if r.get("scrape_code")}

    # Update Google Sheet
    print("Connecting to Google Sheets...")
    client = gspread.authorize(get_credentials())
    ws     = client.open(SPREADSHEET_NAME).worksheet(WORKSHEET_NAME)

    all_values  = ws.get_all_values()
    raw_headers = all_values[0]
    headers     = [h.strip().lower() for h in raw_headers]
    data_rows   = all_values[1:]

    col_live = get_or_create_col(ws, list(raw_headers), "live_url")

    idx_slug   = headers.index("slug")        if "slug"        in headers else None
    idx_scrape = headers.index("scrape_code") if "scrape_code" in headers else None

    sheet_updates = []
    matched = 0
    for i, row in enumerate(data_rows):
        live_url = None

        # Match by slug first (most reliable), fall back to scrape_code
        if idx_slug is not None:
            slug = row[idx_slug].strip() if idx_slug < len(row) else ""
            live_url = slug_to_url.get(slug)

        if not live_url and idx_scrape is not None:
            code = row[idx_scrape].strip() if idx_scrape < len(row) else ""
            live_url = code_to_url.get(code)

        if live_url:
            sheet_row = i + 2
            sheet_updates.append({
                "range":  gspread.utils.rowcol_to_a1(sheet_row, col_live),
                "values": [[live_url]],
            })
            matched += 1

    if sheet_updates:
        print(f"Writing {matched} live URLs to Google Sheet...")
        for i in range(0, len(sheet_updates), 500):
            ws.batch_update(sheet_updates[i:i + 500])
            print(f"  {min(i + 500, len(sheet_updates))}/{len(sheet_updates)} written...")
        print("  Sheet updated.")
    else:
        print("  No matching rows found in sheet.")

    print(f"\nDone. {matched} live URLs written to Google Sheet.")


if __name__ == "__main__":
    main()
