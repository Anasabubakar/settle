import { GESTURE_OPTIONS, demoBills, formatMoney, getFundingPercentage, getFundingProgress, getRemainingAmount, isFullyFunded } from '@/data/bills';
import type { Bill } from '@/types/domain';

const bill = (total: number, funded: number, currency: 'USD' | 'NGN' = 'USD'): Bill => ({
  ...demoBills[0],
  total: { amountMinor: total, currency },
  funded: { amountMinor: funded, currency },
});

describe('demo bill fixtures', () => {
  it('have unique ids and consistent money', () => {
    expect(new Set(demoBills.map((b) => b.id)).size).toBe(demoBills.length);
    for (const b of demoBills) {
      expect(b.total.currency).toBe(b.funded.currency);
      expect(Number.isInteger(b.total.amountMinor)).toBe(true);
      expect(b.funded.amountMinor).toBeLessThanOrEqual(b.total.amountMinor);
      expect(b.paysProviderDirectly).toBe(true);
    }
  });
  it('only offer optional gestures that exist and can be declined', () => {
    const ids = GESTURE_OPTIONS.map((g) => g.id);
    for (const b of demoBills) for (const g of b.allowedGestures) expect(ids).toContain(g);
    for (const g of GESTURE_OPTIONS) expect(g.requesterCanDecline).toBe(true);
  });
  it('never describe themselves as safe, secure, audited or guaranteed', () => {
    const text = JSON.stringify(demoBills) + JSON.stringify(GESTURE_OPTIONS);
    expect(text).not.toMatch(/\b(safe|secure|audited|guaranteed)\b/i);
  });
});

describe('funding helpers', () => {
  it('computes remaining and never goes negative', () => {
    expect(getRemainingAmount(bill(10000, 2500)).amountMinor).toBe(7500);
    expect(getRemainingAmount(bill(10000, 12000)).amountMinor).toBe(0);
  });
  it('computes progress clamped to 0..1', () => {
    expect(getFundingProgress(bill(10000, 2500))).toBe(0.25);
    expect(getFundingProgress(bill(10000, 99999))).toBe(1);
    expect(getFundingProgress(bill(0, 0))).toBe(0);
    expect(getFundingPercentage(bill(3, 1))).toBe(33);
  });
  it('detects fully funded', () => {
    expect(isFullyFunded(bill(100, 100))).toBe(true);
    expect(isFullyFunded(bill(100, 99))).toBe(false);
  });
  it('refuses mismatched currencies', () => {
    const bad = { ...bill(100, 0), funded: { amountMinor: 0, currency: 'NGN' as const } };
    expect(() => getRemainingAmount(bad)).toThrow(/currency mismatch/);
  });
  it('formats minor units as currency', () => {
    expect(formatMoney({ amountMinor: 1999, currency: 'USD' }, 'en-US')).toBe('$19.99');
  });
});
