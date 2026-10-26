import { Networks } from '@stellar/stellar-sdk';

/** Client-safe configuration: secrets, quotes and destinations stay server-side. */
const runtime = {
  network: process.env.EXPO_PUBLIC_STELLAR_NETWORK ?? 'testnet',
  horizonUrl: process.env.EXPO_PUBLIC_STELLAR_HORIZON_URL,
  rpcUrl: process.env.EXPO_PUBLIC_STELLAR_RPC_URL,
  settlementApiUrl: process.env.EXPO_PUBLIC_SETTLEMENT_API_URL,
} as const;

export type StellarNetworkName = 'testnet' | 'mainnet';

export const stellarNetwork: StellarNetworkName = runtime.network === 'mainnet' ? 'mainnet' : 'testnet';

export const STELLAR_NETWORK = stellarNetwork === 'mainnet'
  ? {
      label: 'Stellar Mainnet',
      passphrase: Networks.PUBLIC,
      horizonUrl: runtime.horizonUrl ?? 'https://horizon.stellar.org',
      rpcUrl: runtime.rpcUrl ?? 'https://mainnet.sorobanrpc.com',
    }
  : {
      label: 'Stellar Testnet',
      passphrase: Networks.TESTNET,
      horizonUrl: runtime.horizonUrl ?? 'https://horizon-testnet.stellar.org',
      rpcUrl: runtime.rpcUrl ?? 'https://soroban-testnet.stellar.org',
    };

export type SettlementQuote = {
  /** Issued after provider verification and a rate lock. */
  quoteId: string;
  /** USDC stroops; never derive this from a fiat bill amount in the client. */
  usdcAmountStroops: string;
  /** Exact issuer from the settlement server for this network. */
  assetIssuer: string;
  /** Exact provider destination resolved by the settlement server. */
  destination: string;
  memo: string;
  expiresAt: string;
};

export type PaymentAuthorization = {
  billId: string;
  quote: SettlementQuote;
  networkPassphrase: string;
};

export type PaymentLifecycle = 'draft' | 'quote_requested' | 'awaiting_signature' | 'submitted' | 'confirmed' | 'failed';

export function canUseLiveSettlement() {
  return stellarNetwork === 'mainnet' && Boolean(runtime.settlementApiUrl);
}

export function settlementModeLabel() {
  return canUseLiveSettlement() ? 'Mainnet settlement' : 'Testnet preview';
}

export function createPaymentAuthorization(billId: string, quote: SettlementQuote): PaymentAuthorization {
  if (!billId || !quote.quoteId || !quote.destination || !quote.assetIssuer) {
    throw new Error('A verified server quote is required before a Stellar payment can be authorized.');
  }
  if (Date.parse(quote.expiresAt) <= Date.now()) {
    throw new Error('This settlement quote has expired. Request a new quote before signing.');
  }
  return { billId, quote, networkPassphrase: STELLAR_NETWORK.passphrase };
}

export function explorerTransactionUrl(hash: string) {
  const networkPath = stellarNetwork === 'mainnet' ? 'public' : 'testnet';
  return `https://stellar.expert/explorer/${networkPath}/tx/${encodeURIComponent(hash)}`;
}
