"""
flag_for_reprocess.py

Flags all Supabase leads that have a logo_url for color reprocessing:
  - Sets style_status = 'NEEDS_REPROCESS' in Supabase
  - Clears color columns + sets style_status in Google Sheet
    so extract_styles.py picks them up on next run

Run: venv/bin/python flag_for_reprocess.py
"""

import os
import gspread
from google.oauth2.credentials import Credentials as OAuthCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from supabase import create_client

SPREADSHEET_NAME  = "HVAC Leads"
WORKSHEET_NAME    = "USA"
OAUTH_CLIENT_FILE = "oauth_client.json"
OAUTH_TOKEN_FILE  = "oauth_token.json"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

SUPABASE_URL      = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY      = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
SUPABASE_BATCH    = 200
COLOR_COLS = [
    "color_primary", "color_secondary", "color_accent",
    "color_primary_light", "color_text_on_primary", "color_text_on_accent",
]


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


def fetch_all(supabase, query_fn):
    rows = []
    offset = 0
    while True:
        batch = query_fn(offset).execute().data
        rows.extend(batch)
        if len(batch) < 1000:
            break
        offset += 1000
    return rows


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Step 1: Get all leads with a logo_url
    print("Fetching leads with logo_url from Supabase...")
    rows = fetch_all(
        supabase,
        lambda offset: (
            supabase.table("leads")
            .select("slug")
            .not_.is_("logo_url", "null")
            .neq("logo_url", "")
            .range(offset, offset + 999)
        ),
    )
    slugs = [r["slug"] for r in rows]
    print(f"Found {len(slugs)} leads with logo_url.\n")

    if not slugs:
        print("Nothing to flag.")
        return

    # Step 2: Flag in Supabase
    print("Flagging as NEEDS_REPROCESS in Supabase...")
    for i in range(0, len(slugs), SUPABASE_BATCH):
        batch = slugs[i:i + SUPABASE_BATCH]
        supabase.table("leads").update({"style_status": "NEEDS_REPROCESS"}).in_("slug", batch).execute()
        print(f"  Batch {i // SUPABASE_BATCH + 1}: {len(batch)} rows flagged")
    print(f"  Supabase: {len(slugs)} rows flagged.\n")

    # Step 3: Clear color columns + set NEEDS_REPROCESS in Google Sheet
    print("Connecting to Google Sheets...")
    client = gspread.authorize(get_credentials())
    ws = client.open(SPREADSHEET_NAME).worksheet(WORKSHEET_NAME)

    all_values = ws.get_all_values()
    headers    = all_values[0]
    data_rows  = all_values[1:]
    h_lower    = [h.strip().lower() for h in headers]

    def col_idx(name):
        try:
            return h_lower.index(name.lower())
        except ValueError:
            return None

    slug_idx   = col_idx("slug")
    status_idx = col_idx("style_status")
    color_idxs = {c: col_idx(c) for c in COLOR_COLS}

    if slug_idx is None:
        print("No 'slug' column in sheet — skipping sheet update.")
        return

    slug_set     = set(slugs)
    sheet_updates = []
    matched       = 0

    for i, row in enumerate(data_rows):
        sheet_slug = row[slug_idx].strip() if slug_idx < len(row) else ""
        if sheet_slug not in slug_set:
            continue

        row_num = i + 2  # 1-based, skip header
        matched += 1

        if status_idx is not None:
            sheet_updates.append({
                "range":  gspread.utils.rowcol_to_a1(row_num, status_idx + 1),
                "values": [["NEEDS_REPROCESS"]],
            })

        for col_name, cidx in color_idxs.items():
            if cidx is not None:
                sheet_updates.append({
                    "range":  gspread.utils.rowcol_to_a1(row_num, cidx + 1),
                    "values": [[""]],
                })

    print(f"Matched {matched} sheet rows. Writing {len(sheet_updates)} cell updates...")
    for i in range(0, len(sheet_updates), 500):
        ws.batch_update(sheet_updates[i:i + 500])

    print(f"\nDone. {len(slugs)} leads flagged for reprocessing.")
    print("Next steps:")
    print("  1. venv/bin/python extract_styles.py")
    print("  2. venv/bin/python reprocess_colors.py")
    print("  3. venv/bin/python update_live_urls.py")


if __name__ == "__main__":
    main()
