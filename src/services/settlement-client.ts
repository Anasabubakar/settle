import { STELLAR_NETWORK } from '@/services/stellar';

/**
 * Client for the settlement API (see openapi.yaml in the settle-api repository).
 * It sends only what the supporter chooses: a bill, an amount, their own account and the signed XDR.
 * Destination, asset issuer, rate, fee, memo and network are never sent; the server decides them.
 */
const baseUrl = process.env.EXPO_PUBLIC_SETTLEMENT_API_URL?.replace(/\/+$/, '');

export type ApiQuote = {
  quoteId: string;
  usdcAmountStroops: string;
  assetIssuer: string;
  destination: string;
  memo: string;
  expiresAt: string;
  networkPassphrase: string;
  unsignedXdr: string;
};

export type ApiPaymentStatus = 'submitted' | 'confirmed' | 'failed';

export type ApiPayment = {
  paymentId: string;
  quoteId: string;
  billId: string;
  status: ApiPaymentStatus;
  txHash: string;
  explorerUrl?: string;
  failure?: { code?: string; message?: string } | null;
};

export class SettlementApiError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'SettlementApiError';
    this.status = status;
    this.code = code;
  }
}

export function settlementApiConfigured(): boolean {
  return Boolean(baseUrl);
}

async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown, idempotencyKey?: string): Promise<T> {
  if (!baseUrl) throw new SettlementApiError(0, 'not_configured', 'No settlement API is configured for this build.');
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        accept: 'application/json',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new SettlementApiError(0, 'network', 'Could not reach the settlement service. Nothing was paid.');
  }
  const payload = (await response.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
  if (!response.ok) {
    throw new SettlementApiError(
      response.status,
      payload?.error?.code ?? 'error',
      payload?.error?.message ?? 'The settlement service rejected the request.',
    );
  }
  return payload as T;
}

/** A fresh key per user action; retrying the same action must reuse the same key. */
export function newIdempotencyKey(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function requestQuote(
  input: { billId: string; amountMinor: number; currency: string; sourceAccount: string },
  idempotencyKey: string,
): Promise<ApiQuote> {
  const quote = await call<ApiQuote>('POST', '/v1/quotes', input, idempotencyKey);
  if (quote.networkPassphrase !== STELLAR_NETWORK.passphrase) {
    throw new SettlementApiError(0, 'wrong_network', 'The quote is for a different Stellar network than this app.');
  }
  return quote;
}

export function submitSignedPayment(input: { quoteId: string; signedXdr: string }, idempotencyKey: string) {
  return call<ApiPayment>('POST', '/v1/payments', input, idempotencyKey);
}

export function getPayment(paymentId: string) {
  return call<ApiPayment>('GET', `/v1/payments/${encodeURIComponent(paymentId)}`);
}
