import { Asset, Keypair, Memo, Networks, Operation, TransactionBuilder, Account } from '@stellar/stellar-sdk';

export const PASSPHRASE = Networks.TESTNET;
export const supporter = Keypair.random();
export const issuer = Keypair.random();
export const provider = Keypair.random();
export const stranger = Keypair.random();

export function buildUnsigned(overrides: Partial<{ destination: string; issuer: string; amount: string; memo: string; source: string; maxTime: number; code: string }> = {}) {
  const source = new Account(overrides.source ?? supporter.publicKey(), '1');
  const tx = new TransactionBuilder(source, {
    fee: '100',
    networkPassphrase: PASSPHRASE,
    timebounds: { minTime: 0, maxTime: overrides.maxTime ?? Math.floor(Date.now() / 1000) + 300 },
    memo: Memo.text(overrides.memo ?? 'SETTLE-q1'),
  })
    .addOperation(
      Operation.payment({
        destination: overrides.destination ?? provider.publicKey(),
        asset: new Asset(overrides.code ?? 'USDC', overrides.issuer ?? issuer.publicKey()),
        amount: overrides.amount ?? '10.0000000',
      }),
    )
    .build();
  return tx;
}

export function makeQuote(overrides: Record<string, unknown> = {}, txOverrides: Parameters<typeof buildUnsigned>[0] = {}) {
  const tx = buildUnsigned(txOverrides);
  return {
    quoteId: 'q_abc123',
    billId: 'bill-maya-prescription',
    usdcAmountStroops: '100000000',
    assetIssuer: issuer.publicKey(),
    destination: provider.publicKey(),
    memo: 'SETTLE-q1',
    expiresAt: new Date(Date.now() + 300_000).toISOString(),
    networkPassphrase: PASSPHRASE,
    unsignedXdr: tx.toXDR(),
    state: 'open',
    source: supporter.publicKey(),
    fiat: { amountMinor: '1000', currency: 'USD' },
    usdc: { amountStroops: '100000000', amount: '10.0000000', assetCode: 'USDC', assetIssuer: issuer.publicKey() },
    ...overrides,
  };
}

export const EXPECTED = { billId: 'bill-maya-prescription', amountMinor: 1000, currency: 'USD', sourceAccount: supporter.publicKey() };

export function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response;
}
