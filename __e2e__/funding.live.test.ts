/** @jest-environment node */
/**
 * Opt-in end-to-end test of the app's service layer against a RUNNING local settle-api and the real Stellar testnet.
 * Not part of `npm test`. Run with: npm run test:e2e-local (see docs/deployment.md, "Local end to end").
 * The wallet is a testnet keypair signing in-process, the same stand-in scripts/e2e-testnet.ts uses.
 */
import { readFileSync } from 'node:fs';
import http from 'node:http';
import { join } from 'node:path';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';

import { fetchVerifiedQuote, signQuote, submitAndConfirm, FundingError } from '@/services/funding-flow';
import { SettlementApiError, getBill, getReceipt, newIdempotencyKey, requestQuote, submitSignedPayment } from '@/services/settlement-client';

const accounts = JSON.parse(readFileSync(join(__dirname, '../.local-testnet/accounts.json'), 'utf8'));
const keypair = Keypair.fromSecret(accounts.supporter.secret);
const wallet = {
  signTransaction: async ({ unsignedXdr, networkPassphrase }: { unsignedXdr: string; networkPassphrase: string }) => {
    const tx = TransactionBuilder.fromXDR(unsignedXdr, networkPassphrase);
    tx.sign(keypair);
    return tx.toXDR();
  },
};
const request = (billId: string, amountMinor: number, currency: string) => ({ billId, amountMinor, currency, sourceAccount: keypair.publicKey() });

jest.setTimeout(120_000);

// jest-expo replaces global fetch with a stub, so the live test talks to the API through node:http.
globalThis.fetch = ((url: string, init: RequestInit = {}) =>
  new Promise((resolve, reject) => {
    const req = http.request(url, { method: init.method, headers: init.headers as Record<string, string> }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ ok: (res.statusCode ?? 0) < 300, status: res.statusCode, json: async () => JSON.parse(data) } as Response));
    });
    req.on('error', reject);
    init.signal?.addEventListener('abort', () => req.destroy(Object.assign(new Error('aborted'), { name: 'AbortError' })));
    if (init.body) req.write(init.body as string);
    req.end();
  })) as typeof fetch;

beforeAll(() => {
  process.env.EXPO_PUBLIC_SETTLE_API_URL = process.env.LOCAL_API_URL ?? 'http://127.0.0.1:8787';
});

it('quote -> verify -> sign -> submit -> independent confirmation -> receipt', async () => {
  const before = await getBill('bill-amina-electricity');
  const quote = await fetchVerifiedQuote(request('bill-amina-electricity', 10000, 'NGN'), newIdempotencyKey());
  expect(quote.fees?.platform?.bps).toBe(0);
  expect(quote.rate?.source).toBe('testnet-fixture');
  const signedXdr = await signQuote(quote, wallet);
  const outcome = await submitAndConfirm(quote, signedXdr, newIdempotencyKey());
  expect(outcome.kind).toBe('confirmed');
  if (outcome.kind !== 'confirmed') return;
  expect(outcome.receipt.txHash).toBe(outcome.payment.txHash);
  expect((await getReceipt(outcome.receipt.id)).txHash).toBe(outcome.payment.txHash);
  const after = await getBill('bill-amina-electricity');
  expect(Number(after.fundedMinor) - Number(before.fundedMinor)).toBe(10000);
  console.log('confirmed', outcome.payment.txHash, outcome.receipt.id);
});

it('refuses a client-chosen destination end to end', async () => {
  const bad = { ...request('bill-amina-electricity', 10000, 'NGN'), destination: Keypair.random().publicKey() };
  // the client strips it, so the server accepts a normal quote and the destination is the server's
  const quote = await requestQuote(bad as never, newIdempotencyKey());
  expect(quote.destination).not.toBe(bad.destination);
});

it('shows a wrong-signer or tampered signed payment as refused, not paid', async () => {
  const quote = await fetchVerifiedQuote(request('bill-amina-electricity', 10000, 'NGN'), newIdempotencyKey());
  const stranger = Keypair.random();
  const tx = TransactionBuilder.fromXDR(quote.unsignedXdr, quote.networkPassphrase);
  tx.sign(stranger);
  const error = await submitSignedPayment({ quoteId: quote.quoteId, signedXdr: tx.toXDR() }, newIdempotencyKey()).catch((e: unknown) => e);
  expect(error).toBeInstanceOf(SettlementApiError);
  expect((error as SettlementApiError).code).toBe('invalid_signature');
});

it('rejects a wallet that returns a different transaction before anything is submitted', async () => {
  const quote = await fetchVerifiedQuote(request('bill-amina-electricity', 10000, 'NGN'), newIdempotencyKey());
  const lying = { signTransaction: async () => (await wallet.signTransaction({ unsignedXdr: (await fetchVerifiedQuote(request('bill-amina-electricity', 11000, 'NGN'), newIdempotencyKey())).unsignedXdr, networkPassphrase: quote.networkPassphrase })) };
  await expect(signQuote(quote, lying)).rejects.toBeInstanceOf(FundingError);
});

it('reports an unknown bill and an over-remaining amount as refusals', async () => {
  await expect(getBill('bill-does-not-exist')).rejects.toMatchObject({ status: 404 });
  await expect(fetchVerifiedQuote(request('bill-amina-electricity', 999_999_999, 'NGN'), newIdempotencyKey())).rejects.toMatchObject({ code: expect.stringMatching(/exceeds_remaining|insufficient_balance/) });
});
