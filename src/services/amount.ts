/**
 * Fiat amounts are whole minor units (cents, kobo, pence). Every currency this app handles has two minor digits.
 * Parsing is done on the decimal string, never through floating point, so 19.99 can never become 1998.
 */

/** Parses user input such as "12", "12.5", "1,250.75" into minor units. Returns 0 for anything invalid. */
export function parseMinorAmount(input: string): number {
  const cleaned = input.trim().replace(/,/g, '');
  const match = /^(\d{1,12})(?:\.(\d{0,2}))?$/.exec(cleaned);
  if (!match) return 0;
  const whole = match[1];
  const fraction = (match[2] ?? '').padEnd(2, '0');
  const minor = Number(whole) * 100 + Number(fraction);
  return Number.isSafeInteger(minor) ? minor : 0;
}

/** The inverse, for filling the input box: 1250 -> "12.50", 1200 -> "12". */
export function minorToInput(minor: number): string {
  const whole = Math.trunc(minor / 100);
  const cents = Math.abs(minor % 100);
  return cents === 0 ? String(whole) : `${whole}.${String(cents).padStart(2, '0')}`;
}

/** Server amounts arrive as integer strings; reject anything else instead of guessing. */
export function parseServerMinor(value: string | undefined): number | null {
  if (typeof value !== 'string' || !/^\d{1,15}$/.test(value)) return null;
  const n = Number(value);
  return Number.isSafeInteger(n) ? n : null;
}

/** Stellar amount string ("10.0000000") to integer stroops, without floating point. */
export function amountToStroops(amount: string): bigint | null {
  const match = /^(\d+)(?:\.(\d{1,7}))?$/.exec(amount);
  if (!match) return null;
  return BigInt(match[1]) * 10_000_000n + BigInt((match[2] ?? '').padEnd(7, '0'));
}

/** Integer stroops to a 7-place decimal string. */
export function stroopsToAmount(stroops: bigint): string {
  const whole = stroops / 10_000_000n;
  const fraction = String(stroops % 10_000_000n).padStart(7, '0');
  return `${whole}.${fraction}`;
}
