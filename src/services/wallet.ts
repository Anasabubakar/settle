import { STELLAR_NETWORK } from '@/services/stellar';

/**
 * Wallet boundary. The app never holds a key and never builds a transaction:
 * an adapter connects, checks the network, and signs the exact XDR the settlement server produced.
 */
export type WalletErrorCode =
  | 'unavailable'
  | 'rejected'
  | 'wrong_network'
  | 'not_connected'
  | 'invalid_payload'
  | 'failed';

export class WalletError extends Error {
  readonly code: WalletErrorCode;
  constructor(code: WalletErrorCode, message: string) {
    super(message);
    this.name = 'WalletError';
    this.code = code;
  }
}

export type WalletAvailability =
  | { available: true }
  | { available: false; reason: string; installUrl?: string };

export type WalletSession = {
  /** The supporter's public key (G…). Never a secret. */
  publicKey: string;
  networkPassphrase: string;
};

export type SignRequest = {
  /** Unsigned transaction XDR exactly as returned by the settlement API. */
  unsignedXdr: string;
  networkPassphrase: string;
};

export interface WalletAdapter {
  readonly id: string;
  readonly label: string;
  availability(): Promise<WalletAvailability>;
  connect(): Promise<WalletSession>;
  /** Returns the signed XDR. Must not alter, rebuild or re-encode the transaction. */
  signTransaction(request: SignRequest): Promise<string>;
}

/** Throws unless the wallet is on the network this build is configured for. */
export function assertExpectedNetwork(session: WalletSession, expected = STELLAR_NETWORK.passphrase) {
  if (session.networkPassphrase !== expected) {
    throw new WalletError(
      'wrong_network',
      `Your wallet is on a different Stellar network. Switch it to ${STELLAR_NETWORK.label} and try again.`,
    );
  }
}

/** Throws unless the payload is non-empty and targets this build's network. */
export function assertSignable(request: SignRequest, expected = STELLAR_NETWORK.passphrase) {
  if (!request.unsignedXdr || request.unsignedXdr.length > 20_000) {
    throw new WalletError('invalid_payload', 'The payment could not be prepared. Request a new quote.');
  }
  if (request.networkPassphrase !== expected) {
    throw new WalletError('wrong_network', 'The payment is for a different Stellar network than this app.');
  }
}

/** Adapter used wherever no real wallet exists (native today, or no extension installed). */
export function createUnavailableWallet(reason: string, installUrl?: string): WalletAdapter {
  const fail = () => {
    throw new WalletError('unavailable', reason);
  };
  return {
    id: 'unavailable',
    label: 'No wallet',
    availability: async () => ({ available: false, reason, ...(installUrl ? { installUrl } : {}) }),
    connect: async () => fail(),
    signTransaction: async () => fail(),
  };
}

/** Human-readable text for any wallet failure, safe to show and to announce to a screen reader. */
export function describeWalletError(error: unknown): string {
  if (error instanceof WalletError) return error.message;
  return 'The wallet could not complete the request. Nothing was paid.';
}

/** Native default: no mobile wallet is wired yet, so say so plainly instead of pretending. */
export function getWalletAdapter(): WalletAdapter {
  return createUnavailableWallet(
    'Wallet signing is not available in the mobile app yet. This build shows a testnet preview only.',
  );
}
