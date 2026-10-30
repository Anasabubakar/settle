import { FeeBumpTransaction, Transaction, TransactionBuilder } from '@stellar/stellar-sdk';

import { amountToStroops, stroopsToAmount } from '@/services/amount';
import {
  getPayment,
  requestQuote,
  submitSignedPayment,
  type ApiPayment,
  type ApiQuote,
  type ApiReceipt,
  type QuoteInput,
} from '@/services/settlement-client';
import { STELLAR_NETWORK } from '@/services/stellar';
import type { WalletAdapter } from '@/services/wallet';

/**
 * The supporter funding flow, as plain functions so every honest-failure rule is testable:
 * quote -> check the quote and the unsigned transaction -> wallet signs -> check what came back -> submit -> confirm.
 * Nothing here is "success" until the server says confirmed AND returns a receipt for the same transaction.
 */

export type FundingErrorCode =
  | 'quote_mismatch'
  | 'quote_expired'
  | 'bad_transaction'
  | 'signed_mismatch';

export class FundingError extends Error {
  readonly code: FundingErrorCode;
  constructor(code: FundingErrorCode, message: string) {
    super(message);
    this.name = 'FundingError';
    this.code = code;
  }
}

const mismatch = (message: string) => new FundingError('quote_mismatch', `${message} Nothing was signed or paid. Request a new quote.`);

function parseTransaction(xdr: string, passphrase: string): Transaction {
  let parsed: Transaction | FeeBumpTransaction;
  try {
    parsed = TransactionBuilder.fromXDR(xdr, passphrase);
  } catch {
    throw new FundingError('bad_transaction', 'The payment from the server could not be read. Nothing was signed or paid. Request a new quote.');
  }
  if (!(parsed instanceof Transaction)) {
    throw new FundingError('bad_transaction', 'The server sent an unexpected kind of transaction. Nothing was signed or paid.');
  }
  return parsed;
}

const toHex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

function memoText(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value instanceof Uint8Array) return new TextDecoder().decode(value);
  return null;
}

/**
 * Defence in depth: the server already builds exactly what it quotes, and checks the signed result again.
 * The client still refuses to put a wallet signature on anything that disagrees with the quote it is showing.
 */
export function verifyQuote(
  quote: ApiQuote,
  expected: QuoteInput,
  now: number = Date.now(),
  passphrase: string = STELLAR_NETWORK.passphrase,
): Transaction {
  if (quote.networkPassphrase !== passphrase) throw mismatch('The quote is for a different Stellar network.');
  if (quote.billId !== undefined && quote.billId !== expected.billId) throw mismatch('The quote is for a different bill.');
  if (quote.fiat) {
    if (quote.fiat.amountMinor !== String(expected.amountMinor)) throw mismatch('The quoted amount is not the amount you chose.');
    if (quote.fiat.currency !== expected.currency) throw mismatch('The quoted currency is not the bill currency.');
  }
  if (quote.source !== undefined && quote.source !== expected.sourceAccount) throw mismatch('The quote is for a different wallet account.');
  const expiresAt = Date.parse(quote.expiresAt);
  if (!Number.isFinite(expiresAt)) throw mismatch('The quote has no valid expiry.');
  if (expiresAt <= now) throw new FundingError('quote_expired', 'This quote has expired. Nothing was paid. Request a new quote.');

  const tx = parseTransaction(quote.unsignedXdr, passphrase);
  if (tx.signatures.length !== 0) throw mismatch('The transaction arrived already signed.');
  if (tx.source !== expected.sourceAccount) throw mismatch('The transaction pays from a different account.');
  if (tx.operations.length !== 1) throw mismatch('The transaction has more than one operation.');
  const op = tx.operations[0];
  if (op.type !== 'payment') throw mismatch('The transaction is not a plain payment.');
  if (op.destination !== quote.destination) throw mismatch('The transaction pays a different destination than the quote states.');
  if (op.asset.getCode() !== 'USDC' || op.asset.getIssuer() !== quote.assetIssuer) throw mismatch('The transaction pays a different asset than the quote states.');
  const stroops = amountToStroops(op.amount);
  if (stroops === null || stroops.toString() !== quote.usdcAmountStroops) throw mismatch('The transaction amount differs from the quoted USDC amount.');
  if (quote.usdc?.amount !== undefined && quote.usdc.amount !== stroopsToAmount(stroops)) throw mismatch('The quote shows a different USDC amount than it asks you to sign.');
  if (tx.memo.type !== 'text' || memoText(tx.memo.value) !== quote.memo) throw mismatch('The transaction memo differs from the quote.');
  const maxTime = Number(tx.timeBounds?.maxTime ?? 0);
  if (!maxTime || maxTime * 1000 > expiresAt + 1000) throw mismatch('The transaction does not expire with the quote.');
  return tx;
}

/** The wallet may only add a signature. Anything that changes the transaction hash is refused before submission. */
export function verifySignedMatchesUnsigned(
  unsignedXdr: string,
  signedXdr: string,
  passphrase: string = STELLAR_NETWORK.passphrase,
): void {
  const unsigned = parseTransaction(unsignedXdr, passphrase);
  let signed: Transaction;
  try {
    signed = parseTransaction(signedXdr, passphrase);
  } catch {
    throw new FundingError('signed_mismatch', 'The wallet returned something that is not the payment. Nothing was sent.');
  }
  if (toHex(signed.hash()) !== toHex(unsigned.hash())) {
    throw new FundingError('signed_mismatch', 'The wallet returned a different transaction than the one quoted. Nothing was sent.');
  }
  if (signed.signatures.length < 1) {
    throw new FundingError('signed_mismatch', 'The wallet did not sign the payment. Nothing was sent.');
  }
}

export type FundingOutcome =
  | { kind: 'confirmed'; payment: ApiPayment; receipt: ApiReceipt }
  | { kind: 'failed'; payment: ApiPayment; message: string }
  | { kind: 'unverified'; payment: ApiPayment; message: string }
  | { kind: 'pending'; payment: ApiPayment; message: string };

/**
 * Turns a payment record into an outcome. "confirmed" is returned only when the server says confirmed, includes a
 * receipt, and that receipt belongs to the same transaction, quote and bill. Anything else is not shown as success.
 */
export function classifyPayment(payment: ApiPayment, quote: Pick<ApiQuote, 'quoteId' | 'billId'>): FundingOutcome {
  if (payment.quoteId !== quote.quoteId || (quote.billId !== undefined && payment.billId !== quote.billId)) {
    return { kind: 'unverified', payment, message: 'The service answered about a different payment than the one you made. It is not shown as paid.' };
  }
  if (payment.status === 'confirmed') {
    const receipt = payment.receipt;
    if (!receipt || receipt.txHash !== payment.txHash) {
      return { kind: 'unverified', payment, message: 'The service reported a payment without a matching receipt. It is not shown as paid.' };
    }
    return { kind: 'confirmed', payment, receipt };
  }
  if (payment.status === 'failed') {
    return {
      kind: 'failed',
      payment,
      message: payment.failure?.message ?? 'The payment did not complete. No receipt was issued.',
    };
  }
  if (payment.status === 'submitted') {
    return { kind: 'pending', payment, message: payment.note ?? 'Sent to Stellar. Waiting for independent confirmation.' };
  }
  return { kind: 'unverified', payment, message: 'The service sent a payment status this app does not recognise. It is not shown as paid.' };
}

export type PollOptions = {
  intervalMs?: number;
  timeoutMs?: number;
  sleep?: (ms: number) => Promise<void>;
  now?: () => number;
};

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Polls until the server gives a settled answer or the time budget runs out. Running out of time returns `pending`,
 * never confirmed. A poll that fails to reach the server keeps trying and ends as pending, not as success.
 */
export async function awaitConfirmation(
  first: ApiPayment,
  quote: Pick<ApiQuote, 'quoteId' | 'billId'>,
  options: PollOptions = {},
): Promise<FundingOutcome> {
  const { intervalMs = 2_000, timeoutMs = 60_000, sleep = defaultSleep, now = Date.now } = options;
  const deadline = now() + timeoutMs;
  let outcome = classifyPayment(first, quote);
  while (outcome.kind === 'pending' && now() < deadline) {
    await sleep(intervalMs);
    try {
      outcome = classifyPayment(await getPayment(first.paymentId), quote);
    } catch {
      outcome = { kind: 'pending', payment: outcome.payment, message: 'Could not reach the service to check. Still waiting for confirmation.' };
    }
  }
  if (outcome.kind === 'pending') {
    return {
      ...outcome,
      message: 'Sent to Stellar, but the service has not confirmed it yet. It is not counted as paid until it is confirmed. Check again in a moment.',
    };
  }
  return outcome;
}

/** Quote from the server, refused unless it matches what the supporter asked for. */
export async function fetchVerifiedQuote(request: QuoteInput, idempotencyKey: string): Promise<ApiQuote> {
  const quote = await requestQuote(request, idempotencyKey);
  verifyQuote(quote, request);
  return quote;
}

/** Asks the wallet to sign exactly the quoted transaction, and refuses anything but that transaction plus a signature. */
export async function signQuote(quote: ApiQuote, wallet: Pick<WalletAdapter, 'signTransaction'>, now: number = Date.now()): Promise<string> {
  if (Date.parse(quote.expiresAt) <= now) {
    throw new FundingError('quote_expired', 'This quote expired before it was signed. Nothing was paid. Request a new quote.');
  }
  const signedXdr = await wallet.signTransaction({ unsignedXdr: quote.unsignedXdr, networkPassphrase: quote.networkPassphrase });
  verifySignedMatchesUnsigned(quote.unsignedXdr, signedXdr, quote.networkPassphrase);
  return signedXdr;
}

/** Submits the signed payment and waits for the server's independent confirmation. */
export async function submitAndConfirm(
  quote: ApiQuote,
  signedXdr: string,
  idempotencyKey: string,
  options: PollOptions & { onSubmitted?: () => void } = {},
): Promise<FundingOutcome> {
  const payment = await submitSignedPayment({ quoteId: quote.quoteId, signedXdr }, idempotencyKey);
  options.onSubmitted?.();
  return awaitConfirmation(payment, quote, options);
}
