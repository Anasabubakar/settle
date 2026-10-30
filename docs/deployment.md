# Deployment notes (web, testnet prototype)

This describes how the static web build is hosted and how it talks to `settle-api`. Nothing here has been deployed by
this repository, and it does not make Settle production-ready; see [What is not production-ready](#what-is-not-production-ready).

## Web hosting on Vercel

`app.json` sets `web.output` to `static`, so `npx expo export --platform web` writes one HTML file per route plus
hashed assets into `dist/` (about 5.4 MB on disk; about 0.9 MB of JavaScript after gzip; `_expo/static` 4.0 MB,
`assets` 0.7 MB). `vercel.json` configures the rest:

| Setting | Value | Why |
|---|---|---|
| `buildCommand` / `outputDirectory` | `npx expo export --platform web` / `dist` | Static export, no server |
| `cleanUrls` | `true` | `/discover` serves `discover.html` |
| rewrite | `/((?!_expo/\|assets/\|favicon\.ico).*)` to `/index.html` | Unknown deep links get the app shell (the router then shows its not-found screen, with HTTP 200). Assets are excluded so a missing file stays a 404 instead of returning HTML |
| headers | `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` (camera, microphone, geolocation, payment, usb off), HSTS (1 year, includeSubDomains, no preload), `X-Frame-Options: DENY`, CSP | See below |
| cache | `immutable` for `/_expo/static/*` and `/assets/*` | Hashed file names |

Environment variables (set in the Vercel project; they are inlined into the public bundle at build time, so never put a
secret in one):

| Variable | Meaning |
|---|---|
| `EXPO_PUBLIC_SETTLE_API_URL` | Base URL of settle-api. **Unset = demo mode**: the funding sheet says "Demo (simulated)", signs nothing and sends nothing. The older name `EXPO_PUBLIC_SETTLEMENT_API_URL` is still read. |
| `EXPO_PUBLIC_STELLAR_NETWORK` | `testnet` (default). `mainnet` is treated as blocked: the funding sheet shows "Mainnet disabled" and never starts a payment. |
| `EXPO_PUBLIC_STELLAR_HORIZON_URL`, `EXPO_PUBLIC_STELLAR_RPC_URL` | Optional overrides. The app does not call Horizon or Soroban RPC from the browser today; they are only configuration constants. |

### Content Security Policy

```
default-src 'none'; script-src 'self' 'sha256-67fhrP0+BkBqmgGGXTtgiVO/9EQs3QruYNU/7fnRkI8=';
style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';
manifest-src 'self'; base-uri 'none'; form-action 'none'; object-src 'none'; frame-ancestors 'none'
```

- **Scripts are not `'unsafe-inline'`.** The Expo Router static export contains exactly one inline script,
  `globalThis.__EXPO_ROUTER_HYDRATE__=true;`, which is allowed by its SHA-256 hash. If an Expo upgrade changes that script,
  the hash changes: `__tests__/vercel-config.test.ts` pins the current text, and a browser check will show a violation.
  There is no `'unsafe-eval'`.
- **`style-src` needs `'unsafe-inline'`.** react-native-web writes its style rules into inline `<style>` elements at
  runtime, and the export inlines a reset style block. This is the one relaxed directive; everything else is strict.
- **`connect-src` hosts the app needs:** `'self'` (route chunks), and the settle-api origin when
  `EXPO_PUBLIC_SETTLE_API_URL` is set. Nothing else: Horizon testnet is not called directly, Freighter talks to the page
  through the extension's `window.postMessage` bridge (no network request from the page), fonts are bundled, and
  stellar.expert is only a link the user navigates to. In demo mode the CSP therefore stays `connect-src 'self'`.
- **Adding the API origin is a manual edit.** `vercel.json` cannot read environment variables, so for a deployment that
  sets `EXPO_PUBLIC_SETTLE_API_URL=https://api.example.com`, edit `connect-src` to
  `'self' https://api.example.com` in `vercel.json` before deploying. Keep the two in step.
- Frames are refused via both `frame-ancestors 'none'` and `X-Frame-Options: DENY`.

### Checking a build locally

```bash
npx expo export --platform web
node scripts/serve-dist.mjs dist 4173          # serves with vercel.json's headers, clean URLs and fallback
CSP_CONNECT_EXTRA="http://localhost:8787" node scripts/serve-dist.mjs dist 4173   # test with an API origin added
```

`scripts/serve-dist.mjs` is a checking aid, not a production server. Checked in a browser with the CSP applied: all 12
routes load (`/`, `/discover`, `/activity`, `/post`, `/profile`, `/onboarding`, `/how-it-works`, `/faq`, `/about`,
`/privacy`, `/terms`, `/guidelines`), an unknown deep link shows the not-found screen, and the browser console reported no
CSP violations, including during a complete funding flow against a local settle-api.

Expo also exports `/_sitemap` (a list of routes) and `/+not-found`; they are harmless but public.

## Running settle-api

See the settle-api README and `docs/docker.md` there. Minimum:

```bash
export SETTLE_USDC_ISSUER=<testnet USDC issuer>
export SETTLE_CORS_ORIGINS=https://your-app.example.com   # exact browser origin(s); bare origins only
npm start                                                  # 127.0.0.1:8787, testnet only
```

`SETTLE_CORS_ORIGINS` must contain the exact origin the web app is served from (scheme, host, port; no path, trailing
slash or wildcard). The service refuses to start on a malformed entry. Put TLS and any access control in front of it;
the service itself has no authentication.

## Local end to end (real testnet, no real money)

```bash
node scripts/local-testnet/setup.mjs ../settle-api         # friendbot accounts, self-issued test USDC, fixtures we control
cd .local-testnet && (set -a; . ./env.sh; set +a; node ../../settle-api/src/server.ts)   # settle-api on :8787
node scripts/local-testnet/signer.mjs                      # only for the browser stand-in wallet below
EXPO_PUBLIC_SETTLE_API_URL=http://localhost:8787 npx expo export --platform web --output-dir /tmp/dist-live
CSP_CONNECT_EXTRA="http://localhost:8787 http://127.0.0.1:8788" node scripts/serve-dist.mjs /tmp/dist-live 4173
npm run test:e2e-local                                     # service-layer test against the running API
```

With the real Freighter extension (set to Testnet, account funded and holding a USDC trustline for the issuer in
`.local-testnet/env.sh`) no stand-in is needed. Without it, paste `scripts/local-testnet/mock-freighter.js` into the page:
it answers the same `postMessage` protocol and signs through the local test signer. It is a test double, not Freighter.

The fixture providers shipped with settle-api have destinations nobody controls, so payments to them cannot land;
`setup.mjs` writes fixtures whose destinations it controls.

## What is not production-ready

- **No authentication or identity.** Anyone who can reach settle-api can request quotes (bounded by rate limits and
  bill totals).
- **Fixtures.** Providers, bills and exchange rates are testnet fixtures labelled as such; no provider is verified and
  the rates are not market data.
- **Snapshot file store.** State is one file on one machine; no database, no backup, no multi-instance support.
- **Mainnet is disabled** in both repositories (settle-api refuses to start; the app reports "Mainnet disabled").
- **Simulated AI review and sample data** in the app's bill cards are fixtures, not a review process.
- **Wallet support is Freighter on desktop web only.** The mobile builds show a preview and cannot sign.
- No monitoring, alerting, audit or security review has been done.
