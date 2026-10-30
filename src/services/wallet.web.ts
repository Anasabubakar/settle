import {
  assertExpectedNetwork,
  assertSignable,
  createUnavailableWallet,
  WalletError,
  type WalletAdapter,
} from '@/services/wallet';

const FREIGHTER_URL = 'https://www.freighter.app';

type FreighterApi = typeof import('@stellar/freighter-api');

async function loadFreighterApi(): Promise<FreighterApi> {
  return import('@stellar/freighter-api');
}

function freighterError(error: { message?: string } | undefined, fallback: string): WalletError {
  const text = (error?.message ?? '').toLowerCase();
  if (text.includes('declined') || text.includes('reject') || text.includes('denied')) {
    return new WalletError('rejected', 'You declined the request in your wallet. Nothing was paid.');
  }
  return new WalletError('failed', fallback);
}

/** Freighter, the browser extension wallet. Signs the server's XDR and nothing else. */
export function createFreighterWallet(loadFreighter: () => Promise<FreighterApi> = loadFreighterApi): WalletAdapter {
  return {
    id: 'freighter',
    label: 'Freighter',
    async availability() {
      try {
        const api = await loadFreighter();
        const result = await api.isConnected();
        if (result.isConnected) return { available: true };
      } catch {
        // fall through to the unavailable answer
      }
      return {
        available: false,
        reason: 'Freighter was not found in this browser. Install it to sign testnet payments.',
        installUrl: FREIGHTER_URL,
      };
    },
    async connect() {
      const api = await loadFreighter();
      const access = await api.requestAccess();
      if (access.error) throw freighterError(access.error, 'Freighter could not connect.');
      const details = await api.getNetworkDetails();
      if (details.error) throw freighterError(details.error, 'Freighter could not report its network.');
      const session = { publicKey: access.address, networkPassphrase: details.networkPassphrase };
      assertExpectedNetwork(session);
      return session;
    },
    async signTransaction(request) {
      assertSignable(request);
      const api = await loadFreighter();
      const connected = await api.isConnected();
      if (!connected.isConnected) throw new WalletError('not_connected', 'Connect your wallet first.');
      const signed = await api.signTransaction(request.unsignedXdr, {
        networkPassphrase: request.networkPassphrase,
      });
      if (signed.error) throw freighterError(signed.error, 'Freighter could not sign the payment.');
      return signed.signedTxXdr;
    },
  };
}

export function getWalletAdapter(): WalletAdapter {
  return typeof window === 'undefined'
    ? createUnavailableWallet('Wallet signing is only available in a browser.')
    : createFreighterWallet();
}
