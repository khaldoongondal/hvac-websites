// Phone display + tel: helpers. The template always shows a US "+1 (xxx) xxx-xxxx"
// number even when Supabase stores it without the +1 prefix.

export function formatPhone(raw) {
  if (!raw) return ''
  const digits = String(raw).replace(/\D/g, '')
  let ten = digits
  if (digits.length === 11 && digits.startsWith('1')) ten = digits.slice(1)
  if (ten.length === 10) {
    return `+1 (${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`
  }
  // Unknown shape — still guarantee a leading +1.
  const trimmed = String(raw).trim()
  return trimmed.startsWith('+') ? trimmed : `+1 ${trimmed}`
}

export function telHref(raw) {
  if (!raw) return ''
  const digits = String(raw).replace(/\D/g, '')
  let d = digits
  if (d.length === 10) d = `1${d}`
  return `tel:+${d}`
}
