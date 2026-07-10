// Colour helpers shared across the lead template.

export function rgba(hex, alpha) {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${alpha})`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(0,0,0,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

// "New York NY" → "New York", "Los Angeles, CA" → "Los Angeles"
export function cleanCity(city) {
  if (!city) return city
  return city.replace(/,?\s+[A-Z]{2}$/, '').trim()
}

// '#111827' (dark text) for light backgrounds, '#ffffff' for dark ones.
export function contrastText(hex) {
  if (!hex || hex.length < 7) return '#ffffff'
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128 ? '#111827' : '#ffffff'
}

// Generates CSS vars + !important overrides for every custom Tailwind class the
// template uses. Injected in <Head> — beats whatever the Tailwind CDN generates.
export function buildColorCSS(primary, secondary, accent, primaryLight, textOnPrimary, textOnAccent) {
  const p  = primary       || '#1b3022'
  const s  = secondary     || '#2d5a3d'
  const a  = accent        || '#c8a328'
  const pl = primaryLight  || '#2d5a3d'
  const tp = textOnPrimary || '#ffffff'  // text on primary-bg surfaces (hero, footer)
  const ta = textOnAccent  || '#1a1a1a'  // text on accent-bg surfaces (buttons)

  // Footer bg = primary. Use pre-computed tp for readability.
  const footerMuted  = tp === '#ffffff' ? 'rgba(255,255,255,0.6)' : 'rgba(17,24,39,0.55)'
  const footerBorder = tp === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.15)'

  // CTA / section banner (bg = secondary)
  const ctaText  = contrastText(s)
  const ctaMuted = ctaText === '#ffffff' ? 'rgba(255,255,255,0.8)' : 'rgba(17,24,39,0.7)'

  return `
    :root {
      --color-primary:         ${p};
      --color-secondary:       ${s};
      --color-accent:          ${a};
      --color-primary-light:   ${pl};
      --color-text-on-primary: ${tp};
      --color-text-on-accent:  ${ta};
    }

    /* Accent = buttons, icons, highlights, borders */
    .text-primary                         { color: ${a} !important; }
    .bg-primary                           { background-color: ${a} !important; }
    .bg-primary\\/90,
    .hover\\:bg-primary\\/90:hover         { background-color: ${rgba(a, 0.9)} !important; }
    .bg-primary\\/10                       { background-color: ${rgba(a, 0.1)} !important; }
    .bg-primary\\/20                       { background-color: ${rgba(a, 0.2)} !important; }
    .border-primary                        { border-color: ${a} !important; }

    /* Section backgrounds */
    .bg-forest-green                       { background-color: ${s} !important; }
    .bg-deep-green                         { background-color: ${p} !important; }

    /* Button text using derived contrast colour */
    .btn-accent-text                       { color: ${ta} !important; }

    /* Footer contrast (bg = primary) */
    footer.bg-deep-green,
    footer.bg-deep-green .text-white       { color: ${tp} !important; }
    footer.bg-deep-green .text-white\\/60,
    footer.bg-deep-green .text-white\\/40  { color: ${footerMuted} !important; }
    footer.bg-deep-green .border-white\\/10{ border-color: ${footerBorder} !important; }
    footer.bg-deep-green .text-primary     { color: ${a} !important; }
    footer.bg-deep-green .hover\\:text-primary:hover { color: ${a} !important; }

    /* Banner contrast (bg = secondary) */
    .bg-forest-green .text-white           { color: ${ctaText} !important; }
    .bg-forest-green .text-white\\/80      { color: ${ctaMuted} !important; }
    .bg-forest-green .text-primary         { color: ${a} !important; }
  `.trim()
}
