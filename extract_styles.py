"""
extract_styles.py

Reads HVAC business rows from Google Sheets, visits each website,
extracts brand colors + logo URL, and writes results back to the sheet.

Auth: uses oauth_token.json (already authorised). If missing, place
      oauth_client.json here and re-run — it will prompt for auth.

Run:  venv/bin/python extract_styles.py
"""

import io
import os
import re
import time
import colorsys
import tempfile
from datetime import datetime, timezone
from urllib.parse import urljoin, urlparse

import requests
import gspread
from google.oauth2.credentials import Credentials as OAuthCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from PIL import Image
from colorthief import ColorThief
from bs4 import BeautifulSoup
from supabase import create_client

# ── CONFIG ───────────────────────────────────────────────────────────────────
SPREADSHEET_NAME  = "HVAC Leads"
WORKSHEET_NAME    = "USA"
OAUTH_CLIENT_FILE = "oauth_client.json"
OAUTH_TOKEN_FILE  = "oauth_token.json"
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
]

PAGE_TIMEOUT_MS      = 10_000  # 10 seconds
WAIT_AFTER_LOAD_S    = 2       # seconds to let JS render
RATE_LIMIT_S         = 3       # seconds between requests
COLOR_PALETTE_N      = 6       # colours to extract per image
LOGO_DOWNLOAD_TIMEOUT = 10     # seconds for logo image fetch

SUPABASE_URL = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"
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
        raise SystemExit(
            f"No credentials found. Place '{OAUTH_CLIENT_FILE}' in this folder "
            "and re-run to go through the Google auth flow."
        )

    flow = InstalledAppFlow.from_client_secrets_file(OAUTH_CLIENT_FILE, SCOPES)
    flow.redirect_uri = "http://localhost:8080"
    auth_url, _ = flow.authorization_url(access_type="offline", prompt="consent")

    print("\n" + "=" * 70)
    print("GOOGLE AUTHORIZATION REQUIRED")
    print("=" * 70)
    print("Step 1 — Open this URL in your local browser:\n")
    print(f"  {auth_url}\n")
    print("Step 2 — Sign in and click Allow.")
    print("Step 3 — Browser shows 'localhost refused to connect' — that's OK.")
    print("          Copy the FULL URL from the browser address bar.")
    print("Step 4 — Paste it below and press Enter.")
    print("=" * 70 + "\n")

    redirect_url = input("Paste the full redirect URL: ").strip()
    flow.fetch_token(authorization_response=redirect_url)
    creds = flow.credentials
    _save_token(creds)
    return creds


def _save_token(creds):
    with open(OAUTH_TOKEN_FILE, "w") as f:
        f.write(creds.to_json())


# ── COLOUR HELPERS ────────────────────────────────────────────────────────────

def rgb_to_hex(r, g, b):
    return "#{:02x}{:02x}{:02x}".format(r, g, b)


def hex_to_rgb(hex_color):
    h = hex_color.lstrip('#')
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def hsl_to_hex(h_deg, s_pct, l_pct):
    # colorsys.hls_to_rgb takes (h, l, s) — note HLS order
    r, g, b = colorsys.hls_to_rgb(h_deg / 360, l_pct / 100, s_pct / 100)
    return rgb_to_hex(int(r * 255), int(g * 255), int(b * 255))


def _to_hsl(hex_color):
    r, g, b = hex_to_rgb(hex_color)
    # colorsys.rgb_to_hls returns (h, l, s) — we re-order to (h, s, l)
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return h * 360, s * 100, l * 100  # hue°, sat%, light%


def _relative_luminance(r, g, b):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def _contrast_ratio(hex1, hex2):
    l1 = _relative_luminance(*hex_to_rgb(hex1))
    l2 = _relative_luminance(*hex_to_rgb(hex2))
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


def is_near_white(r, g, b, threshold=240):
    return r > threshold and g > threshold and b > threshold


def is_near_black(r, g, b, threshold=15):
    return r < threshold and g < threshold and b < threshold


def rgb_saturation(r, g, b):
    _h, s, _l = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return s


def extract_colors(screenshot_bytes):
    """Return (primary_hex, secondary_hex, accent_hex) or (None, None, None)."""
    img = Image.open(io.BytesIO(screenshot_bytes)).convert("RGB")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    try:
        palette = ColorThief(buf).get_palette(color_count=COLOR_PALETTE_N, quality=1)
    except Exception:
        return None, None, None

    usable = [c for c in palette if not is_near_white(*c) and not is_near_black(*c)]

    primary   = usable[0] if len(usable) > 0 else None
    secondary = usable[1] if len(usable) > 1 else None
    accent    = max(usable, key=lambda c: rgb_saturation(*c)) if usable else None

    return (
        rgb_to_hex(*primary)   if primary   else None,
        rgb_to_hex(*secondary) if secondary else None,
        rgb_to_hex(*accent)    if accent    else None,
    )


# ── LOGO COLOR EXTRACTION ────────────────────────────────────────────────────

def download_logo_image(logo_url):
    """Download logo to a temp file. Returns path or None on failure."""
    try:
        resp = requests.get(logo_url, timeout=LOGO_DOWNLOAD_TIMEOUT, stream=True)
        resp.raise_for_status()
        ct = resp.headers.get("Content-Type", "")
        if "jpeg" in ct or "jpg" in ct:
            suffix = ".jpg"
        elif "gif" in ct:
            suffix = ".gif"
        elif "webp" in ct:
            suffix = ".webp"
        else:
            suffix = ".png"
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        for chunk in resp.iter_content(8192):
            tmp.write(chunk)
        tmp.close()
        return tmp.name
    except Exception:
        return None


def extract_colors_from_logo(logo_url):
    """Run ColorThief on the logo image. Returns (primary, secondary, accent) or all None."""
    path = download_logo_image(logo_url)
    if not path:
        return None, None, None
    try:
        palette = ColorThief(path).get_palette(color_count=COLOR_PALETTE_N, quality=1)
        usable = [c for c in palette if not is_near_white(*c) and not is_near_black(*c)]
        primary   = usable[0] if len(usable) > 0 else None
        secondary = usable[1] if len(usable) > 1 else None
        accent    = max(usable, key=lambda c: rgb_saturation(*c)) if usable else None
        return (
            rgb_to_hex(*primary)   if primary   else None,
            rgb_to_hex(*secondary) if secondary else None,
            rgb_to_hex(*accent)    if accent    else None,
        )
    except Exception:
        return None, None, None
    finally:
        try:
            os.unlink(path)
        except Exception:
            pass


# ── COLOR ROLE ASSIGNMENT ─────────────────────────────────────────────────────

def process_color_pack(raw_colors):
    """
    Takes the 3 raw hex colors from colorthief and returns a dict of 6 values:
    primary, secondary, accent (intelligently role-assigned) plus 3 derived helpers.
    """
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
    mid_dark = [c for c in colors if 15 <= c['l'] <= 45]
    primary  = min(mid_dark or colors, key=lambda c: c['l'])
    remaining = [c for c in colors if c is not primary]

    # SECONDARY: must be >= 20% lighter than primary; else lighten a candidate
    p_l   = primary['l']
    light = [c for c in remaining if c['l'] >= p_l + 20]
    if light:
        sec = light[0]
        secondary_hex = sec['hex']
        sec_h, sec_s  = sec['h'], sec['s']
    else:
        base  = remaining[0] if remaining else primary
        sec_h, sec_s  = base['h'], base['s']
        secondary_hex = hsl_to_hex(sec_h, sec_s, min(p_l + 25, 85))

    remaining2 = [c for c in remaining if c['hex'] != secondary_hex]

    # ACCENT: most saturated leftover; bump lightness until 4.5:1 vs primary
    acc_base   = max(remaining2 or colors, key=lambda c: c['s'])
    accent_hex = acc_base['hex']

    if _contrast_ratio(accent_hex, primary['hex']) < 4.5:
        h, s = acc_base['h'], acc_base['s']
        found = False
        for tl in list(range(55, 95, 5)) + list(range(45, 5, -5)):
            test = hsl_to_hex(h, s, tl)
            if _contrast_ratio(test, primary['hex']) >= 4.5:
                accent_hex = test
                found = True
                break
        if not found:
            accent_hex = hsl_to_hex(acc_base['h'], 80, 55)

    # DERIVED
    primary_light    = hsl_to_hex(primary['h'], primary['s'], min(p_l + 15, 90))
    text_on_primary  = '#ffffff' if p_l < 40 else '#1a1a1a'
    _, acc_l, _      = colorsys.rgb_to_hls(*[x / 255 for x in hex_to_rgb(accent_hex)])
    text_on_accent   = '#ffffff' if acc_l * 100 < 40 else '#1a1a1a'

    return {
        'color_primary':         primary['hex'],
        'color_secondary':       secondary_hex,
        'color_accent':          accent_hex,
        'color_primary_light':   primary_light,
        'color_text_on_primary': text_on_primary,
        'color_text_on_accent':  text_on_accent,
    }


# ── LOGO HELPER ───────────────────────────────────────────────────────────────

def extract_logo_url(html, page_url=""):
    """og:image → twitter:image → header img → logo-named img → None.
    All returned URLs are made absolute using page_url as the base.
    """
    def make_absolute(src):
        if not src:
            return None
        src = src.strip()
        if src.startswith("data:"):
            return None
        try:
            absolute = urljoin(page_url, src) if page_url else src
            parsed = urlparse(absolute)
            if parsed.scheme in ("http", "https") and parsed.netloc:
                return absolute
        except Exception:
            pass
        return None

    soup = BeautifulSoup(html, "html.parser")

    og = soup.find("meta", property="og:image")
    if og:
        url = make_absolute(og.get("content"))
        if url:
            return url

    tw = soup.find("meta", attrs={"name": "twitter:image"})
    if tw:
        url = make_absolute(tw.get("content"))
        if url:
            return url

    header = soup.find("header")
    if header:
        img = header.find("img")
        if img:
            url = make_absolute(img.get("src"))
            if url:
                return url

    for img in soup.find_all("img"):
        classes = " ".join(img.get("class", []))
        if any("logo" in s.lower() for s in [classes, img.get("id", ""), img.get("src", "")]):
            url = make_absolute(img.get("src"))
            if url:
                return url

    return None


# ── SLUG HELPER ───────────────────────────────────────────────────────────────

def make_slug(name):
    slug = name.lower()
    slug = re.sub(r"[\s\W]+", "-", slug)
    slug = re.sub(r"[^a-z0-9-]", "", slug)
    return slug.strip("-")[:50]


# ── SHEET HELPERS ─────────────────────────────────────────────────────────────

def connect_worksheet():
    client = gspread.authorize(get_credentials())
    return client.open(SPREADSHEET_NAME).worksheet(WORKSHEET_NAME)


def get_or_create_col(ws, headers, name):
    """Return 1-based column index, appending header if column is missing."""
    clean = [h.strip().lower() for h in headers]
    try:
        return clean.index(name.lower()) + 1
    except ValueError:
        new_idx = len(headers) + 1
        ws.update_cell(1, new_idx, name)
        headers.append(name)
        return new_idx


def require_col(headers, name):
    """Return 0-based index of a required input column."""
    clean = [h.strip().lower() for h in headers]
    try:
        return clean.index(name.lower())
    except ValueError:
        raise SystemExit(
            f"Required column '{name}' not found in sheet.\n"
            f"Columns present: {[h.strip() for h in headers]}"
        )


# ── MAIN ──────────────────────────────────────────────────────────────────────

def main():
    print("Connecting to Google Sheets…")
    ws = connect_worksheet()

    all_values = ws.get_all_values()
    if not all_values:
        raise SystemExit("Sheet appears to be empty.")

    headers   = all_values[0]
    data_rows = all_values[1:]

    # Required input columns
    idx_website       = require_col(headers, "website")
    idx_has_website   = require_col(headers, "has_website")
    idx_business_name = require_col(headers, "business_name")

    # Output columns — created automatically if they don't exist yet
    out_primary       = get_or_create_col(ws, headers, "color_primary")
    out_secondary     = get_or_create_col(ws, headers, "color_secondary")
    out_accent        = get_or_create_col(ws, headers, "color_accent")
    out_primary_light = get_or_create_col(ws, headers, "color_primary_light")
    out_text_primary  = get_or_create_col(ws, headers, "color_text_on_primary")
    out_text_accent   = get_or_create_col(ws, headers, "color_text_on_accent")
    out_logo          = get_or_create_col(ws, headers, "logo_url")
    out_slug          = get_or_create_col(ws, headers, "slug")
    out_timestamp     = get_or_create_col(ws, headers, "style_extracted_at")
    out_status        = get_or_create_col(ws, headers, "style_status")

    # Re-read header so color_primary index reflects any newly added column
    idx_color_primary = require_col(ws.row_values(1), "color_primary")
    idx_style_status  = out_status - 1  # 0-based for reading rows

    def cell(row, idx):
        return row[idx].strip() if idx < len(row) else ""

    # Rows where has_website=TRUE and either color_primary is empty OR flagged for reprocess
    eligible = [
        (i + 2, row)                          # i+2 = 1-based sheet row (skip header)
        for i, row in enumerate(data_rows)
        if cell(row, idx_has_website).upper() == "TRUE"
        and (
            not cell(row, idx_color_primary)
            or cell(row, idx_style_status).upper() == "NEEDS_REPROCESS"
        )
    ]

    total = len(eligible)
    print(f"Found {total} rows to process.\n")
    if total == 0:
        print("Nothing to do — all eligible rows already have color_primary filled.")
        return

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
        )

        for count, (sheet_row, row) in enumerate(eligible, start=1):
            url           = cell(row, idx_website)
            business_name = cell(row, idx_business_name)

            print(f"Processing {count}/{total}: {business_name}…")

            if url and not url.startswith(("http://", "https://")):
                url = "https://" + url

            timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
            color_primary = color_secondary = color_accent = logo_url = slug = None
            color_primary_light = text_on_primary = text_on_accent = None
            status = "FAILED - Unknown error"
            used_logo = False

            try:
                if not url:
                    raise ValueError("No URL in sheet")

                page = context.new_page()
                try:
                    page.goto(url, timeout=PAGE_TIMEOUT_MS, wait_until="domcontentloaded")
                    time.sleep(WAIT_AFTER_LOAD_S)
                    html = page.content()

                    # Try logo-based colors first (avoids screenshot when successful)
                    logo_url = extract_logo_url(html, page_url=url)
                    raw_primary = raw_secondary = raw_accent = None

                    if logo_url:
                        raw_primary, raw_secondary, raw_accent = extract_colors_from_logo(logo_url)
                        if raw_primary:
                            used_logo = True

                    # Fall back to full-page screenshot colors
                    if not used_logo:
                        screenshot_bytes = page.screenshot(full_page=True)
                        raw_primary, raw_secondary, raw_accent = extract_colors(screenshot_bytes)
                finally:
                    page.close()

                pack = process_color_pack([raw_primary, raw_secondary, raw_accent])
                color_primary       = pack['color_primary']
                color_secondary     = pack['color_secondary']
                color_accent        = pack['color_accent']
                color_primary_light = pack['color_primary_light']
                text_on_primary     = pack['color_text_on_primary']
                text_on_accent      = pack['color_text_on_accent']
                slug   = make_slug(business_name) if business_name else None
                status = "SUCCESS"

            except PlaywrightTimeout:
                status = "FAILED - Timeout"
                print(f"  Timeout: {url}")

            except Exception as exc:
                msg    = str(exc).splitlines()[0][:120]
                status = f"FAILED - {msg}"
                print(f"  Error: {msg}")

            # Write all result columns back in one batch
            ws.batch_update([
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_primary),       "values": [[color_primary        or ""]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_secondary),     "values": [[color_secondary      or ""]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_accent),        "values": [[color_accent         or ""]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_primary_light), "values": [[color_primary_light  or ""]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_text_primary),  "values": [[text_on_primary      or ""]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_text_accent),   "values": [[text_on_accent       or ""]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_logo),          "values": [[logo_url             or ""]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_slug),          "values": [[slug                 or ""]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_timestamp),     "values": [[timestamp]]},
                {"range": gspread.utils.rowcol_to_a1(sheet_row, out_status),        "values": [[status]]},
            ])

            if status == "SUCCESS":
                src = "logo" if used_logo else "screenshot"
                print(f"  Done [{src}]: {color_primary} / {color_secondary} / {color_accent} | light={color_primary_light} txt_acc={text_on_accent}")
                if slug:
                    try:
                        supabase.table("leads").upsert({
                            "slug":                  slug,
                            "color_primary":         color_primary,
                            "color_secondary":       color_secondary,
                            "color_accent":          color_accent,
                            "color_primary_light":   color_primary_light,
                            "color_text_on_primary": text_on_primary,
                            "color_text_on_accent":  text_on_accent,
                            "logo_url":              logo_url,
                            "style_status":          "SUCCESS",
                        }, on_conflict="slug").execute()
                    except Exception as supa_err:
                        print(f"  Supabase sync failed: {supa_err}")
            else:
                print(f"  {status}")

            if count < total:
                time.sleep(RATE_LIMIT_S)

        browser.close()

    print(f"\nFinished. Processed {total} rows.")


if __name__ == "__main__":
    main()
