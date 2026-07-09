"""
generate_ai_logos.py

For every row in `flagged_logos` with ai_logo_status = 'PENDING':
  1. Generates a logo via OpenRouter (bytedance-seed/seedream-4.5)
  2. Uploads the PNG to Supabase Storage (bucket: logos)
  3. Updates flagged_logos.ai_logo_url + ai_logo_status = 'SUCCESS'
  4. Updates leads.logo_url with the new AI logo URL
  5. Sets leads.style_status = 'NEEDS_REPROCESS' so extract_styles
     re-extracts colors from the new logo on next run

Run: venv/bin/python generate_ai_logos.py
"""

import base64
import io
import os
import time
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client
from PIL import Image
from datetime import datetime, timezone

load_dotenv()

SUPABASE_URL     = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
STORAGE_BUCKET   = "logos"
RATE_LIMIT_S     = 2   # between API calls


def build_prompt(business_name: str, category: str = "") -> str:
    service = category if category else "HVAC"
    return (
        f"Professional business logo for '{business_name}', a {service} company. "
        "Clean, simple, modern vector-style logo. White background. "
        "No text other than a short version of the company name if needed. "
        "High contrast, suitable for printing."
    )


def generate_logo_image(client: OpenAI, prompt: str) -> bytes | None:
    """Calls Seedream and returns raw PNG bytes, or None on failure."""
    try:
        response = client.chat.completions.create(
            model="bytedance-seed/seedream-4.5",
            messages=[{"role": "user", "content": prompt}],
            extra_body={"modalities": ["image"]},
        )
        msg = response.choices[0].message
        if not msg.images:
            return None
        # image_url is a base64 data URL: "data:image/png;base64,<data>"
        data_url = msg.images[0]["image_url"]["url"]
        b64 = data_url.split(",", 1)[1]
        return base64.b64decode(b64)
    except Exception as e:
        print(f"    Generation error: {e}")
        return None


def upload_to_supabase(supabase, slug: str, image_bytes: bytes) -> str | None:
    """Uploads PNG bytes to Supabase Storage and returns the public URL."""
    path = f"{slug}.png"
    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path,
            image_bytes,
            {"content-type": "image/png", "upsert": "true"},
        )
        public_url = supabase.storage.from_(STORAGE_BUCKET).get_public_url(path)
        return public_url
    except Exception as e:
        print(f"    Upload error: {e}")
        return None


def main():
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_key:
        raise SystemExit("OPENROUTER_API_KEY not set in .env")

    ai_client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=openrouter_key,
    )
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    limit = int(os.getenv("LOGO_LIMIT", 0))  # 0 = no limit

    # Fetch PENDING rows
    print(f"Fetching PENDING flagged logos{f' (limit {limit})' if limit else ''}...")
    query = (
        supabase.table("flagged_logos")
        .select("slug,business_name,logo_url")
        .eq("ai_logo_status", "PENDING")
    )
    if limit:
        query = query.limit(limit)
    rows = query.execute().data
    print(f"Found {len(rows)} logos to generate.\n")

    if not rows:
        print("Nothing to do.")
        return

    # Fetch category for each slug (for better prompts)
    slugs = [r["slug"] for r in rows]
    cat_rows = (
        supabase.table("leads")
        .select("slug,category")
        .in_("slug", slugs)
        .execute()
        .data
    )
    slug_to_category = {r["slug"]: r.get("category", "") for r in cat_rows}

    success, failed = 0, 0
    replaced = []  # track successfully replaced logos

    for i, row in enumerate(rows, 1):
        slug      = row["slug"]
        biz_name  = row.get("business_name") or slug.replace("-", " ").title()
        category  = slug_to_category.get(slug, "")

        print(f"[{i}/{len(rows)}] {slug} — generating...")

        # Mark as GENERATING to avoid duplicate runs
        supabase.table("flagged_logos").update(
            {"ai_logo_status": "GENERATING"}
        ).eq("slug", slug).execute()

        prompt     = build_prompt(biz_name, category)
        img_bytes  = generate_logo_image(ai_client, prompt)

        if not img_bytes:
            supabase.table("flagged_logos").update(
                {"ai_logo_status": "FAILED"}
            ).eq("slug", slug).execute()
            print(f"    ✗ generation failed")
            failed += 1
            continue

        public_url = upload_to_supabase(supabase, slug, img_bytes)

        if not public_url:
            supabase.table("flagged_logos").update(
                {"ai_logo_status": "FAILED"}
            ).eq("slug", slug).execute()
            print(f"    ✗ upload failed")
            failed += 1
            continue

        now = datetime.now(timezone.utc).isoformat()

        # Update flagged_logos
        supabase.table("flagged_logos").update({
            "ai_logo_status": "SUCCESS",
            "ai_logo_url":    public_url,
            "generated_at":   now,
        }).eq("slug", slug).execute()

        # Update leads: new logo_url + trigger color reprocess
        supabase.table("leads").update({
            "logo_url":     public_url,
            "style_status": "NEEDS_REPROCESS",
        }).eq("slug", slug).execute()

        replaced.append({
            "slug":      slug,
            "name":      biz_name,
            "new_logo":  public_url,
        })
        print(f"    ✓ {public_url[:80]}...")
        success += 1
        time.sleep(RATE_LIMIT_S)

    print(f"\n── Done ─────────────────────────────────")
    print(f"  Generated:  {success}")
    print(f"  Failed:     {failed}")

    if replaced:
        print(f"\n── Replaced Logos ({'all' if not os.getenv('LOGO_LIMIT') else os.getenv('LOGO_LIMIT')}) ───────────────────────")
        for r in replaced:
            print(f"  • {r['name']:<45} {r['new_logo']}")
        print(f"\nNext steps:")
        print(f"  1. venv/bin/python extract_styles.py   ← re-extract colors from new logos")
        print(f"  2. venv/bin/python update_live_urls.py ← sync sheet")


if __name__ == "__main__":
    main()
