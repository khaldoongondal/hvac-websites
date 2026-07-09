"""
reprocess_colors.py

Reads leads from Supabase where style_status='SUCCESS' but
color_text_on_primary is NULL (derived colors missing), runs
process_color_pack on their existing 3 colors, and fills in
all 6 color columns. Also handles legacy NEEDS_REPROCESS rows.

Run: venv/bin/python reprocess_colors.py
"""

from supabase import create_client
from extract_styles import process_color_pack

SUPABASE_URL = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
BATCH_SIZE = 100


def fetch_all(supabase, query_fn):
    """Paginate past Supabase's 1000-row limit."""
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

    print("Fetching rows with missing derived colors...")
    rows = fetch_all(
        supabase,
        lambda offset: (
            supabase.table("leads")
            .select("slug,color_primary,color_secondary,color_accent")
            .eq("style_status", "SUCCESS")
            .is_("color_text_on_primary", "null")
            .range(offset, offset + 999)
        ),
    )
    print(f"Found {len(rows)} rows to reprocess.\n")

    if not rows:
        print("Nothing to do.")
        return

    ok = 0
    fail = 0
    batches = [rows[i:i + BATCH_SIZE] for i in range(0, len(rows), BATCH_SIZE)]

    for batch_num, batch in enumerate(batches, 1):
        updates = []
        for row in batch:
            try:
                pack = process_color_pack([
                    row.get("color_primary"),
                    row.get("color_secondary"),
                    row.get("color_accent"),
                ])
                updates.append({
                    "slug":                  row["slug"],
                    "color_primary":         pack["color_primary"],
                    "color_secondary":       pack["color_secondary"],
                    "color_accent":          pack["color_accent"],
                    "color_primary_light":   pack["color_primary_light"],
                    "color_text_on_primary": pack["color_text_on_primary"],
                    "color_text_on_accent":  pack["color_text_on_accent"],
                })
            except Exception as e:
                fail += 1
                print(f"  ERROR slug={row['slug']}: {e}")

        if not updates:
            continue

        print(f"Batch {batch_num}/{len(batches)}  ({len(updates)} rows)...", end=" ", flush=True)
        try:
            supabase.table("leads").upsert(updates, on_conflict="slug").execute()
            ok += len(updates)
            print("ok")
        except Exception as e:
            print(f"batch failed, retrying row-by-row: {e}")
            for u in updates:
                try:
                    supabase.table("leads").upsert([u], on_conflict="slug").execute()
                    ok += 1
                except Exception as row_e:
                    fail += 1
                    print(f"  FAILED slug={u['slug']}: {row_e}")

    print(f"\nDone. {ok} updated, {fail} failed.")


if __name__ == "__main__":
    main()
