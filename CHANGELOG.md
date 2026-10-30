# Changelog

## v1.1.0 — 2026-10-30

- Add informational pages: `/how-it-works`, `/guidelines`, `/about`, `/faq`, `/privacy` and `/terms`, written from the code and docs, with built, simulated and not-built labels.
- Add a site header menu, footer (product, open source and legal links, version, "Testnet prototype" label), a testnet status strip and a skip link. Native apps get a More section on the Profile screen.
- Set a document title and meta description on every web route; export static HTML per route (`web.output` is now `static`).
- Add visible keyboard focus styles.
- Correct landing page copy that implied mainnet, verified bills and instant settlement. It now says testnet, sample data and preview.
- Replace the four-pointed star glyph in the UI and label the header balance as sample data.
- Add an opt-in testnet funding flow: with `EXPO_PUBLIC_SETTLE_API_URL` set, the supporter sees a server quote with fees and expiry, signs the exact transaction in Freighter on desktop web, and gets a receipt only after the API confirms it from the network. Without it the app stays in a labelled demo mode.
- Fix `wallet.web.ts` importing itself, which left shared wallet exports undefined on web.
- Add 114 unit tests for the settlement client, funding flow, wallet guards and amount parsing, and run them in CI.
- Add `vercel.json` (SPA fallback, security headers, strict Content-Security-Policy) and `docs/deployment.md`.
- Reword copy that overstated payment protection, provider verification and data handling.
- Bump the app version to 1.1.0.

## v0.1.0 — 2026-10-26

First public release: Expo web/Android/iOS client, bill evidence picker, AI-review UI, direct-support guardrails, Lottie motion, and Stellar testnet/quote foundations.
