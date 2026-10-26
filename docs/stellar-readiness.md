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

## Current implementation

- The Expo client has the Stellar SDK, environment-selected network config, a verified server-quote authorization type, and production gating.
- It does not yet have a live wallet adapter, payment API, quote engine, provider directory, indexer, or contract.
- Funding remains a testnet preview until those services exist and are verified.

## Build order

1. Settlement API and provider directory with an OpenAPI contract and threat model.
2. Testnet quote → wallet signature → submission → confirmation with idempotency tests.
3. Receipt/indexer and provider reconciliation.
4. Closed testnet pilot covering expiry, duplicate, and failed payments.
5. Security/compliance/operational review and cross-device wallet QA before mainnet.
