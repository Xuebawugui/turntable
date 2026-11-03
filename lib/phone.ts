/** French numbers stored as E.164, e.g. +33612345678 */

const NATIONAL_RE = /^[1-9]\d{8}$/;

function digitsOnly(input: string): string {
  return input.replace(/\D/g, "");
}

export function normalizeFrenchPhone(input: string): string | null {
  let raw = input.trim();
  if (!raw) return null;

  let d = digitsOnly(raw);

  if (raw.startsWith("+") || d.startsWith("33")) {
    if (d.startsWith("33")) d = d.slice(2);
    else if (d.startsWith("0033")) d = d.slice(4);
    if (d.length !== 9 || !NATIONAL_RE.test(d)) return null;
    return `+33${d}`;
  }

  if (d.startsWith("0") && d.length === 10) {
    d = d.slice(1);
  }

  if (d.length !== 9 || !NATIONAL_RE.test(d)) return null;
  return `+33${d}`;
}

/** National part only (9 digits, no leading 0) for the +33 input field */
export function formatNationalInput(input: string): string {
  let d = digitsOnly(input);
  if (d.startsWith("0") && d.length <= 10) {
    d = d.slice(1);
  }
  return d.slice(0, 9);
}

export function isFrenchPhoneComplete(nationalDigits: string): boolean {
  const d = digitsOnly(nationalDigits);
  const national = d.startsWith("0") && d.length === 10 ? d.slice(1) : d;
  return national.length === 9 && NATIONAL_RE.test(national);
}

/** Display as 6 12 34 56 78 */
export function formatFrenchNationalDisplay(input: string): string {
  const n = formatNationalInput(input);
  if (n.length <= 1) return n;
  const parts = [n[0]];
  let rest = n.slice(1);
  while (rest.length > 0) {
    parts.push(rest.slice(0, 2));
    rest = rest.slice(2);
  }
  return parts.join(" ");
}

/** +33612345678 → +33 6 12 34 56 78 */
export function formatE164FrenchDisplay(e164: string): string {
  const normalized = normalizeFrenchPhone(e164);
  if (!normalized) return e164;
  const national = normalized.slice(3);
  return `+33 ${formatFrenchNationalDisplay(national)}`;
}
