#!/usr/bin/env node
/**
 * Creates a throwaway Stellar TESTNET environment for running the funding flow against a local settle-api.
 *
 *   node scripts/local-testnet/setup.mjs ../settle-api
 *
 * It funds accounts with friendbot, self-issues a test "USDC", gives a supporter 500 of it, and writes
 * .local-testnet/ (git-ignored): data/ (provider + bill fixtures whose destinations are accounts we control, so
 * payments can actually land), env.sh (settle-api settings) and accounts.json (testnet-only secrets).
 * Nothing here touches mainnet. The secrets are worthless testnet keys.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Asset, Horizon, Keypair, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const apiDir = resolve(process.argv[2] ?? join(root, '../settle-api'));
const out = join(root, '.local-testnet');
const horizon = new Horizon.Server('https://horizon-testnet.stellar.org');

const providersFixture = JSON.parse(readFileSync(join(apiDir, 'data/providers.testnet.json'), 'utf8'));
const billsFixture = JSON.parse(readFileSync(join(apiDir, 'data/bills.testnet.json'), 'utf8'));

async function friendbot(publicKey) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(publicKey)}`);
    if (response.ok) return;
    await new Promise((r) => setTimeout(r, 1500 * attempt));
  }
  throw new Error(`friendbot would not fund ${publicKey}`);
}

async function send(signer, operation) {
  const account = await horizon.loadAccount(signer.publicKey());
  const tx = new TransactionBuilder(account, { fee: '1000', networkPassphrase: Networks.TESTNET }).addOperation(operation).setTimeout(60).build();
  tx.sign(signer);
  await horizon.submitTransaction(tx);
}

const issuer = Keypair.random();
const supporter = Keypair.random();
const providers = providersFixture.providers.map((p) => ({ ...p, keypair: Keypair.random() }));

console.log('Funding throwaway testnet accounts...');
for (const account of [issuer, supporter, ...providers.map((p) => p.keypair)]) await friendbot(account.publicKey());
const usdc = new Asset('USDC', issuer.publicKey());
await send(supporter, Operation.changeTrust({ asset: usdc }));
for (const p of providers) await send(p.keypair, Operation.changeTrust({ asset: usdc }));
await send(issuer, Operation.payment({ destination: supporter.publicKey(), asset: usdc, amount: '500.0000000' }));

mkdirSync(join(out, 'data'), { recursive: true });
writeFileSync(
  join(out, 'data/providers.testnet.json'),
  JSON.stringify({ _notice: 'LOCAL TESTNET ONLY. Destinations are throwaway accounts created by setup.mjs.', providers: providers.map(({ keypair, ...p }) => ({ ...p, destination: keypair.publicKey() })) }, null, 2),
);
writeFileSync(join(out, 'data/bills.testnet.json'), JSON.stringify(billsFixture, null, 2));
writeFileSync(
  join(out, 'accounts.json'),
  JSON.stringify({ network: 'testnet', issuer: { public: issuer.publicKey() }, supporter: { public: supporter.publicKey(), secret: supporter.secret() }, providers: providers.map((p) => ({ id: p.id, public: p.keypair.publicKey() })) }, null, 2),
);
writeFileSync(
  join(out, 'env.sh'),
  [
    `export SETTLE_USDC_ISSUER=${issuer.publicKey()}`,
    'export HOST=127.0.0.1',
    'export PORT=8787',
    'export SETTLE_CORS_ORIGINS=http://localhost:8081,http://localhost:4173',
    `export SETTLE_DATA_DIR=${join(out, 'state')}`,
    '',
  ].join('\n'),
);
console.log(`Done. Supporter ${supporter.publicKey()} holds 500 test USDC.\nWrote ${out}`);
