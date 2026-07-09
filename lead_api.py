"""
lead_api.py

HTTP service for processing a single lead from an n8n form submission.

  POST /process-lead   (multipart/form-data)
  Fields:
    business_name (str, required)
    phone         (str, required)
    website       (str, required)
    logo          (file, optional — PNG/JPG/WebP/GIF; SVG accepted but won't
                  contribute to color extraction)

  Returns JSON: {slug, live_url, status, color_primary, color_secondary,
                 color_accent, logo_url}

Run:
  venv/bin/uvicorn lead_api:app --host 0.0.0.0 --port 8000
"""

import os
import secrets
import tempfile
import time
from datetime import datetime, timezone, timedelta
from typing import Optional

from colorthief import ColorThief
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel

load_dotenv()
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from supabase import create_client

from extract_styles import (
    COLOR_PALETTE_N,
    connect_worksheet,
    extract_colors,
    extract_colors_from_logo,
    extract_logo_url,
    is_near_black,
    is_near_white,
    make_slug,
    process_color_pack,
    rgb_saturation,
    rgb_to_hex,
)

# ── CONFIG ───────────────────────────────────────────────────────────────────
SUPABASE_URL = "https://tqiuqzjrtgjaktxhwued.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxaXVxempydGdqYWt0eGh3dWVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4NjU1MiwiZXhwIjoyMDc2MjYyNTUyfQ.pXKfqWBzf_cxNQtzTYj9e9ICRDVcP6usaWQoZOQS-dg"

STORAGE_BUCKET    = "logos"
BASE_URL          = "https://www.leadder.tech/"
EXPIRES_IN_DAYS   = 30
PAGE_TIMEOUT_MS   = 10_000
WAIT_AFTER_LOAD_S = 2

CONTENT_TYPE_TO_EXT = {
    "image/png":     ".png",
    "image/jpeg":    ".jpg",
    "image/jpg":     ".jpg",
    "image/webp":    ".webp",
    "image/gif":     ".gif",
    "image/svg+xml": ".svg",
}

# Matches process_color_pack defaults — used when scraping fails outright.
FALLBACK_COLORS = {
    "color_primary":         "#1b3022",
    "color_secondary":       "#2d5a3d",
    "color_accent":          "#c8a328",
    "color_primary_light":   "#2d5a3d",
    "color_text_on_primary": "#ffffff",
    "color_text_on_accent":  "#1a1a1a",
}
# ─────────────────────────────────────────────────────────────────────────────


app = FastAPI(title="Lead Processor")

LEAD_API_KEY = os.getenv("LEAD_API_KEY")


def require_api_key(x_api_key: Optional[str] = Header(default=None)):
    if not LEAD_API_KEY:
        raise HTTPException(status_code=500, detail="LEAD_API_KEY not configured on server")
    if x_api_key != LEAD_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


class LeadOutput(BaseModel):
    slug:            str
    live_url:        str
    status:          str
    color_primary:   Optional[str] = None
    color_secondary: Optional[str] = None
    color_accent:    Optional[str] = None
    logo_url:        Optional[str] = None


# ── Helpers ──────────────────────────────────────────────────────────────────

def extract_colors_from_bytes(image_bytes: bytes, suffix: str = ".png"):
    """Run ColorThief on raw bytes. Returns (primary, secondary, accent) hex or None,None,None."""
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        tmp.write(image_bytes)
        tmp.close()
        palette = ColorThief(tmp.name).get_palette(color_count=COLOR_PALETTE_N, quality=1)
        usable  = [c for c in palette if not is_near_white(*c) and not is_near_black(*c)]
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
            os.unlink(tmp.name)
        except Exception:
            pass


def upload_logo_to_storage(supabase, slug: str, file_bytes: bytes, content_type: str) -> Optional[str]:
    """Upload to the logos bucket at {slug}{ext}; return public URL or None on error."""
    ext  = CONTENT_TYPE_TO_EXT.get(content_type, ".png")
    path = f"{slug}{ext}"
    try:
        supabase.storage.from_(STORAGE_BUCKET).upload(
            path, file_bytes,
            {"content-type": content_type, "upsert": "true"},
        )
        return supabase.storage.from_(STORAGE_BUCKET).get_public_url(path)
    except Exception as exc:
        print(f"Storage upload failed: {exc}")
        return None


def scrape_website(url: str) -> dict:
    """Visit URL, extract colors (logo → screenshot fallback). Returns full 6-color pack."""
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    logo_url    = None
    raw_primary = raw_secondary = raw_accent = None
    used_logo   = False

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = context.new_page()
        try:
            page.goto(url, timeout=PAGE_TIMEOUT_MS, wait_until="domcontentloaded")
            time.sleep(WAIT_AFTER_LOAD_S)
            html = page.content()

            logo_url = extract_logo_url(html, page_url=url)
            if logo_url:
                raw_primary, raw_secondary, raw_accent = extract_colors_from_logo(logo_url)
                if raw_primary:
                    used_logo = True

            if not used_logo:
                screenshot = page.screenshot(full_page=True)
                raw_primary, raw_secondary, raw_accent = extract_colors(screenshot)
        finally:
            page.close()
            browser.close()

    pack = process_color_pack([raw_primary, raw_secondary, raw_accent])
    return {**pack, "logo_url": logo_url, "used_logo": used_logo}


def append_to_sheet(record: dict):
    ws      = connect_worksheet()
    headers = ws.row_values(1)
    col_map = {h.strip().lower(): i for i, h in enumerate(headers)}
    row     = [""] * len(headers)

    for key, value in record.items():
        i = col_map.get(key.lower())
        if i is not None:
            row[i] = "" if value is None else str(value)

    ws.append_row(row, value_input_option="USER_ENTERED")


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"ok": True}


@app.post("/process-lead", response_model=LeadOutput, dependencies=[Depends(require_api_key)])
def process_lead(
    business_name: str           = Form(...),
    phone:         str           = Form(...),
    website:       str           = Form(...),
    city:          Optional[str] = Form(None),
    logo:          UploadFile    = File(None),
):
    slug = make_slug(business_name)
    if not slug:
        raise HTTPException(status_code=400, detail="business_name produces empty slug")

    scrape_code = f"FORM-{secrets.token_hex(4).upper()}"
    timestamp   = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    live_url    = f"{BASE_URL}{slug}"
    expires_at  = (datetime.now(timezone.utc) + timedelta(days=EXPIRES_IN_DAYS)).isoformat()
    supabase    = create_client(SUPABASE_URL, SUPABASE_KEY)

    uploaded_logo_url = None
    result            = None
    status            = None

    # Path 1: form-uploaded logo → store + extract colors directly (skip Playwright)
    if logo and logo.filename:
        logo_bytes = logo.file.read()
        if logo_bytes:
            content_type      = logo.content_type or "image/png"
            uploaded_logo_url = upload_logo_to_storage(supabase, slug, logo_bytes, content_type)

            ext = CONTENT_TYPE_TO_EXT.get(content_type, ".png")
            if ext != ".svg":
                raw_p, raw_s, raw_a = extract_colors_from_bytes(logo_bytes, suffix=ext)
                if raw_p:
                    pack   = process_color_pack([raw_p, raw_s, raw_a])
                    result = {**pack, "logo_url": uploaded_logo_url, "used_logo": True}
                    status = "SUCCESS"

    # Path 2: no usable upload → scrape the website (existing behavior)
    if result is None:
        try:
            result = scrape_website(website)
            status = "SUCCESS"
        except PlaywrightTimeout:
            result = {**FALLBACK_COLORS, "logo_url": None, "used_logo": False}
            status = "FAILED - Timeout"
        except Exception as exc:
            result = {**FALLBACK_COLORS, "logo_url": None, "used_logo": False}
            status = f"FAILED - {str(exc).splitlines()[0][:80]}"

        # Uploaded logo URL wins even if its colors weren't usable (e.g. SVG)
        if uploaded_logo_url:
            result["logo_url"] = uploaded_logo_url

    city_clean = (city or "").strip() or None

    supabase_record = {
        "slug":                  slug,
        "scrape_code":           scrape_code,
        "business_name":         business_name,
        "phone":                 phone,
        "website":               website,
        "city":                  city_clean,
        "has_website":           True,
        "color_primary":         result["color_primary"],
        "color_secondary":       result["color_secondary"],
        "color_accent":          result["color_accent"],
        "color_primary_light":   result["color_primary_light"],
        "color_text_on_primary": result["color_text_on_primary"],
        "color_text_on_accent":  result["color_text_on_accent"],
        "logo_url":              result["logo_url"],
        "style_status":          status,
        "style_extracted_at":    timestamp,
        "live_url":              live_url,
        "expires_at":            expires_at,
    }
    supabase.table("leads").upsert(supabase_record, on_conflict="slug").execute()

    sheet_record = {**supabase_record, "has_website": "TRUE"}
    try:
        append_to_sheet(sheet_record)
    except Exception as exc:
        print(f"Sheet append failed (Supabase write succeeded): {exc}")

    return LeadOutput(
        slug=slug,
        live_url=live_url,
        status=status,
        color_primary=result["color_primary"],
        color_secondary=result["color_secondary"],
        color_accent=result["color_accent"],
        logo_url=result["logo_url"],
    )
