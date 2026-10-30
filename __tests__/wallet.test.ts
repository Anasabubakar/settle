import { Networks } from '@stellar/stellar-sdk';

import {
  WalletError,
  assertExpectedNetwork,
  assertSignable,
  createUnavailableWallet,
  describeWalletError,
  getWalletAdapter,
} from '@/services/wallet';

const session = (networkPassphrase: string) => ({ publicKey: 'GABC', networkPassphrase });

describe('wallet guards', () => {
  it('accepts the testnet session and refuses another network', () => {
    expect(() => assertExpectedNetwork(session(Networks.TESTNET))).not.toThrow();
    expect(() => assertExpectedNetwork(session(Networks.PUBLIC))).toThrow(WalletError);
    try {
      assertExpectedNetwork(session(Networks.PUBLIC));
    } catch (e) {
      expect((e as WalletError).code).toBe('wrong_network');
      expect((e as WalletError).message).toMatch(/Stellar Testnet/);
    }
  });
  it('refuses empty, oversized or wrong-network payloads', () => {
    const ok = { unsignedXdr: 'AAAA', networkPassphrase: Networks.TESTNET };
    expect(() => assertSignable(ok)).not.toThrow();
    expect(() => assertSignable({ ...ok, unsignedXdr: '' })).toThrow(/could not be prepared/);
    expect(() => assertSignable({ ...ok, unsignedXdr: 'A'.repeat(20_001) })).toThrow(WalletError);
    expect(() => assertSignable({ ...ok, networkPassphrase: Networks.PUBLIC })).toThrow(/different Stellar network/);
  });
});

describe('unavailable wallet', () => {
  it('reports why and refuses to connect or sign', async () => {
    const wallet = createUnavailableWallet('no wallet', 'https://example.test');
    expect(await wallet.availability()).toEqual({ available: false, reason: 'no wallet', installUrl: 'https://example.test' });
    await expect(wallet.connect()).rejects.toMatchObject({ code: 'unavailable' });
    await expect(wallet.signTransaction({ unsignedXdr: 'A', networkPassphrase: Networks.TESTNET })).rejects.toMatchObject({ code: 'unavailable' });
  });
  it('native default is the unavailable wallet', async () => {
    expect((await getWalletAdapter().availability()).available).toBe(false);
  });
});

describe('describeWalletError', () => {
  it('shows wallet messages and a safe fallback', () => {
    expect(describeWalletError(new WalletError('rejected', 'You declined.'))).toBe('You declined.');
    expect(describeWalletError(new Error('boom'))).toMatch(/Nothing was paid/);
  });
});
