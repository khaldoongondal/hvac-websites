"""
recolor_ai_logos.py

For every lead that had its logo replaced by an AI logo (flagged_logos.ai_logo_status = 'SUCCESS'):
  - Downloads the AI logo from Supabase Storage
  - Runs ColorThief to extract brand colors
  - Updates color_primary/secondary/accent/etc in Supabase
  - Sets style_status = 'SUCCESS'

No Playwright. No Google Sheets. No website visiting.

Run: venv/bin/python recolor_ai_logos.py
"""

import io
import os
import colorsys
import requests
import tempfile
from colorthief import ColorThief
from PIL import Image
from supabase import create_client

SUPABASE_URL     = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
COLOR_PALETTE_N  = 6
DOWNLOAD_TIMEOUT = 15


# ── Color helpers (same logic as extract_styles.py) ───────────────────────────

def rgb_to_hex(r, g, b):
    return "#{:02x}{:02x}{:02x}".format(r, g, b)

def hex_to_rgb(h):
    h = h.lstrip('#')
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)

def _to_hsl(hex_color):
    r, g, b = hex_to_rgb(hex_color)
    h, l, s = colorsys.rgb_to_hls(r/255, g/255, b/255)
    return h*360, s*100, l*100

def _relative_luminance(r, g, b):
    def lin(c):
        c /= 255
        return c/12.92 if c <= 0.04045 else ((c+0.055)/1.055)**2.4
    return 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b)

def _contrast_ratio(hex1, hex2):
    l1 = _relative_luminance(*hex_to_rgb(hex1))
    l2 = _relative_luminance(*hex_to_rgb(hex2))
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi+0.05)/(lo+0.05)

def is_near_white(r, g, b, t=240): return r>t and g>t and b>t
def is_near_black(r, g, b, t=15):  return r<t and g<t and b<t
def rgb_saturation(r, g, b):
    _h, s, _l = colorsys.rgb_to_hls(r/255, g/255, b/255)
    return s

def hsl_to_hex(h_deg, s_pct, l_pct):
    r, g, b = colorsys.hls_to_rgb(h_deg/360, l_pct/100, s_pct/100)
    return rgb_to_hex(int(r*255), int(g*255), int(b*255))

def process_color_pack(raw_colors):
    valid = [c for c in raw_colors if c]
    if not valid:
        return {
            'color_primary':         '#1b3022',
            'color_secondary':       '#2d5a3d',
            'color_accent':          '#c8a328',
            'color_primary_light':   '#2d5a3d',
            'color_text_on_primary': '#ffffff',
            'color_text_on_accent':  '#1a1a1a',
        }

    def entry(hex_c):
        h, s, l = _to_hsl(hex_c)
        return {'hex': hex_c, 'h': h, 's': s, 'l': l}

    colors = [entry(c) for c in valid]

    # PRIMARY: mid-to-dark (L 15–45%); fall back to darkest overall
    primaries = [c for c in colors if 15 <= c['l'] <= 45]
    primary   = max(primaries, key=lambda c: c['s']) if primaries else min(colors, key=lambda c: c['l'])

    # SECONDARY: close hue to primary but different lightness
    others    = [c for c in colors if c['hex'] != primary['hex']]
    secondary = min(others, key=lambda c: abs(c['h'] - primary['h'])) if others else primary

    # ACCENT: most saturated, clearly different hue
    accent_candidates = [c for c in colors if abs(c['h'] - primary['h']) > 20]
    accent = max(accent_candidates, key=lambda c: c['s']) if accent_candidates else max(colors, key=lambda c: c['s'])

    # Derived
    ph, ps, pl = _to_hsl(primary['hex'])
    primary_light = hsl_to_hex(ph, min(ps, 60), min(pl + 20, 80))

    text_on_primary = '#ffffff' if _contrast_ratio(primary['hex'], '#ffffff') >= 3.0 else '#1a1a1a'
    text_on_accent  = '#ffffff' if _contrast_ratio(accent['hex'],  '#ffffff') >= 3.0 else '#1a1a1a'

    return {
        'color_primary':         primary['hex'],
        'color_secondary':       secondary['hex'],
        'color_accent':          accent['hex'],
        'color_primary_light':   primary_light,
        'color_text_on_primary': text_on_primary,
        'color_text_on_accent':  text_on_accent,
    }


def extract_colors_from_logo(logo_url):
    """Download logo and run ColorThief. Returns color pack dict or None."""
    try:
        resp = requests.get(logo_url, timeout=DOWNLOAD_TIMEOUT, stream=True)
        resp.raise_for_status()
        raw = resp.content
    except Exception as e:
        print(f"    Download failed: {e}")
        return None

    tmp_path = None
    try:
        suffix = ".png"
        ct = resp.headers.get("Content-Type", "")
        if "jpeg" in ct or "jpg" in ct: suffix = ".jpg"
        elif "webp" in ct: suffix = ".webp"

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp.write(raw)
        tmp.close()
        tmp_path = tmp.name

        palette = ColorThief(tmp_path).get_palette(color_count=COLOR_PALETTE_N, quality=1)
        usable  = [c for c in palette if not is_near_white(*c) and not is_near_black(*c)]

        primary   = usable[0] if len(usable) > 0 else None
        secondary = usable[1] if len(usable) > 1 else None
        accent    = max(usable, key=lambda c: rgb_saturation(*c)) if usable else None

        raw_colors = (
            rgb_to_hex(*primary)   if primary   else None,
            rgb_to_hex(*secondary) if secondary else None,
            rgb_to_hex(*accent)    if accent    else None,
        )
        return process_color_pack(raw_colors)

    except Exception as e:
        print(f"    ColorThief error: {e}")
        return None
    finally:
        if tmp_path:
            try: os.unlink(tmp_path)
            except: pass


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Fetch all AI-replaced logos
    print("Fetching AI-replaced logos from flagged_logos...")
    rows = (
        supabase.table("flagged_logos")
        .select("slug,business_name,ai_logo_url")
        .eq("ai_logo_status", "SUCCESS")
        .not_.is_("ai_logo_url", "null")
        .execute()
        .data
    )
    print(f"Found {len(rows)} leads to recolor.\n")

    success, failed = 0, 0

    for i, row in enumerate(rows, 1):
        slug     = row["slug"]
        biz_name = row.get("business_name", slug)
        logo_url = row["ai_logo_url"]

        print(f"[{i}/{len(rows)}] {biz_name}...")

        colors = extract_colors_from_logo(logo_url)
        if not colors:
            print(f"    ✗ color extraction failed")
            failed += 1
            continue

        supabase.table("leads").update({
            **colors,
            "style_status": "SUCCESS",
        }).eq("slug", slug).execute()

        print(f"    ✓ {colors['color_primary']} / {colors['color_secondary']} / {colors['color_accent']}")
        success += 1

    print(f"\n── Done ─────────────────────────────────")
    print(f"  Recolored: {success}")
    print(f"  Failed:    {failed}")
    print(f"\nLive pages will update within 1 hour (ISR cache).")


if __name__ == "__main__":
    main()
