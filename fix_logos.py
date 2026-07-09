"""
fix_logos.py

Single-file logo pipeline. For each lead with a logo_url:
  1. Skip if already successfully replaced (resume safe)
  2. If not a direct image URL → go straight to generation
  3. Send image to vision AI → is it a real company logo?
  4. If not a logo → generate AI replacement via Seedream
  5. Upload PNG to Supabase Storage (logos bucket)
  6. Update leads.logo_url + set style_status = NEEDS_REPROCESS
  7. Record result in flagged_logos table

Cost: vision check = $0 (free NVIDIA model), generation = $0.04/image

Run: venv/bin/python fix_logos.py
"""

import base64
import os
import time
from datetime import datetime, timezone
from openai import OpenAI, RateLimitError
from supabase import create_client

# ── CONFIG ────────────────────────────────────────────────────────────────────
SUPABASE_URL    = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY    = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
STORAGE_BUCKET  = "logos"

VISION_MODEL    = "nvidia/nemotron-nano-12b-v2-vl:free"
GEN_MODEL       = "bytedance-seed/seedream-4.5"

VISION_RATE_S   = 2     # pause between vision checks
GEN_RATE_S      = 2     # pause between generations
RETRY_WAIT_S    = 60    # wait on rate-limit before retry
MAX_RETRIES     = 5

IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg")

VISION_PROMPT = (
    "Look at this image. Is it a company logo or brand mark? "
    "Reply with only YES or NO."
)
# ─────────────────────────────────────────────────────────────────────────────


def get_api_key():
    key = os.getenv("OPENROUTER_API_KEY")
    if key:
        return key
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        for line in open(env_path):
            if line.startswith("OPENROUTER_API_KEY="):
                return line.strip().split("=", 1)[1]
    raise SystemExit("OPENROUTER_API_KEY not found in environment or .env")


def is_image_url(url: str) -> bool:
    path = url.split("?")[0].lower()
    return any(path.endswith(ext) for ext in IMAGE_EXTENSIONS)


def is_logo(client, image_url: str) -> bool | None:
    """
    Returns True = real logo, False = not a logo, None = error/skip.
    """
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = client.chat.completions.create(
                model=VISION_MODEL,
                messages=[{"role": "user", "content": [
                    {"type": "image_url", "image_url": {"url": image_url}},
                    {"type": "text", "text": VISION_PROMPT},
                ]}],
                max_tokens=5,
            )
            answer = resp.choices[0].message.content.strip().upper()
            return answer.startswith("YES")
        except RateLimitError:
            print(f"    Vision rate limited — waiting {RETRY_WAIT_S}s...")
            time.sleep(RETRY_WAIT_S)
        except Exception as e:
            if "400" in str(e) or "Unsupported" in str(e):
                return None  # bad image format, don't retry
            print(f"    Vision error: {e}")
            return None
    return None


def generate_logo(client, business_name: str, category: str) -> bytes | None:
    """Calls Seedream, returns raw PNG bytes or None."""
    service = category if category else "HVAC"
    prompt = (
        f"Professional business logo for '{business_name}', a {service} company. "
        "Clean, simple, modern vector-style. White background. High contrast."
    )
    try:
        resp = client.chat.completions.create(
            model=GEN_MODEL,
            messages=[{"role": "user", "content": prompt}],
            extra_body={"modalities": ["image"]},
        )
        msg = resp.choices[0].message
        if not msg.images:
            return None
        data_url = msg.images[0]["image_url"]["url"]
        return base64.b64decode(data_url.split(",", 1)[1])
    except Exception as e:
        print(f"    Generation error: {e}")
        return None


def upload_logo(supabase, slug: str, image_bytes: bytes) -> str | None:
    """Uploads PNG to Supabase Storage, returns public URL or None."""
    path = f"{slug}.png"
    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path, image_bytes,
            {"content-type": "image/png", "upsert": "true"},
        )
        return supabase.storage.from_(STORAGE_BUCKET).get_public_url(path)
    except Exception as e:
        print(f"    Upload error: {e}")
        return None


def fetch_leads(supabase):
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


def fetch_done_slugs(supabase) -> set:
    """Slugs already successfully replaced — skip on resume."""
    rows = (
        supabase.table("flagged_logos")
        .select("slug")
        .eq("ai_logo_status", "SUCCESS")
        .execute()
        .data
    )
    return {r["slug"] for r in rows}


def save_result(supabase, slug, biz_name, old_url, reason, new_url=None, status="SUCCESS"):
    now = datetime.now(timezone.utc).isoformat()
    supabase.table("flagged_logos").upsert({
        "slug":           slug,
        "business_name":  biz_name,
        "logo_url":       old_url,
        "flag_reason":    reason,
        "ai_logo_status": status,
        "ai_logo_url":    new_url,
        "generated_at":   now if new_url else None,
    }, on_conflict="slug").execute()


def main():
    api_key  = get_api_key()
    client   = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Fetching leads with logo_url...")
    rows = fetch_leads(supabase)
    print(f"Found {len(rows)} leads.\n")

    done_slugs = fetch_done_slugs(supabase)
    print(f"Already replaced (will skip): {len(done_slugs)}\n")

    replaced  = []
    skipped   = 0
    ok_count  = 0
    err_count = 0
    gen_cost  = 0.0

    for i, row in enumerate(rows, 1):
        slug     = row["slug"]
        logo_url = row["logo_url"]
        biz_name = row.get("business_name") or slug.replace("-", " ").title()
        category = row.get("category", "")

        prefix = f"[{i}/{len(rows)}] {slug}"

        # ── Skip already done ─────────────────────────────────────────────
        if slug in done_slugs:
            print(f"{prefix}: already replaced — skip")
            skipped += 1
            continue

        # ── Step 1: Check if it's even an image URL ───────────────────────
        if not is_image_url(logo_url):
            print(f"{prefix}: not an image URL — generating...")
            reason = "not_image_url"
        else:
            # ── Step 2: Vision AI check ───────────────────────────────────
            result = is_logo(client, logo_url)
            time.sleep(VISION_RATE_S)

            if result is True:
                print(f"{prefix}: logo ✓ — keeping")
                ok_count += 1
                continue
            elif result is None:
                print(f"{prefix}: vision error — skipping")
                err_count += 1
                continue
            else:
                print(f"{prefix}: NOT a logo — generating...")
                reason = "vision_ai_not_logo"

        # ── Step 3: Generate AI logo ──────────────────────────────────────
        img_bytes = generate_logo(client, biz_name, category)
        gen_cost += 0.04

        if not img_bytes:
            print(f"    ✗ generation failed")
            save_result(supabase, slug, biz_name, logo_url, reason, status="FAILED")
            err_count += 1
            time.sleep(GEN_RATE_S)
            continue

        # ── Step 4: Upload ────────────────────────────────────────────────
        new_url = upload_logo(supabase, slug, img_bytes)

        if not new_url:
            print(f"    ✗ upload failed")
            save_result(supabase, slug, biz_name, logo_url, reason, status="FAILED")
            err_count += 1
            time.sleep(GEN_RATE_S)
            continue

        # ── Step 5: Update leads table ────────────────────────────────────
        supabase.table("leads").update({
            "logo_url":     new_url,
            "style_status": "NEEDS_REPROCESS",
        }).eq("slug", slug).execute()

        # ── Step 6: Save record ───────────────────────────────────────────
        save_result(supabase, slug, biz_name, logo_url, reason, new_url, "SUCCESS")

        replaced.append({"slug": slug, "name": biz_name, "url": new_url})
        print(f"    ✓ replaced → {new_url[:70]}...")
        time.sleep(GEN_RATE_S)

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{'='*55}")
    print(f"  Total leads scanned:  {len(rows)}")
    print(f"  Already done (skip):  {skipped}")
    print(f"  Real logos (kept):    {ok_count}")
    print(f"  Replaced with AI:     {len(replaced)}")
    print(f"  Errors/skipped:       {err_count}")
    print(f"  Generation cost:      ${gen_cost:.2f}")
    print(f"{'='*55}")

    if replaced:
        print(f"\n── Replaced Logos ───────────────────────────────────")
        for r in replaced:
            print(f"  • {r['name']:<45} {r['url']}")
        print(f"\nNext step:")
        print(f"  venv/bin/python extract_styles.py  ← re-extract colors from new logos")


if __name__ == "__main__":
    main()
