# Settle × Stellar: readiness boundary

## Product thesis

Settle is an evidence-led bill settlement app: a requester uploads a bill, the platform extracts and redacts relevant fields, verifies the recipient, and lets a supporter fund an exact amount. A Kind Gesture is optional and cannot make a contribution conditional on access, labor, publicity, or a relationship.

The project should not become another generic escrow. The Stellar Drips Wave already includes payment products, escrow infrastructure, crowdfunding, and routing. Settle's distinct contribution is the **verified invoice-to-payment authorization and receipt layer** for provider-direct support.

## Architecture decision

Use a classic Stellar payment for provider-direct USDC settlement first. A Soroban contract is not load-bearing on this route and adds custody, audit, and recovery risk. Add one only if a later milestone needs conditional release, split disbursement, or an on-chain attestation that a signed server receipt cannot safely provide.

```
Expo client → settlement API → verified quote + unsigned XDR → wallet signs
                                           ↓
                         provider directory / rate lock / policy checks
wallet → Stellar network → observer/indexer → immutable receipt
```

The client never holds a signing key, creates an exchange quote, picks an asset issuer, or constructs a payment destination from an uploaded document.

## Required before mainnet

1. Identity and provider verification, upload provenance, and redaction before model/review workflows.
2. Quote service returning a fee-disclosed, expiring USDC amount, asset issuer, provider destination, opaque quote ID, and unsigned transaction/XDR. Fiat minor units are never USDC cents.
3. Web and mobile wallet adapters that sign only the server-produced payload.
4. Idempotent submission, independent confirmation, failure recovery, and an append-only receipt/indexer.
5. Fraud controls, rate limits, legal/compliance review for the operating jurisdictions, disputes/refunds, monitoring, and an incident runbook.

## Contracts: explicit non-decision

No Soroban contract exists here. If later justified, it belongs in a separate Rust repository with unit, integration, and adversarial tests; upgrade/immutability decisions; event coverage; testnet deployment records; and an audit plan. The app remains independently buildable.

## Environment posture

- Default: testnet preview. UI must never imply that it settled a real payment.
- Mainnet candidate: enabled only with `EXPO_PUBLIC_STELLAR_NETWORK=mainnet` and a settlement API. This config is not a production approval.
- Asset issuer: returned by each verified quote. Do not hard-code an issuer from a tutorial, fixture, or another provider's docs.

## Settlement API contract

The contract for verified quotes, signed-payment submission, confirmation and receipts is defined as OpenAPI 3.1 in the `settle-api` repository (`openapi.yaml`, https://github.com/Anasabubakar/settle-api once published), with a reference testnet implementation, an architecture note and a threat model next to it. Rules the contract enforces:

- The client sends a bill, an amount in fiat minor units, and its own source account. It never sends a destination, asset issuer, rate, fee, memo or network; requests carrying them are rejected.
- A quote returns an expiring, single-use, fee-disclosed amount and an **unsigned** transaction. The wallet signs exactly that XDR.
- Submission requires an `Idempotency-Key`. The server verifies the signed transaction matches the quote before submitting, then confirms independently against the network before issuing a hash-chained receipt.
- Examples and fixtures are testnet only.

Client side: `src/services/settlement-client.ts` calls the API when `EXPO_PUBLIC_SETTLEMENT_API_URL` is set, and `src/services/wallet.ts` defines the wallet adapter boundary (Freighter on web, an explicit "unavailable" adapter on mobile).

Related: [privacy and evidence retention](privacy-evidence.md), [reduced motion](reduced-motion.md).

## Current implementation

- The Expo client has the Stellar SDK, environment-selected network config, a verified server-quote authorization type, and production gating.
- It has a wallet adapter interface (Freighter on web; explicit unavailable state on mobile) and a settlement API client behind `EXPO_PUBLIC_SETTLEMENT_API_URL`. The default flow remains a testnet preview and signs nothing.
- The settlement API exists as a testnet reference implementation with fixture providers and rates, proven against the live Stellar testnet.
- It does not yet have authentication, a production provider directory, a real rate source, mobile wallet signing, a production indexer, or a contract.
- Funding remains a testnet preview until those services exist and are verified.

## Build order

1. Settlement API and provider directory with an OpenAPI contract and threat model.
2. Testnet quote → wallet signature → submission → confirmation with idempotency tests.
3. Receipt/indexer and provider reconciliation.
4. Closed testnet pilot covering expiry, duplicate, and failed payments.
5. Security/compliance/operational review and cross-device wallet QA before mainnet.
