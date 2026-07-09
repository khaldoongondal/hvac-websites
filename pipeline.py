"""
pipeline.py

Runs the full lead processing pipeline in sequence:
  1. extract_styles.py   — scrape websites, extract colors + logo
  2. sheet_to_supabase.py — sync Google Sheet → Supabase
  3. reprocess_colors.py  — derive 3 color helpers for new rows
  4. update_live_urls.py  — write live URLs to Supabase + sheet

Run: venv/bin/python pipeline.py
"""

import subprocess
import sys
import time

PYTHON = sys.executable

STEPS = [
    ("Step 1/4 — Extract styles from websites",     "extract_styles.py"),
    ("Step 2/4 — Sync Google Sheet → Supabase",     "sheet_to_supabase.py"),
    ("Step 3/4 — Derive color helpers (Supabase)",  "reprocess_colors.py"),
    ("Step 4/4 — Write live URLs",                  "update_live_urls.py"),
]


def run_step(label, script):
    bar = "─" * 60
    print(f"\n{bar}")
    print(f"  {label}")
    print(f"{bar}\n")

    start = time.time()
    result = subprocess.run([PYTHON, script])
    elapsed = time.time() - start

    if result.returncode != 0:
        print(f"\n✗ {script} exited with code {result.returncode}. Pipeline stopped.")
        sys.exit(result.returncode)

    print(f"\n  Completed in {elapsed:.1f}s")


def main():
    total_start = time.time()
    print("=" * 60)
    print("  LEAD PROCESSING PIPELINE")
    print("=" * 60)

    for label, script in STEPS:
        run_step(label, script)

    total = time.time() - total_start
    print(f"\n{'=' * 60}")
    print(f"  Pipeline complete in {total:.0f}s")
    print(f"{'=' * 60}\n")


if __name__ == "__main__":
    main()
