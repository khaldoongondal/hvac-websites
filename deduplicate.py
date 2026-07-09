"""
deduplicate.py

Deduplicates leads by phone number across both Google Sheet and Supabase.
For each group of rows sharing a phone number, keeps the single best row
(scored by data completeness) and permanently deletes the rest.

Scoring (higher = better):
  website present      +3
  style_status=SUCCESS +3
  has_website=TRUE     +2
  address present      +2
  rating present       +2
  logo_url present     +2
  reviews present      +1
  category present     +1

Run: venv/bin/python deduplicate.py
"""

import os
import re
from collections import defaultdict

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

SUPABASE_URL = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
SUPABASE_DELETE_BATCH = 200
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
        raise SystemExit(f"No credentials found. Place '{OAUTH_CLIENT_FILE}' here.")
    flow = InstalledAppFlow.from_client_secrets_file(OAUTH_CLIENT_FILE, SCOPES)
    flow.redirect_uri = "http://localhost:8080"
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")
    print(f"\nOpen this URL:\n  {auth_url}\n")
    redirect_url = input("Paste the full redirect URL: ").strip()
    flow.fetch_token(authorization_response=redirect_url)
    creds = flow.credentials
    _save_token(creds)
    return creds


def _save_token(creds):
    with open(OAUTH_TOKEN_FILE, "w") as f:
        f.write(creds.to_json())


# ── HELPERS ───────────────────────────────────────────────────────────────────

def normalize_phone(phone):
    return re.sub(r"\D", "", phone)


def score_row(row, headers):
    def cell(name):
        try:
            i = [h.strip().lower() for h in headers].index(name.lower())
            return row[i].strip() if i < len(row) else ""
        except ValueError:
            return ""

    s = 0
    if cell("website"):                              s += 3
    if cell("style_status") == "SUCCESS":            s += 3
    if cell("has_website").upper() == "TRUE":        s += 2
    if cell("address"):                              s += 2
    if cell("rating"):                               s += 2
    if cell("logo_url"):                             s += 2
    if cell("reviews"):                              s += 1
    if cell("category"):                             s += 1
    return s


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    # ── Step 1: Load sheet ────────────────────────────────────────────────────
    print("Connecting to Google Sheets...")
    client = gspread.authorize(get_credentials())
    ws     = client.open(SPREADSHEET_NAME).worksheet(WORKSHEET_NAME)

    all_values = ws.get_all_values()
    headers    = all_values[0]
    data_rows  = all_values[1:]
    h_lower    = [h.strip().lower() for h in headers]

    def col(name):
        try: return h_lower.index(name.lower())
        except ValueError: return None

    def cell(row, name):
        i = col(name)
        return row[i].strip() if (i is not None and i < len(row)) else ""

    print(f"Loaded {len(data_rows)} data rows.\n")

    # ── Step 2: Group by phone ────────────────────────────────────────────────
    phone_groups = defaultdict(list)
    no_phone_rows = []

    for i, row in enumerate(data_rows):
        phone = normalize_phone(cell(row, "phone"))
        sheet_row_idx = i + 2  # 1-based, skip header
        if phone:
            phone_groups[phone].append((sheet_row_idx, row))
        else:
            no_phone_rows.append(sheet_row_idx)

    dupes = {p: rows for p, rows in phone_groups.items() if len(rows) > 1}
    print(f"Phones with duplicates: {len(dupes)}")
    total_extra = sum(len(v) - 1 for v in dupes.values())
    print(f"Rows to delete:         {total_extra}\n")

    if not dupes:
        print("Nothing to do — no duplicates found.")
        return

    # ── Step 3: Pick winners, collect losers ──────────────────────────────────
    rows_to_delete   = []   # sheet row indices (1-based)
    slugs_to_delete  = []   # Supabase slugs to remove

    for phone, group in dupes.items():
        # Score each row; highest score wins; tie = keep first occurrence
        scored = sorted(group, key=lambda x: score_row(x[1], headers), reverse=True)
        winner_idx, winner_row = scored[0]

        for sheet_idx, row in scored[1:]:
            rows_to_delete.append(sheet_idx)
            slug = cell(row, "slug")
            if slug:
                slugs_to_delete.append(slug)

    print(f"Winner rows kept:    {len(dupes)}")
    print(f"Loser rows (sheet):  {len(rows_to_delete)}")
    print(f"Loser slugs (supa):  {len(slugs_to_delete)}\n")

    # ── Step 4: Delete from Supabase ──────────────────────────────────────────
    if slugs_to_delete:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        batches  = [slugs_to_delete[i:i + SUPABASE_DELETE_BATCH]
                    for i in range(0, len(slugs_to_delete), SUPABASE_DELETE_BATCH)]
        print(f"Deleting {len(slugs_to_delete)} duplicate rows from Supabase...")
        deleted_total = 0
        for batch_num, batch in enumerate(batches, 1):
            print(f"  Batch {batch_num}/{len(batches)} ({len(batch)} slugs)...", end=" ", flush=True)
            supabase.table("leads").delete().in_("slug", batch).execute()
            deleted_total += len(batch)
            print("ok")
        print(f"  Supabase: {deleted_total} rows deleted.\n")

    # ── Step 5: Delete from Google Sheet (descending to preserve indices) ─────
    print(f"Deleting {len(rows_to_delete)} duplicate rows from Google Sheet...")
    sorted_desc = sorted(rows_to_delete, reverse=True)

    # Use Sheets API batchUpdate — sends all deletes in one round-trip
    requests = [
        {
            "deleteDimension": {
                "range": {
                    "sheetId":    ws.id,
                    "dimension":  "ROWS",
                    "startIndex": idx - 1,  # 0-based
                    "endIndex":   idx,
                }
            }
        }
        for idx in sorted_desc
    ]

    # Sheets API allows max 1000 requests per batchUpdate call
    CHUNK = 1000
    for i in range(0, len(requests), CHUNK):
        chunk = requests[i:i + CHUNK]
        print(f"  Sheet batch {i // CHUNK + 1}/{(len(requests) - 1) // CHUNK + 1} ({len(chunk)} deletes)...", end=" ", flush=True)
        ws.spreadsheet.batch_update({"requests": chunk})
        print("ok")

    # ── Step 6: Summary ───────────────────────────────────────────────────────
    remaining = len(data_rows) - len(rows_to_delete)
    print(f"\n{'=' * 50}")
    print(f"  Done.")
    print(f"  Sheet rows before: {len(data_rows)}")
    print(f"  Sheet rows after:  {remaining}")
    print(f"  Duplicates removed: {len(rows_to_delete)}")
    print(f"  Supabase rows deleted: {len(slugs_to_delete)}")
    print(f"{'=' * 50}")


if __name__ == "__main__":
    main()
