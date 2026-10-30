/*
 * Browser stand-in for the Freighter extension's content script, for LOCAL TESTING ONLY.
 * Paste into the page (or inject before load). It answers the same window.postMessage protocol that
 * @stellar/freighter-api speaks, and signs through scripts/local-testnet/signer.mjs.
 *
 *   window.__mockFreighter.mode = 'ok' | 'refuse' | 'mismatch' | 'missing'
 */
(() => {
  const SIGNER = 'http://127.0.0.1:8788';
  const PASSPHRASE = 'Test SDF Network ; September 2015';
  const state = (window.__mockFreighter = window.__mockFreighter || { mode: 'ok', log: [] });
  if (state.installed) return;
  state.installed = true;
  window.addEventListener('message', async (event) => {
    const msg = event.data;
    if (event.source !== window || !msg || msg.source !== 'FREIGHTER_EXTERNAL_MSG_REQUEST') return;
    state.log.push(msg.type);
    if (state.mode === 'missing') return; // no extension: freighter-api times out
    const reply = (payload) =>
      window.postMessage({ source: 'FREIGHTER_EXTERNAL_MSG_RESPONSE', messagedId: msg.messageId, ...payload }, window.location.origin);
    const address = (await (await fetch(`${SIGNER}/address`)).json()).address;
    switch (msg.type) {
      case 'REQUEST_CONNECTION_STATUS': return reply({ isConnected: true });
      case 'REQUEST_ALLOWED_STATUS': return reply({ isAllowed: true });
      case 'REQUEST_PUBLIC_KEY':
      case 'REQUEST_ACCESS':
        return state.mode === 'refuse' ? reply({ publicKey: '', apiError: { code: -4, message: 'The user declined access' } }) : reply({ publicKey: address });
      case 'REQUEST_NETWORK_DETAILS':
        return reply({ networkDetails: { network: 'TESTNET', networkName: 'Test Net', networkUrl: 'https://horizon-testnet.stellar.org', networkPassphrase: PASSPHRASE } });
      case 'SUBMIT_TRANSACTION': {
        if (state.mode === 'refuse') return reply({ signedTransaction: '', signerAddress: '', apiError: { code: -4, message: 'The user declined access' } });
        const r = await (await fetch(`${SIGNER}/sign`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ xdr: msg.transactionXdr }) })).json();
        if (state.mode === 'mismatch') return reply({ signedTransaction: r.signedXdr.slice(0, -8) + 'AAAAAAAA', signerAddress: address });
        return reply({ signedTransaction: r.signedXdr, signerAddress: address });
      }
      default: return reply({ apiError: { code: -1, message: 'unsupported in mock' } });
    }
  });
})();
