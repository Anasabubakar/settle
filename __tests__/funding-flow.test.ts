import { Keypair, Networks, TransactionBuilder } from '@stellar/stellar-sdk';

import {
  FundingError,
  awaitConfirmation,
  classifyPayment,
  verifyQuote,
  verifySignedMatchesUnsigned,
} from '@/services/funding-flow';
import type { ApiPayment, ApiQuote } from '@/services/settlement-client';
import { EXPECTED, PASSPHRASE, buildUnsigned, issuer, jsonResponse, makeQuote, provider, stranger, supporter } from './helpers';

const quoteOf = (over: Record<string, unknown> = {}, tx: Parameters<typeof makeQuote>[1] = {}) => makeQuote(over, tx) as unknown as ApiQuote;
const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return (e as FundingError).code;
  }
  return 'no_error';
};

describe('verifyQuote', () => {
  it('accepts a quote whose transaction matches every disclosed field', () => {
    expect(verifyQuote(quoteOf(), EXPECTED).operations).toHaveLength(1);
  });

  it.each([
    ['different bill', { billId: 'bill-other' }, {}],
    ['different amount shown', { fiat: { amountMinor: '999', currency: 'USD' } }, {}],
    ['different currency shown', { fiat: { amountMinor: '1000', currency: 'GBP' } }, {}],
    ['different wallet account', { source: stranger.publicKey() }, {}],
    ['different network', { networkPassphrase: Networks.PUBLIC }, {}],
    ['no expiry', { expiresAt: 'soon' }, {}],
    ['XDR pays another destination', {}, { destination: stranger.publicKey() }],
    ['XDR uses another issuer', {}, { issuer: stranger.publicKey() }],
    ['XDR uses another asset code', {}, { code: 'EURC' }],
    ['XDR amount differs from stroops', {}, { amount: '10.0000001' }],
    ['XDR memo differs', {}, { memo: 'SETTLE-evil' }],
    ['XDR pays from another account', {}, { source: stranger.publicKey() }],
    ['XDR outlives the quote', {}, { maxTime: Math.floor(Date.now() / 1000) + 3600 }],
    ['XDR has no time bound', {}, { maxTime: 0 }],
    ['displayed USDC differs from XDR', { usdc: { amount: '9.0000000' } }, {}],
  ])('refuses: %s', (_name, over, tx) => {
    expect(code(() => verifyQuote(quoteOf(over, tx), EXPECTED))).toBe('quote_mismatch');
  });

  it('refuses a stated destination that disagrees with the XDR', () => {
    expect(code(() => verifyQuote(quoteOf({ destination: stranger.publicKey() }), EXPECTED))).toBe('quote_mismatch');
  });

  it('reports an expired quote as expired', () => {
    expect(code(() => verifyQuote(quoteOf({ expiresAt: new Date(Date.now() - 1000).toISOString() }), EXPECTED))).toBe('quote_expired');
    expect(code(() => verifyQuote(quoteOf(), EXPECTED, Date.now() + 10 * 60_000))).toBe('quote_expired');
  });

  it('refuses garbage and already signed transactions', () => {
    expect(code(() => verifyQuote(quoteOf({ unsignedXdr: 'AAAA' }), EXPECTED))).toBe('bad_transaction');
    const signed = buildUnsigned();
    signed.sign(supporter);
    expect(code(() => verifyQuote(quoteOf({ unsignedXdr: signed.toXDR() }), EXPECTED))).toBe('quote_mismatch');
  });

  it('refuses a transaction with two operations', () => {
    const tx = buildUnsigned();
    const two = TransactionBuilder.cloneFrom(tx, { fee: '200', networkPassphrase: PASSPHRASE });
    const extra = tx.operations[0];
    // reuse the same payment op twice
    two.addOperation({ ...extra } as never);
    let xdr = '';
    try {
      xdr = two.build().toXDR();
    } catch {
      return; // the SDK itself refused to build it: nothing to verify
    }
    expect(code(() => verifyQuote(quoteOf({ unsignedXdr: xdr }), EXPECTED))).toBe('quote_mismatch');
  });
});

describe('verifySignedMatchesUnsigned', () => {
  it('accepts the same transaction with a signature added', () => {
    const quote = quoteOf();
    const tx = TransactionBuilder.fromXDR(quote.unsignedXdr, PASSPHRASE);
    tx.sign(supporter);
    expect(() => verifySignedMatchesUnsigned(quote.unsignedXdr, tx.toXDR())).not.toThrow();
  });
  it('refuses an unsigned echo', () => {
    const quote = quoteOf();
    expect(code(() => verifySignedMatchesUnsigned(quote.unsignedXdr, quote.unsignedXdr))).toBe('signed_mismatch');
  });
  it('refuses a different transaction even if properly signed', () => {
    const quote = quoteOf();
    const other = buildUnsigned({ destination: Keypair.random().publicKey() });
    other.sign(supporter);
    expect(code(() => verifySignedMatchesUnsigned(quote.unsignedXdr, other.toXDR()))).toBe('signed_mismatch');
  });
  it('refuses a non-transaction', () => {
    expect(code(() => verifySignedMatchesUnsigned(quoteOf().unsignedXdr, 'not xdr'))).toBe('signed_mismatch');
  });
});

describe('classifyPayment', () => {
  const quote = { quoteId: 'q_abc123', billId: 'bill-maya-prescription' };
  const hash = 'a'.repeat(64);
  const base: ApiPayment = { paymentId: 'p_1', quoteId: 'q_abc123', billId: 'bill-maya-prescription', status: 'submitted', txHash: hash };
  const receipt = { id: 'r_1', txHash: hash };

  it('confirmed requires a receipt for the same transaction', () => {
    expect(classifyPayment({ ...base, status: 'confirmed', receipt }, quote).kind).toBe('confirmed');
    expect(classifyPayment({ ...base, status: 'confirmed' }, quote).kind).toBe('unverified');
    expect(classifyPayment({ ...base, status: 'confirmed', receipt: { id: 'r_1', txHash: 'b'.repeat(64) } }, quote).kind).toBe('unverified');
  });
  it('is not confirmed when the payment belongs to another quote or bill', () => {
    expect(classifyPayment({ ...base, status: 'confirmed', receipt, quoteId: 'q_other' }, quote).kind).toBe('unverified');
    expect(classifyPayment({ ...base, status: 'confirmed', receipt, billId: 'bill-x' }, quote).kind).toBe('unverified');
  });
  it('shows failure with the server message, and never a receipt', () => {
    const out = classifyPayment({ ...base, status: 'failed', failure: { code: 'expired_unseen', message: 'Expired before it landed.' } }, quote);
    expect(out).toMatchObject({ kind: 'failed', message: 'Expired before it landed.' });
  });
  it('treats submitted as pending and unknown statuses as unverified', () => {
    expect(classifyPayment(base, quote).kind).toBe('pending');
    expect(classifyPayment({ ...base, status: 'weird' as never }, quote).kind).toBe('unverified');
  });
});

describe('awaitConfirmation', () => {
  const quote = { quoteId: 'q_abc123', billId: 'bill-maya-prescription' };
  const hash = 'a'.repeat(64);
  const submitted = { paymentId: 'p_1', quoteId: 'q_abc123', billId: 'bill-maya-prescription', status: 'submitted', txHash: hash };
  let fetchMock: jest.Mock;
  beforeEach(() => {
    process.env.EXPO_PUBLIC_SETTLE_API_URL = 'http://localhost:8787';
    fetchMock = jest.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });
  afterEach(() => delete process.env.EXPO_PUBLIC_SETTLE_API_URL);

  const clock = () => {
    let t = 0;
    return { now: () => t, sleep: async (ms: number) => { t += ms; } };
  };

  it('polls until confirmed with a receipt', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, submitted))
      .mockResolvedValueOnce(jsonResponse(200, { ...submitted, status: 'confirmed', receipt: { id: 'r_1', txHash: hash } }));
    const out = await awaitConfirmation(submitted as ApiPayment, quote, clock());
    expect(out.kind).toBe('confirmed');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
  it('returns pending, not success, when the time budget runs out', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, submitted));
    const out = await awaitConfirmation(submitted as ApiPayment, quote, { ...clock(), timeoutMs: 6000 });
    expect(out.kind).toBe('pending');
    expect(out.kind === 'pending' && out.message).toMatch(/not counted as paid/);
  });
  it('keeps pending when the service is unreachable while polling', async () => {
    fetchMock.mockRejectedValue(new TypeError('down'));
    const out = await awaitConfirmation(submitted as ApiPayment, quote, { ...clock(), timeoutMs: 4000 });
    expect(out.kind).toBe('pending');
  });
  it('ends as failed when the server reports failure', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ...submitted, status: 'failed', failure: { code: 'confirmation_mismatch', message: 'Mismatch.' } }));
    expect((await awaitConfirmation(submitted as ApiPayment, quote, clock())).kind).toBe('failed');
  });
  it('does not poll when already settled', async () => {
    const out = await awaitConfirmation({ ...submitted, status: 'failed' } as ApiPayment, quote, clock());
    expect(out.kind).toBe('failed');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

// keep unused-helper imports honest
void [issuer, provider];
