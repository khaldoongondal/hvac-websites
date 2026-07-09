"""
migrate_domain.py

Replaces the old domain with the new domain in live_url for:
  - Supabase (all leads rows)
  - Google Sheet (live_url column)

Run: venv/bin/python migrate_domain.py
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

OLD_DOMAIN   = "https://localgrowthstudio.com/"
NEW_DOMAIN   = "https://www.leadder.tech/"
SUPABASE_URL = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
BATCH_SIZE   = 200


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


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # ── Step 1: Fetch all rows with the old domain in Supabase ───────────────
    print(f"Fetching leads with old domain from Supabase...")
    rows = []
    offset = 0
    while True:
        batch = (
            supabase.table("leads")
            .select("slug,live_url")
            .like("live_url", f"%localgrowthstudio.com%")
            .range(offset, offset + 999)
            .execute()
            .data
        )
        rows.extend(batch)
        if len(batch) < 1000:
            break
        offset += 1000

    print(f"Found {len(rows)} rows with old domain.\n")

    if not rows:
        print("Nothing to update in Supabase — old domain not found.")
    else:
        # ── Step 2: Build updated payloads and upsert ────────────────────────
        updates = [
            {"slug": r["slug"], "live_url": r["live_url"].replace(OLD_DOMAIN, NEW_DOMAIN)}
            for r in rows
        ]

        print(f"Updating Supabase ({len(updates)} rows)...")
        batches = [updates[i:i + BATCH_SIZE] for i in range(0, len(updates), BATCH_SIZE)]
        for batch_num, batch in enumerate(batches, 1):
            print(f"  Batch {batch_num}/{len(batches)} ({len(batch)} rows)...", end=" ", flush=True)
            supabase.table("leads").upsert(batch, on_conflict="slug").execute()
            print("ok")
        print(f"  Supabase updated.\n")

    # ── Step 3: Update Google Sheet ──────────────────────────────────────────
    print("Connecting to Google Sheets...")
    client = gspread.authorize(get_credentials())
    ws = client.open(SPREADSHEET_NAME).worksheet(WORKSHEET_NAME)

    all_values  = ws.get_all_values()
    raw_headers = all_values[0]
    headers     = [h.strip().lower() for h in raw_headers]
    data_rows   = all_values[1:]

    if "live_url" not in headers:
        print("  No 'live_url' column in sheet — nothing to update.")
        print(f"\nDone.")
        return

    idx_live = headers.index("live_url")

    sheet_updates = []
    for i, row in enumerate(data_rows):
        old_url = row[idx_live].strip() if idx_live < len(row) else ""
        if OLD_DOMAIN in old_url:
            new_url = old_url.replace(OLD_DOMAIN, NEW_DOMAIN)
            sheet_updates.append({
                "range":  gspread.utils.rowcol_to_a1(i + 2, idx_live + 1),
                "values": [[new_url]],
            })

    if sheet_updates:
        print(f"Updating {len(sheet_updates)} rows in Google Sheet...")
        for i in range(0, len(sheet_updates), 500):
            ws.batch_update(sheet_updates[i:i + 500])
            print(f"  {min(i + 500, len(sheet_updates))}/{len(sheet_updates)} written...")
        print("  Sheet updated.")
    else:
        print("  No old-domain URLs found in sheet.")

    print(f"\nDone. Domain migrated from {OLD_DOMAIN} → {NEW_DOMAIN}")


if __name__ == "__main__":
    main()
