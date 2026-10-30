import { STELLAR_NETWORK, settlementApiUrl } from '@/services/stellar';

/**
 * Client for the settlement API (see openapi.yaml in the settle-api repository).
 * It sends only what the supporter chooses: a bill, an amount, their own account and the signed XDR.
 * Destination, asset issuer, rate, fee, memo and network are never sent; the server decides them.
 * Any failure to get a definite answer is thrown as a SettlementApiError, never turned into a success.
 */

export const REQUEST_TIMEOUT_MS = 15_000;

export type ApiQuote = {
  quoteId: string;
  usdcAmountStroops: string;
  assetIssuer: string;
  destination: string;
  memo: string;
  expiresAt: string;
  networkPassphrase: string;
  unsignedXdr: string;
  state?: string;
  billId?: string;
  source?: string;
  provider?: { id?: string; displayName?: string; fixture?: boolean };
  fiat?: { amountMinor: string; currency: string };
  usdc?: { amountStroops?: string; amount?: string; assetCode?: string; assetIssuer?: string };
  rate?: { usdMicroPerMajor?: string; source?: string; lockedUntil?: string };
  fees?: {
    network?: { asset?: string; stroops?: string; paidBy?: string };
    platform?: { bps?: number };
  };
};

export type ApiPaymentStatus = 'submitted' | 'confirmed' | 'failed';

export type ApiReceipt = {
  id: string;
  sequence?: number;
  hash?: string;
  prevHash?: string;
  paymentId?: string;
  quoteId?: string;
  billId?: string;
  txHash: string;
  stellarLedger?: number;
  confirmedAt?: string;
};

export type ApiPayment = {
  paymentId: string;
  quoteId: string;
  billId: string;
  status: ApiPaymentStatus;
  txHash: string;
  explorerUrl?: string;
  note?: string;
  stellarLedger?: number;
  failure?: { code?: string; message?: string } | null;
  receipt?: ApiReceipt;
};

export type ApiBill = {
  id: string;
  status: 'open' | 'settled' | 'paused' | 'under_review';
  currency: string;
  totalMinor: string;
  fundedMinor: string;
  reservedMinor: string;
  remainingMinor: string;
  acceptsPartialFunding?: boolean;
  provider?: { id?: string; displayName?: string; verification?: string };
};

export type SettlementErrorKind =
  | 'not_configured'
  | 'unreachable'
  | 'timeout'
  | 'bad_response'
  | 'wrong_network'
  | 'api';

export class SettlementApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly kind: SettlementErrorKind;
  readonly details?: Record<string, unknown>;
  /** True when the request may have reached the server (so the outcome is unknown, not "nothing happened"). */
  readonly outcomeUnknown: boolean;
  constructor(
    status: number,
    code: string,
    message: string,
    options: { kind?: SettlementErrorKind; details?: Record<string, unknown>; outcomeUnknown?: boolean } = {},
  ) {
    super(message);
    this.name = 'SettlementApiError';
    this.status = status;
    this.code = code;
    this.kind = options.kind ?? 'api';
    this.details = options.details;
    this.outcomeUnknown = options.outcomeUnknown ?? false;
  }
}

export function settlementApiConfigured(): boolean {
  return Boolean(settlementApiUrl());
}

/** Plain-language text for each stable API error code. Falls back to the server's own message. */
const ERROR_COPY: Record<string, string> = {
  quote_expired: 'This quote expired before it was paid. Nothing was paid. Request a new quote.',
  quote_already_used: 'This quote was already used. Check your activity before paying again.',
  quote_failed: 'This quote can no longer be paid. Request a new quote.',
  bill_not_open: 'This bill is not open for contributions right now.',
  exceeds_remaining: 'That amount is more than the bill still needs. Choose a smaller amount.',
  source_account_not_found: 'Your wallet account does not exist on Stellar testnet yet. Fund it with the testnet friendbot first.',
  trustline_missing: 'Your wallet account has no USDC trustline on testnet. Add one before contributing.',
  insufficient_balance: 'Your wallet does not hold enough testnet USDC for this amount.',
  insufficient_native_balance: 'Your wallet does not hold enough XLM to pay the network fee.',
  currency_mismatch: 'The currency does not match this bill.',
  amount_too_small: 'That amount is below the minimum contribution.',
  partial_funding_not_allowed: 'This bill needs one complete payment.',
  signed_payload_mismatch: 'The signed payment does not match the server quote. Nothing was sent. Request a new quote.',
  invalid_signature: 'The payment was not signed by your wallet account. Nothing was sent.',
  rate_limited: 'Too many requests. Wait a moment and try again.',
  client_authority_forbidden: 'The request was refused because it tried to choose payment details only the server may choose.',
};

export function describeSettlementError(error: unknown): string {
  if (error instanceof SettlementApiError) {
    return ERROR_COPY[error.code] ?? error.message;
  }
  return 'Something went wrong. Nothing was confirmed.';
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function call<T>(
  method: 'GET' | 'POST',
  path: string,
  options: { body?: unknown; idempotencyKey?: string; mayHaveReachedServer?: boolean } = {},
): Promise<unknown> {
  const baseUrl = settlementApiUrl();
  if (!baseUrl) throw new SettlementApiError(0, 'not_configured', 'No settlement API is configured for this build.', { kind: 'not_configured' });
  const { body, idempotencyKey, mayHaveReachedServer = false } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    const aborted = controller.signal.aborted || (error instanceof Error && error.name === 'AbortError');
    const suffix = mayHaveReachedServer
      ? ' The request may have been received, so the outcome is unknown. Retrying is safe: it will not pay twice.'
      : ' Nothing was paid.';
    throw new SettlementApiError(
      0,
      aborted ? 'timeout' : 'network',
      aborted ? `The settlement service did not answer in time.${suffix}` : `Could not reach the settlement service.${suffix}`,
      { kind: aborted ? 'timeout' : 'unreachable', outcomeUnknown: mayHaveReachedServer },
    );
  } finally {
    clearTimeout(timer);
  }
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const err = isObject(payload) && isObject(payload.error) ? payload.error : undefined;
    throw new SettlementApiError(
      response.status,
      typeof err?.code === 'string' ? err.code : 'error',
      typeof err?.message === 'string' ? err.message : 'The settlement service rejected the request.',
      { details: isObject(err?.details) ? err.details : undefined },
    );
  }
  if (!isObject(payload)) {
    throw new SettlementApiError(response.status, 'bad_response', 'The settlement service sent an answer this app could not read.', {
      kind: 'bad_response',
      outcomeUnknown: mayHaveReachedServer,
    });
  }
  return payload as T;
}

function requireStrings(value: Record<string, unknown>, keys: string[], what: string, mayHaveReachedServer = false) {
  for (const key of keys) {
    if (typeof value[key] !== 'string' || value[key] === '') {
      throw new SettlementApiError(200, 'bad_response', `The settlement service sent an incomplete ${what}.`, {
        kind: 'bad_response',
        outcomeUnknown: mayHaveReachedServer,
      });
    }
  }
}

/** A fresh key per user action; retrying the same action must reuse the same key. */
export function newIdempotencyKey(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export type QuoteInput = { billId: string; amountMinor: number; currency: string; sourceAccount: string };

export async function requestQuote(input: QuoteInput, idempotencyKey: string): Promise<ApiQuote> {
  // Explicit allow-list: even a caller that smuggles extra fields past the type system cannot send them.
  const body = {
    billId: input.billId,
    amountMinor: input.amountMinor,
    currency: input.currency,
    sourceAccount: input.sourceAccount,
  };
  const quote = (await call('POST', '/v1/quotes', { body, idempotencyKey })) as Record<string, unknown>;
  requireStrings(quote, ['quoteId', 'usdcAmountStroops', 'assetIssuer', 'destination', 'memo', 'expiresAt', 'unsignedXdr'], 'quote');
  if (quote.networkPassphrase !== STELLAR_NETWORK.passphrase) {
    throw new SettlementApiError(0, 'wrong_network', 'The quote is for a different Stellar network than this app.', { kind: 'wrong_network' });
  }
  return quote as unknown as ApiQuote;
}

export async function submitSignedPayment(input: { quoteId: string; signedXdr: string }, idempotencyKey: string): Promise<ApiPayment> {
  const body = { quoteId: input.quoteId, signedXdr: input.signedXdr };
  const payment = (await call('POST', '/v1/payments', { body, idempotencyKey, mayHaveReachedServer: true })) as Record<string, unknown>;
  requireStrings(payment, ['paymentId', 'quoteId', 'billId', 'status', 'txHash'], 'payment', true);
  return payment as unknown as ApiPayment;
}

export async function getPayment(paymentId: string): Promise<ApiPayment> {
  const payment = (await call('GET', `/v1/payments/${encodeURIComponent(paymentId)}`)) as Record<string, unknown>;
  requireStrings(payment, ['paymentId', 'status', 'txHash'], 'payment');
  return payment as unknown as ApiPayment;
}

export async function getBill(billId: string): Promise<ApiBill> {
  const bill = (await call('GET', `/v1/bills/${encodeURIComponent(billId)}`)) as Record<string, unknown>;
  requireStrings(bill, ['id', 'status', 'currency', 'remainingMinor'], 'bill');
  return bill as unknown as ApiBill;
}

export async function getReceipt(receiptId: string): Promise<ApiReceipt> {
  const receipt = (await call('GET', `/v1/receipts/${encodeURIComponent(receiptId)}`)) as Record<string, unknown>;
  requireStrings(receipt, ['id', 'txHash'], 'receipt');
  return receipt as unknown as ApiReceipt;
}

/** Link to the receipt JSON on the settlement service. */
export function receiptUrl(receiptId: string): string | undefined {
  const baseUrl = settlementApiUrl();
  return baseUrl ? `${baseUrl}/v1/receipts/${encodeURIComponent(receiptId)}` : undefined;
}
