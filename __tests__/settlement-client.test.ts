import {
  REQUEST_TIMEOUT_MS,
  SettlementApiError,
  describeSettlementError,
  getBill,
  getPayment,
  getReceipt,
  newIdempotencyKey,
  receiptUrl,
  requestQuote,
  settlementApiConfigured,
  submitSignedPayment,
} from '@/services/settlement-client';
import { jsonResponse, makeQuote } from './helpers';

const API = 'http://localhost:8787';
const input = { billId: 'bill-maya-prescription', amountMinor: 1000, currency: 'USD', sourceAccount: 'GABC' };
let fetchMock: jest.Mock;

beforeEach(() => {
  process.env.EXPO_PUBLIC_SETTLE_API_URL = `${API}/`;
  delete process.env.EXPO_PUBLIC_SETTLEMENT_API_URL;
  fetchMock = jest.fn();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});
afterEach(() => {
  delete process.env.EXPO_PUBLIC_SETTLE_API_URL;
  jest.useRealTimers();
});

const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body as string);
const sentHeaders = () => fetchMock.mock.calls[0][1].headers as Record<string, string>;

describe('configuration', () => {
  it('is demo mode when no URL is set', async () => {
    delete process.env.EXPO_PUBLIC_SETTLE_API_URL;
    expect(settlementApiConfigured()).toBe(false);
    await expect(getBill('x')).rejects.toMatchObject({ kind: 'not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('rejects a non-http URL and trims trailing slashes', () => {
    process.env.EXPO_PUBLIC_SETTLE_API_URL = 'javascript:alert(1)';
    expect(settlementApiConfigured()).toBe(false);
    process.env.EXPO_PUBLIC_SETTLE_API_URL = 'not a url';
    expect(settlementApiConfigured()).toBe(false);
  });
  it('still reads the older variable name', () => {
    delete process.env.EXPO_PUBLIC_SETTLE_API_URL;
    process.env.EXPO_PUBLIC_SETTLEMENT_API_URL = API;
    expect(settlementApiConfigured()).toBe(true);
    delete process.env.EXPO_PUBLIC_SETTLEMENT_API_URL;
  });
});

describe('requestQuote', () => {
  it('posts only the four supporter-chosen fields with the idempotency key', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, makeQuote()));
    await requestQuote(input, 'key-0001-abcd');
    expect(fetchMock.mock.calls[0][0]).toBe(`${API}/v1/quotes`);
    expect(fetchMock.mock.calls[0][1].method).toBe('POST');
    expect(sentBody()).toEqual(input);
    expect(sentHeaders()['idempotency-key']).toBe('key-0001-abcd');
    expect(sentHeaders()['content-type']).toBe('application/json');
  });

  it('refuses to send a client-chosen destination, issuer, rate, fee, memo or network', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, makeQuote()));
    const smuggled = {
      ...input,
      destination: 'GATTACKER',
      assetIssuer: 'GISSUER',
      issuer: 'GISSUER',
      providerId: 'prov-x',
      rate: '1',
      fee: '0',
      memo: 'x',
      network: 'public',
      networkPassphrase: 'Public Global Stellar Network ; September 2015',
      usdcAmountStroops: '1',
    };
    await requestQuote(smuggled as unknown as typeof input, 'key-0001-abcd');
    expect(Object.keys(sentBody()).sort()).toEqual(['amountMinor', 'billId', 'currency', 'sourceAccount']);
    expect(JSON.stringify(sentBody())).not.toMatch(/GATTACKER|GISSUER|Public Global/);
  });

  it('rejects a quote for another network', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, makeQuote({ networkPassphrase: 'Public Global Stellar Network ; September 2015' })));
    await expect(requestQuote(input, 'key-0001-abcd')).rejects.toMatchObject({ code: 'wrong_network', kind: 'wrong_network' });
  });

  it('rejects an incomplete quote instead of using it', async () => {
    const quote = makeQuote() as Record<string, unknown>;
    delete quote.unsignedXdr;
    fetchMock.mockResolvedValue(jsonResponse(201, quote));
    await expect(requestQuote(input, 'key-0001-abcd')).rejects.toMatchObject({ kind: 'bad_response' });
  });

  it('maps API errors to stable codes and plain text', async () => {
    fetchMock.mockResolvedValue(jsonResponse(409, { error: { code: 'trustline_missing', message: 'raw', details: { a: 1 } } }));
    const error = await requestQuote(input, 'key-0001-abcd').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(SettlementApiError);
    expect(error).toMatchObject({ status: 409, code: 'trustline_missing', details: { a: 1 }, outcomeUnknown: false });
    expect(describeSettlementError(error)).toMatch(/USDC trustline/);
  });

  it('falls back to the server message for unknown codes and unreadable error bodies', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { error: { code: 'brand_new', message: 'Server words' } }));
    expect(describeSettlementError(await requestQuote(input, 'key-0001-abcd').catch((e: unknown) => e))).toBe('Server words');
    fetchMock.mockResolvedValueOnce({ ok: false, status: 502, json: async () => { throw new Error('html'); } } as unknown as Response);
    const error = await requestQuote(input, 'key-0001-abcd').catch((e: unknown) => e);
    expect(error).toMatchObject({ status: 502, code: 'error' });
  });

  it('reports a network failure as a failure that paid nothing', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await requestQuote(input, 'key-0001-abcd').catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'unreachable', code: 'network', outcomeUnknown: false });
    expect((error as Error).message).toMatch(/Nothing was paid/);
  });

  it('times out and aborts the request', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementation((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal?.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    }));
    const pending = requestQuote(input, 'key-0001-abcd').catch((e: unknown) => e);
    await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 1);
    expect(await pending).toMatchObject({ kind: 'timeout', code: 'timeout' });
  });

  it('treats a non-object success body as a bad response', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, ['nope']));
    await expect(requestQuote(input, 'key-0001-abcd')).rejects.toMatchObject({ kind: 'bad_response' });
  });
});

describe('submitSignedPayment', () => {
  const payment = { paymentId: 'p_1', quoteId: 'q_abc123', billId: 'b', status: 'submitted', txHash: 'a'.repeat(64) };

  it('posts the quote id and signed xdr only', async () => {
    fetchMock.mockResolvedValue(jsonResponse(202, payment));
    await submitSignedPayment({ quoteId: 'q_abc123', signedXdr: 'AAAA', extra: 'x' } as never, 'pay-0001-abcd');
    expect(sentBody()).toEqual({ quoteId: 'q_abc123', signedXdr: 'AAAA' });
    expect(sentHeaders()['idempotency-key']).toBe('pay-0001-abcd');
  });

  it('marks a network failure after sending as outcome unknown, never as nothing-happened', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    const error = await submitSignedPayment({ quoteId: 'q', signedXdr: 'A' }, 'pay-0001-abcd').catch((e: unknown) => e);
    expect(error).toMatchObject({ kind: 'unreachable', outcomeUnknown: true });
    expect((error as Error).message).toMatch(/outcome is unknown/);
    expect((error as Error).message).not.toMatch(/Nothing was paid/);
  });

  it.each([
    [410, 'quote_expired', /expired/],
    [409, 'quote_already_used', /already used/],
    [422, 'signed_payload_mismatch', /does not match/],
    [422, 'invalid_signature', /not signed by your wallet/],
  ])('maps %s %s', async (status, code, text) => {
    fetchMock.mockResolvedValue(jsonResponse(status, { error: { code, message: 'm' } }));
    const error = await submitSignedPayment({ quoteId: 'q', signedXdr: 'A' }, 'pay-0001-abcd').catch((e: unknown) => e);
    expect(describeSettlementError(error)).toMatch(text);
  });

  it('rejects a payment answer missing its transaction hash', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { ...payment, txHash: undefined }));
    await expect(submitSignedPayment({ quoteId: 'q', signedXdr: 'A' }, 'pay-0001-abcd')).rejects.toMatchObject({ kind: 'bad_response', outcomeUnknown: true });
  });
});

describe('reads', () => {
  it('encodes ids in paths and sends no body or idempotency key', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { paymentId: 'p_1', status: 'submitted', txHash: 'a'.repeat(64) }));
    await getPayment('p_1/../x');
    expect(fetchMock.mock.calls[0][0]).toBe(`${API}/v1/payments/p_1%2F..%2Fx`);
    expect(fetchMock.mock.calls[0][1].body).toBeUndefined();
    expect(sentHeaders()['idempotency-key']).toBeUndefined();
  });
  it('reads a bill and a receipt', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 'b', status: 'open', currency: 'USD', remainingMinor: '5000' }));
    expect((await getBill('b')).remainingMinor).toBe('5000');
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { id: 'r_1', txHash: 'a'.repeat(64) }));
    expect((await getReceipt('r_1')).id).toBe('r_1');
  });
  it('builds a receipt link on the API host', () => {
    expect(receiptUrl('r_1')).toBe(`${API}/v1/receipts/r_1`);
  });
});

describe('newIdempotencyKey', () => {
  it('is 32 hex characters and unique', () => {
    const a = newIdempotencyKey();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(newIdempotencyKey()).not.toBe(a);
  });
});

describe('describeSettlementError', () => {
  it('never claims success for an unknown error', () => {
    expect(describeSettlementError(new Error('x'))).toMatch(/Nothing was confirmed/);
  });
});
