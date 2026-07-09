"""
check_logo_quality.py

Uses nvidia/nemotron-nano-12b-v2-vl:free (via OpenRouter) to classify
each logo URL as a real logo or not. Non-logos are inserted into the
`flagged_logos` table for AI regeneration.

Cost: $0.00 — confirmed free model.
No GPU required.

Run: venv/bin/python check_logo_quality.py
"""

import os
import time
from openai import OpenAI, RateLimitError
from supabase import create_client

SUPABASE_URL = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"

VISION_MODEL  = "nvidia/nemotron-nano-12b-v2-vl:free"
RATE_LIMIT_S  = 2      # pause between requests
RETRY_WAIT_S  = 60     # wait on rate-limit error before retrying
MAX_RETRIES   = 5
BATCH_SIZE    = 200

CLASSIFY_PROMPT = (
    "Look at this image. Is it a company logo or brand mark? "
    "Reply with only YES or NO."
)

IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")

def is_image_url(url: str) -> bool:
    """Returns True if the URL looks like a direct image file."""
    path = url.split("?")[0].lower()
    return any(path.endswith(ext) for ext in IMAGE_EXTENSIONS)


def fetch_all_logos(supabase):
    rows, offset = [], 0
    while True:
        batch = (
            supabase.table("leads")
            .select("slug,business_name,logo_url,category")
            .not_.is_("logo_url", "null")
            .neq("logo_url", "")
            .range(offset, offset + 999)
            .execute()
            .data
        )
        rows.extend(batch)
        if len(batch) < 1000:
            break
        offset += 1000
    return rows


def classify_logo(client, image_url):
    """
    Returns True  → real logo (keep)
            False → not a logo (flag)
            None  → unrecoverable error (skip)
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            response = client.chat.completions.create(
                model=VISION_MODEL,
                messages=[{
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": image_url}},
                        {"type": "text",      "text": CLASSIFY_PROMPT},
                    ],
                }],
                max_tokens=5,
            )
            answer = response.choices[0].message.content.strip().upper()
            cost   = response.usage.model_dump().get("cost", 0)
            return answer.startswith("YES"), cost

        except RateLimitError:
            print(f"    Rate limited — waiting {RETRY_WAIT_S}s (attempt {attempt}/{MAX_RETRIES})...")
            time.sleep(RETRY_WAIT_S)

        except Exception as e:
            msg = str(e)
            if "400" in msg or "Unsupported" in msg or "unreadable" in msg:
                # Bad image format — no point retrying
                return None, 0
            print(f"    Error: {e}")
            return None, 0

    print(f"    Giving up after {MAX_RETRIES} retries.")
    return None, 0


def main():
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        # Try reading directly from .env file
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        if os.path.exists(env_path):
            for line in open(env_path):
                if line.startswith("OPENROUTER_API_KEY="):
                    api_key = line.strip().split("=", 1)[1]
                    break
    if not api_key:
        raise SystemExit("OPENROUTER_API_KEY not found in environment or .env")

    ai_client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
    supabase  = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Fetching all leads with logo_url from Supabase...")
    rows = fetch_all_logos(supabase)
    print(f"Found {len(rows)} leads with logos.\n")

    ok_count   = 0
    err_count  = 0
    flag_count = 0
    total_cost = 0.0

    # Fetch already-processed slugs so a restart skips completed rows
    done_slugs = set(
        r["slug"] for r in
        supabase.table("flagged_logos").select("slug").execute().data
    )
    # Also need to track ok slugs — we'll use a simple local set since ok rows
    # aren't written to Supabase (only flagged ones are stored)

    for i, row in enumerate(rows, 1):
        slug     = row["slug"]
        logo_url = row["logo_url"]
        biz_name = row.get("business_name", "")

        # Resume support: skip slugs already saved from a previous run
        if slug in done_slugs:
            print(f"[{i}/{len(rows)}] {slug}: already processed — skip")
            continue

        # Non-image URLs → flag immediately, no API call needed
        if not is_image_url(logo_url):
            record = {
                "slug":           slug,
                "business_name":  biz_name,
                "logo_url":       logo_url,
                "flag_reason":    "not_image_url",
                "ai_logo_status": "PENDING",
            }
            supabase.table("flagged_logos").upsert(record, on_conflict="slug").execute()
            flag_count += 1
            print(f"[{i}/{len(rows)}] {slug}: not an image URL — flagged & saved")
            continue

        result, cost = classify_logo(ai_client, logo_url)
        total_cost  += cost or 0

        if result is True:
            ok_count += 1
            status = "logo ✓"
        elif result is False:
            record = {
                "slug":           slug,
                "business_name":  biz_name,
                "logo_url":       logo_url,
                "flag_reason":    "vision_ai_not_logo",
                "ai_logo_status": "PENDING",
            }
            supabase.table("flagged_logos").upsert(record, on_conflict="slug").execute()
            flag_count += 1
            status = "NOT a logo — flagged & saved"
        else:
            err_count += 1
            status = "error — skipped"

        print(f"[{i}/{len(rows)}] {slug}: {status}  (flagged={flag_count}, cost=${total_cost:.6f})")
        time.sleep(RATE_LIMIT_S)

    print(f"\n── Results ──────────────────────────────")
    print(f"  Real logos:   {ok_count}")
    print(f"  Flagged:      {flag_count}")
    print(f"  Errors:       {err_count}")
    print(f"  Total:        {len(rows)}")
    print(f"  Total cost:   ${total_cost:.6f}")
    print(f"\nDone. Run generate_ai_logos.py to replace flagged logos.")


if __name__ == "__main__":
    main()
