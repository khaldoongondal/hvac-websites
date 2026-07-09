"""
make_logos_transparent.py

For every AI-generated logo (flagged_logos.ai_logo_status = 'SUCCESS'):
  - Downloads the PNG from Supabase Storage
  - Removes the white background using BFS flood-fill from corners (PIL + numpy)
  - Re-uploads the transparent PNG to the same path (overwrites in-place)

No API cost. No GPU. Pure Pillow + numpy.

Run: venv/bin/python make_logos_transparent.py
"""

import io
import os
import requests
import tempfile
import numpy as np
from collections import deque
from PIL import Image
from supabase import create_client

SUPABASE_URL     = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
STORAGE_BUCKET   = "logos"
DOWNLOAD_TIMEOUT = 15
WHITE_THRESHOLD  = 235  # pixels above this on all channels = background


def remove_white_bg(img_bytes: bytes) -> bytes:
    """BFS flood-fill from 4 corners to find and erase white background."""
    img = Image.open(io.BytesIO(img_bytes)).convert("RGBA")
    arr = np.array(img, dtype=np.uint8)
    h, w = arr.shape[:2]

    # True where pixel is near-white
    white = (
        (arr[:, :, 0] >= WHITE_THRESHOLD) &
        (arr[:, :, 1] >= WHITE_THRESHOLD) &
        (arr[:, :, 2] >= WHITE_THRESHOLD)
    )

    # BFS from corners — only erases background white, keeps logo-internal white
    bg = np.zeros((h, w), dtype=bool)
    queue = deque()
    for y, x in [(0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)]:
        if white[y, x] and not bg[y, x]:
            bg[y, x] = True
            queue.append((y, x))

    while queue:
        y, x = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and white[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                queue.append((ny, nx))

    arr[bg, 3] = 0  # set alpha = 0 for background pixels

    out = io.BytesIO()
    Image.fromarray(arr).save(out, format="PNG")
    return out.getvalue()


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    print("Fetching AI logos from flagged_logos...")
    rows = (
        supabase.table("flagged_logos")
        .select("slug,business_name,ai_logo_url")
        .eq("ai_logo_status", "SUCCESS")
        .not_.is_("ai_logo_url", "null")
        .execute()
        .data
    )
    print(f"Found {len(rows)} logos.\n")

    success, failed = 0, 0

    for i, row in enumerate(rows, 1):
        slug     = row["slug"]
        biz_name = row.get("business_name", slug)
        logo_url = row["ai_logo_url"]

        print(f"[{i}/{len(rows)}] {biz_name}...", end=" ", flush=True)

        # Download
        try:
            resp = requests.get(logo_url, timeout=DOWNLOAD_TIMEOUT)
            resp.raise_for_status()
            original_bytes = resp.content
        except Exception as e:
            print(f"✗ download: {e}")
            failed += 1
            continue

        # Remove background
        try:
            transparent_bytes = remove_white_bg(original_bytes)
        except Exception as e:
            print(f"✗ processing: {e}")
            failed += 1
            continue

        # Re-upload (same path, overwrites)
        path = f"{slug}.png"
        try:
            supabase.storage.from_(STORAGE_BUCKET).upload(
                path, transparent_bytes,
                {"content-type": "image/png", "upsert": "true"},
            )
            print("✓")
            success += 1
        except Exception as e:
            print(f"✗ upload: {e}")
            failed += 1

    print(f"\n── Done ─────────────────────────────────")
    print(f"  Transparent: {success}")
    print(f"  Failed:      {failed}")


if __name__ == "__main__":
    main()
