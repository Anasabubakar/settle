import { createUnavailableWallet, type WalletAdapter } from '@/services/wallet-core';

// Shared types and guards live in wallet-core so wallet.web.ts can import them without resolving to itself.
export * from '@/services/wallet-core';

/** Native default: no mobile wallet is wired yet, so say so plainly instead of pretending. */
export function getWalletAdapter(): WalletAdapter {
  return createUnavailableWallet(
    'Wallet signing is not available in the mobile app yet. This build shows a testnet preview only.',
  );
}
