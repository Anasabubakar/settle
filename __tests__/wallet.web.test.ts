import { Networks } from '@stellar/stellar-sdk';

import { createFreighterWallet } from '@/services/wallet.web';

// wallet.web.ts loads the Freighter API lazily; tests inject a fake instead of importing the real extension bridge.
const freighter: Record<string, jest.Mock> = {
  isConnected: jest.fn(),
  requestAccess: jest.fn(),
  getNetworkDetails: jest.fn(),
  signTransaction: jest.fn(),
};
const wallet = () => createFreighterWallet(async () => freighter as never);
const request = { unsignedXdr: 'AAAA', networkPassphrase: Networks.TESTNET };

describe('Freighter adapter', () => {
  it('reports availability from the extension', async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    expect(await wallet().availability()).toEqual({ available: true });
    freighter.isConnected.mockResolvedValue({ isConnected: false });
    expect(await wallet().availability()).toMatchObject({ available: false, installUrl: 'https://www.freighter.app' });
    freighter.isConnected.mockRejectedValue(new Error('no extension'));
    expect((await wallet().availability()).available).toBe(false);
  });

  it('connects on testnet and refuses a wallet on another network', async () => {
    freighter.requestAccess.mockResolvedValue({ address: 'GABC' });
    freighter.getNetworkDetails.mockResolvedValue({ networkPassphrase: Networks.TESTNET });
    expect(await wallet().connect()).toEqual({ publicKey: 'GABC', networkPassphrase: Networks.TESTNET });
    freighter.getNetworkDetails.mockResolvedValue({ networkPassphrase: Networks.PUBLIC });
    await expect(wallet().connect()).rejects.toMatchObject({ code: 'wrong_network' });
  });

  it('maps a declined access request to rejected', async () => {
    freighter.requestAccess.mockResolvedValue({ address: '', error: { message: 'The user declined access' } });
    await expect(wallet().connect()).rejects.toMatchObject({ code: 'rejected' });
  });

  it('signs the exact XDR it was given with the app network passphrase', async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.signTransaction.mockResolvedValue({ signedTxXdr: 'SIGNED', signerAddress: 'GABC' });
    expect(await wallet().signTransaction(request)).toBe('SIGNED');
    expect(freighter.signTransaction).toHaveBeenCalledWith('AAAA', { networkPassphrase: Networks.TESTNET });
  });

  it('maps a refusal in the wallet to rejected and other errors to failed', async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: true });
    freighter.signTransaction.mockResolvedValue({ signedTxXdr: '', error: { message: 'User declined access' } });
    await expect(wallet().signTransaction(request)).rejects.toMatchObject({ code: 'rejected' });
    freighter.signTransaction.mockResolvedValue({ signedTxXdr: '', error: { message: 'internal' } });
    await expect(wallet().signTransaction(request)).rejects.toMatchObject({ code: 'failed' });
  });

  it('refuses to sign when not connected or when the payload is for another network', async () => {
    freighter.isConnected.mockResolvedValue({ isConnected: false });
    await expect(wallet().signTransaction(request)).rejects.toMatchObject({ code: 'not_connected' });
    await expect(wallet().signTransaction({ ...request, networkPassphrase: Networks.PUBLIC })).rejects.toMatchObject({ code: 'wrong_network' });
    expect(freighter.signTransaction).not.toHaveBeenCalled();
  });
});

describe('platform parity', () => {
  it('wallet.web exports everything wallet.ts does, because Metro resolves @/services/wallet to the .web file on web', () => {
    const native = require('@/services/wallet') as Record<string, unknown>;
    const web = require('@/services/wallet.web') as Record<string, unknown>;
    for (const name of Object.keys(native)) expect(web[name]).toBeDefined();
  });
});
