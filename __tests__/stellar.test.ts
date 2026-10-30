import { Networks } from '@stellar/stellar-sdk';

type StellarModule = typeof import('@/services/stellar');
const ENV_KEYS = ['EXPO_PUBLIC_STELLAR_NETWORK', 'EXPO_PUBLIC_STELLAR_HORIZON_URL', 'EXPO_PUBLIC_STELLAR_RPC_URL', 'EXPO_PUBLIC_SETTLE_API_URL', 'EXPO_PUBLIC_SETTLEMENT_API_URL'] as const;

function load(env: Partial<Record<(typeof ENV_KEYS)[number], string>> = {}): StellarModule {
  for (const key of ENV_KEYS) delete process.env[key];
  Object.assign(process.env, env);
  let mod!: StellarModule;
  jest.isolateModules(() => {
    mod = require('@/services/stellar');
  });
  return mod;
}

afterEach(() => {
  for (const key of ENV_KEYS) delete process.env[key];
});

describe('network selection', () => {
  it('defaults to testnet with testnet endpoints', () => {
    const s = load();
    expect(s.stellarNetwork).toBe('testnet');
    expect(s.STELLAR_NETWORK.passphrase).toBe(Networks.TESTNET);
    expect(s.STELLAR_NETWORK.horizonUrl).toBe('https://horizon-testnet.stellar.org');
    expect(s.STELLAR_NETWORK.label).toBe('Stellar Testnet');
    expect(s.explorerTransactionUrl('abc')).toBe('https://stellar.expert/explorer/testnet/tx/abc');
  });
  it('treats any unrecognised value as testnet', () => {
    for (const value of ['', 'TESTNET', 'public', 'main', ' mainnet']) {
      expect(load({ EXPO_PUBLIC_STELLAR_NETWORK: value }).stellarNetwork).toBe('testnet');
    }
  });
  it('allows overriding the testnet Horizon URL', () => {
    expect(load({ EXPO_PUBLIC_STELLAR_HORIZON_URL: 'http://localhost:8000' }).STELLAR_NETWORK.horizonUrl).toBe('http://localhost:8000');
  });
  it('encodes the explorer hash', () => {
    expect(load().explorerTransactionUrl('a/b?c')).toBe('https://stellar.expert/explorer/testnet/tx/a%2Fb%3Fc');
  });
});

describe('mainnet is gated', () => {
  it('uses the public passphrase only when explicitly requested, and never enables live settlement', () => {
    const s = load({ EXPO_PUBLIC_STELLAR_NETWORK: 'mainnet', EXPO_PUBLIC_SETTLE_API_URL: 'https://api.example.com' });
    expect(s.stellarNetwork).toBe('mainnet');
    expect(s.STELLAR_NETWORK.passphrase).toBe(Networks.PUBLIC);
    expect(s.settlementMode()).toBe('mainnet_blocked');
    expect(s.canUseLiveSettlement()).toBe(false);
    expect(s.settlementModeLabel()).toBe('Mainnet disabled');
    expect(s.explorerTransactionUrl('x')).toContain('/explorer/public/');
  });
});

describe('settlement mode', () => {
  it('is demo without an API URL', () => {
    const s = load();
    expect(s.settlementApiUrl()).toBeUndefined();
    expect(s.settlementMode()).toBe('demo');
    expect(s.canUseLiveSettlement()).toBe(false);
    expect(s.settlementModeLabel()).toBe('Demo (simulated)');
  });
  it('is testnet with a valid API URL, trimming trailing slashes', () => {
    const s = load({ EXPO_PUBLIC_SETTLE_API_URL: 'http://localhost:8787//' });
    expect(s.settlementApiUrl()).toBe('http://localhost:8787');
    expect(s.settlementMode()).toBe('testnet');
    expect(s.canUseLiveSettlement()).toBe(true);
    expect(s.settlementModeLabel()).toBe('Testnet settlement');
  });
  it('ignores a malformed or non-http URL', () => {
    expect(load({ EXPO_PUBLIC_SETTLE_API_URL: 'ftp://x' }).settlementMode()).toBe('demo');
    expect(load({ EXPO_PUBLIC_SETTLE_API_URL: '::' }).settlementMode()).toBe('demo');
  });
});

describe('createPaymentAuthorization', () => {
  const quote = (over = {}) => ({ quoteId: 'q_1', usdcAmountStroops: '1', assetIssuer: 'GI', destination: 'GD', memo: 'm', expiresAt: new Date(Date.now() + 60_000).toISOString(), ...over });
  it('accepts a live server quote', () => {
    const s = load();
    expect(s.createPaymentAuthorization('b', quote()).networkPassphrase).toBe(Networks.TESTNET);
  });
  it('refuses a missing bill, destination, issuer or id', () => {
    const s = load();
    expect(() => s.createPaymentAuthorization('', quote())).toThrow(/verified server quote/);
    expect(() => s.createPaymentAuthorization('b', quote({ destination: '' }))).toThrow(/verified server quote/);
    expect(() => s.createPaymentAuthorization('b', quote({ assetIssuer: '' }))).toThrow(/verified server quote/);
    expect(() => s.createPaymentAuthorization('b', quote({ quoteId: '' }))).toThrow(/verified server quote/);
  });
  it('refuses an expired quote', () => {
    const s = load();
    expect(() => s.createPaymentAuthorization('b', quote({ expiresAt: new Date(Date.now() - 1).toISOString() }))).toThrow(/expired/);
  });
});
